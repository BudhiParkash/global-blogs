import { useState } from 'react';

interface Result {
  fuelCost: number;
  tollCost: number;
  accommodation: number;
  food: number;
  misc: number;
  total: number;
  perPerson: number;
  totalDistance: number;
  fuelLiters: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function RoadTripPlanner() {
  const [totalDistance, setTotalDistance] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [days, setDays] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [hotelPerNight, setHotelPerNight] = useState('');
  const [foodPerDayPerson, setFoodPerDayPerson] = useState('700');
  const [includeToll, setIncludeToll] = useState(true);
  const [miscActivities, setMiscActivities] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const dist = parseFloat(totalDistance);
    const mpg = parseFloat(mileage);
    const price = parseFloat(fuelPrice);
    const d = parseInt(days);
    const n = parseInt(travelers);
    const hotel = parseFloat(hotelPerNight) || 0;
    const food = parseFloat(foodPerDayPerson) || 700;
    const misc = parseFloat(miscActivities) || 0;

    if (!dist || !mpg || !price || !d || !n || dist <= 0 || mpg <= 0 || price <= 0 || d <= 0 || n <= 0) {
      setError('Please fill in distance, mileage, fuel price, days, and travellers.');
      return;
    }

    const fuelLiters = dist / mpg;
    const fuelCost = Math.round(fuelLiters * price);
    const tollCost = includeToll ? Math.round(dist * 1.7) : 0;
    const accommodationCost = Math.round(hotel * (d - 1) * Math.ceil(n / 2));
    const foodCost = Math.round(food * d * n);
    const miscCost = Math.round(misc);
    const total = fuelCost + tollCost + accommodationCost + foodCost + miscCost;

    setResult({
      fuelCost,
      tollCost,
      accommodation: accommodationCost,
      food: foodCost,
      misc: miscCost,
      total,
      perPerson: Math.round(total / n),
      totalDistance: dist,
      fuelLiters,
    });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      'Road Trip Cost Calculator — GlobalsBlog',
      `Distance: ${result.totalDistance} km | Days: ${days} | Travellers: ${travelers}`,
      `Fuel (${result.fuelLiters.toFixed(1)} L): ${fmt(result.fuelCost)}`,
      includeToll ? `Toll charges: ${fmt(result.tollCost)}` : '',
      `Accommodation: ${fmt(result.accommodation)}`,
      `Food: ${fmt(result.food)}`,
      result.misc > 0 ? `Activities & misc: ${fmt(result.misc)}` : '',
      `Total Road Trip Cost: ${fmt(result.total)}`,
      `Per Person: ${fmt(result.perPerson)}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const text = `My road trip (${result.totalDistance} km, ${days} days, ${travelers} people) will cost ${fmt(result.total)} — that's ${fmt(result.perPerson)}/person! Planned on GlobalsBlog.`;
    if (navigator.share) {
      navigator.share({ title: 'Road Trip Planner', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
    }
  }

  return (
    <div className="calc-card">
      <div className="calc-card-inner">
        <form className="calc-form" onSubmit={calculate} noValidate>
          <div className="calc-grid-3">
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-distance">Total Distance (km)</label>
              <input id="rt-distance" className="calc-input" type="number" min="1" step="any"
                placeholder="e.g. 1200" value={totalDistance} onChange={e => setTotalDistance(e.target.value)} required />
              <p className="calc-hint">Complete round-trip distance</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-mileage">Car Mileage (km/L)</label>
              <input id="rt-mileage" className="calc-input" type="number" min="1" step="0.1"
                placeholder="e.g. 14" value={mileage} onChange={e => setMileage(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-fuel">Fuel Price (₹/L)</label>
              <input id="rt-fuel" className="calc-input" type="number" min="1" step="0.01"
                placeholder="e.g. 102" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-days">Trip Duration (days)</label>
              <input id="rt-days" className="calc-input" type="number" min="1" max="60" step="1"
                placeholder="e.g. 4" value={days} onChange={e => setDays(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-travelers">Number of People</label>
              <input id="rt-travelers" className="calc-input" type="number" min="1" max="8" step="1"
                placeholder="e.g. 4" value={travelers} onChange={e => setTravelers(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-hotel">Hotel (₹/room/night)</label>
              <input id="rt-hotel" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 2000" value={hotelPerNight} onChange={e => setHotelPerNight(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-food">Food (₹/person/day)</label>
              <input id="rt-food" className="calc-input" type="number" min="0" step="50"
                placeholder="e.g. 700" value={foodPerDayPerson} onChange={e => setFoodPerDayPerson(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="rt-misc">Activities & Sightseeing (₹)</label>
              <input id="rt-misc" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 3000" value={miscActivities} onChange={e => setMiscActivities(e.target.value)} />
            </div>
            <div className="calc-field" style={{ justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-strong)', paddingTop: '1.6rem' }}>
                <input type="checkbox" checked={includeToll} onChange={e => setIncludeToll(e.target.checked)}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer' }} />
                Include toll estimates
              </label>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Plan My Road Trip</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">Your Road Trip Budget</h3>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">Total Road Trip Cost</span>
              <span className="calc-result-value">{fmt(result.total)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">⛽ Fuel Cost</span>
              <span className="calc-result-num">{fmt(result.fuelCost)}</span>
              <span className="calc-result-note">{result.fuelLiters.toFixed(1)} litres needed</span>
            </div>
            {result.tollCost > 0 && (
              <div className="calc-result-item">
                <span className="calc-result-label">🚧 Toll Charges</span>
                <span className="calc-result-num">{fmt(result.tollCost)}</span>
              </div>
            )}
            <div className="calc-result-item">
              <span className="calc-result-label">🏨 Accommodation</span>
              <span className="calc-result-num">{fmt(result.accommodation)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">🍽 Food & Meals</span>
              <span className="calc-result-num">{fmt(result.food)}</span>
            </div>
            {result.misc > 0 && (
              <div className="calc-result-item">
                <span className="calc-result-label">🎟 Activities</span>
                <span className="calc-result-num">{fmt(result.misc)}</span>
              </div>
            )}
            <div className="calc-result-item">
              <span className="calc-result-label">Per Person</span>
              <span className="calc-result-num">{fmt(result.perPerson)}</span>
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
