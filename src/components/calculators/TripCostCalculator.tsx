import { useState } from 'react';

interface Result {
  transport: number;
  hotel: number;
  food: number;
  misc: number;
  total: number;
  perPerson: number;
  perDay: number;
}

type TransportMode = 'flight' | 'train' | 'bus' | 'car';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const TRANSPORT_DEFAULTS: Record<TransportMode, { label: string; perPersonKm: number }> = {
  flight: { label: '✈ Flight',      perPersonKm: 5.5 },
  train:  { label: '🚂 Train',       perPersonKm: 0.7 },
  bus:    { label: '🚌 Bus',         perPersonKm: 0.45 },
  car:    { label: '🚗 Self-drive',  perPersonKm: 2.2 },
};

export default function TripCostCalculator() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState('');
  const [travelers, setTravelers] = useState('1');
  const [days, setDays] = useState('');
  const [hotelPerNight, setHotelPerNight] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('train');
  const [foodPerDayPerson, setFoodPerDayPerson] = useState('800');
  const [miscBudget, setMiscBudget] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const n = parseInt(travelers);
    const d = parseInt(days);
    const hotel = parseFloat(hotelPerNight) || 0;
    const dist = parseFloat(distance);
    const food = parseFloat(foodPerDayPerson) || 800;
    const misc = parseFloat(miscBudget) || 0;

    if (!n || !d || !dist || n <= 0 || d <= 0 || dist <= 0) {
      setError('Please fill in distance, number of travellers, and trip duration.');
      return;
    }

    const transportRate = TRANSPORT_DEFAULTS[transportMode].perPersonKm;
    const transportCost = dist * transportRate * n * 2; // round trip
    const hotelCost = hotel * (d - 1) * Math.ceil(n / 2); // rooms (2 per room)
    const foodCost = food * d * n;
    const totalMisc = misc + (dist * 0.015 * n); // local transport estimate

    const transport = Math.round(transportCost);
    const hotelTotal = Math.round(hotelCost);
    const foodTotal = Math.round(foodCost);
    const miscTotal = Math.round(totalMisc);
    const total = transport + hotelTotal + foodTotal + miscTotal;

    setResult({
      transport,
      hotel: hotelTotal,
      food: foodTotal,
      misc: miscTotal,
      total,
      perPerson: Math.round(total / n),
      perDay: Math.round(total / d),
    });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      'Trip Cost Calculator — GlobalsBlog',
      source && destination ? `Route: ${source} → ${destination}` : '',
      `Travelers: ${travelers} | Days: ${days}`,
      `Transport (${TRANSPORT_DEFAULTS[transportMode].label}): ${fmt(result.transport)}`,
      `Accommodation: ${fmt(result.hotel)}`,
      `Food & Dining: ${fmt(result.food)}`,
      `Misc & Local Travel: ${fmt(result.misc)}`,
      `Total Trip Cost: ${fmt(result.total)}`,
      `Per Person: ${fmt(result.perPerson)}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const route = source && destination ? `${source} to ${destination}` : 'my trip';
    const text = `Total estimated cost for ${route} (${travelers} travellers, ${days} days): ${fmt(result.total)}. Planned on GlobalsBlog!`;
    if (navigator.share) {
      navigator.share({ title: 'Trip Cost Calculator', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
    }
  }

  return (
    <div className="calc-card">
      <div className="calc-card-inner">
        <form className="calc-form" onSubmit={calculate} noValidate>
          <div className="calc-grid-2">
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-source">From (City)</label>
              <input id="tc-source" className="calc-input" type="text"
                placeholder="e.g. Mumbai" value={source} onChange={e => setSource(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-dest">To (Destination)</label>
              <input id="tc-dest" className="calc-input" type="text"
                placeholder="e.g. Goa" value={destination} onChange={e => setDestination(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-dist">One-way Distance (km)</label>
              <input id="tc-dist" className="calc-input" type="number" min="1" step="any"
                placeholder="e.g. 600" value={distance} onChange={e => setDistance(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-mode">Transport Mode</label>
              <select id="tc-mode" className="calc-select" value={transportMode}
                onChange={e => setTransportMode(e.target.value as TransportMode)}>
                {(Object.entries(TRANSPORT_DEFAULTS) as [TransportMode, typeof TRANSPORT_DEFAULTS[TransportMode]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-travelers">Number of Travellers</label>
              <input id="tc-travelers" className="calc-input" type="number" min="1" max="20" step="1"
                placeholder="e.g. 2" value={travelers} onChange={e => setTravelers(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-days">Trip Duration (days)</label>
              <input id="tc-days" className="calc-input" type="number" min="1" max="60" step="1"
                placeholder="e.g. 5" value={days} onChange={e => setDays(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-hotel">Hotel Budget (₹/night)</label>
              <input id="tc-hotel" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 2500" value={hotelPerNight} onChange={e => setHotelPerNight(e.target.value)} />
              <p className="calc-hint">Per room per night (0 if staying with family)</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tc-food">Food Budget (₹/person/day)</label>
              <input id="tc-food" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 800" value={foodPerDayPerson} onChange={e => setFoodPerDayPerson(e.target.value)} />
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Calculate Trip Cost</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">
            {source && destination ? `${source} → ${destination} Cost Estimate` : 'Your Trip Cost Estimate'}
          </h3>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">Total Trip Cost</span>
              <span className="calc-result-value">{fmt(result.total)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Transport (return)</span>
              <span className="calc-result-num">{fmt(result.transport)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Accommodation</span>
              <span className="calc-result-num">{fmt(result.hotel)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Food & Dining</span>
              <span className="calc-result-num">{fmt(result.food)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Misc & Local</span>
              <span className="calc-result-num">{fmt(result.misc)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Per Person</span>
              <span className="calc-result-num">{fmt(result.perPerson)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Per Day</span>
              <span className="calc-result-num">{fmt(result.perDay)}</span>
            </div>
          </div>
          <div className="calc-actions">
            <button className="calc-copy-btn" onClick={copyResult}>
              {copied ? '✓ Copied!' : '⎘ Copy Results'}
            </button>
            <button className="calc-share-btn" onClick={shareResult}>↗ Share</button>
          </div>
        </div>
      )}
    </div>
  );
}
