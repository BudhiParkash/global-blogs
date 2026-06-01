import { useState } from 'react';

interface Result {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  shopping: number;
  misc: number;
  total: number;
  perPerson: number;
  perDay: number;
  dailyBudget: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const pct = (part: number, total: number) => total > 0 ? ((part / total) * 100).toFixed(0) + '%' : '0%';

export default function TravelBudgetPlanner() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [accomPerNight, setAccomPerNight] = useState('');
  const [foodPerDayPerson, setFoodPerDayPerson] = useState('');
  const [transportBudget, setTransportBudget] = useState('');
  const [activitiesPerDay, setActivitiesPerDay] = useState('');
  const [shoppingBudget, setShoppingBudget] = useState('');
  const [miscBuffer, setMiscBuffer] = useState('10');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const d = parseInt(days);
    const n = parseInt(travelers);
    if (!d || !n || d <= 0 || n <= 0) {
      setError('Please enter valid trip duration and number of travellers.');
      return;
    }

    const accom = (parseFloat(accomPerNight) || 0) * d * Math.ceil(n / 2);
    const food = (parseFloat(foodPerDayPerson) || 0) * d * n;
    const transport = parseFloat(transportBudget) || 0;
    const activities = (parseFloat(activitiesPerDay) || 0) * d * n;
    const shopping = parseFloat(shoppingBudget) || 0;
    const subtotal = accom + food + transport + activities + shopping;
    const bufferPct = parseFloat(miscBuffer) || 10;
    const misc = Math.round(subtotal * (bufferPct / 100));
    const total = Math.round(subtotal + misc);

    setResult({
      accommodation: Math.round(accom),
      food: Math.round(food),
      transport: Math.round(transport),
      activities: Math.round(activities),
      shopping: Math.round(shopping),
      misc,
      total,
      perPerson: Math.round(total / n),
      perDay: Math.round(total / d),
      dailyBudget: Math.round(total / d / n),
    });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      `Travel Budget Plan${destination ? ' — ' + destination : ''} | GlobalsBlog`,
      `Duration: ${days} days | Travellers: ${travelers}`,
      `Accommodation: ${fmt(result.accommodation)}`,
      `Food & Dining: ${fmt(result.food)}`,
      `Transport: ${fmt(result.transport)}`,
      `Activities & Sightseeing: ${fmt(result.activities)}`,
      `Shopping: ${fmt(result.shopping)}`,
      `Emergency Buffer (${miscBuffer}%): ${fmt(result.misc)}`,
      `─────────────────────`,
      `Total Budget: ${fmt(result.total)}`,
      `Per Person: ${fmt(result.perPerson)}`,
      `Per Day (all): ${fmt(result.perDay)}`,
    ].join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const text = `My ${destination || 'trip'} budget for ${travelers} travellers, ${days} days: ${fmt(result.total)} (${fmt(result.perPerson)}/person). Planned on GlobalsBlog!`;
    if (navigator.share) {
      navigator.share({ title: 'Travel Budget Planner', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
    }
  }

  const categories = result ? [
    { label: 'Accommodation', value: result.accommodation, icon: '🏨' },
    { label: 'Food & Dining', value: result.food, icon: '🍽' },
    { label: 'Transport', value: result.transport, icon: '🚌' },
    { label: 'Activities', value: result.activities, icon: '🎟' },
    { label: 'Shopping', value: result.shopping, icon: '🛍' },
    { label: `Buffer (${miscBuffer}%)`, value: result.misc, icon: '🛡' },
  ] : [];

  return (
    <div className="calc-card">
      <div className="calc-card-inner">
        <form className="calc-form" onSubmit={calculate} noValidate>
          <div className="calc-grid-3">
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-dest">Destination</label>
              <input id="bp-dest" className="calc-input" type="text"
                placeholder="e.g. Rajasthan" value={destination} onChange={e => setDestination(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-days">Trip Duration (days)</label>
              <input id="bp-days" className="calc-input" type="number" min="1" max="60" step="1"
                placeholder="e.g. 7" value={days} onChange={e => setDays(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-travelers">Number of Travellers</label>
              <input id="bp-travelers" className="calc-input" type="number" min="1" max="20" step="1"
                placeholder="e.g. 2" value={travelers} onChange={e => setTravelers(e.target.value)} required />
            </div>
          </div>
          <div className="calc-grid-2">
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-accom">Hotel / Stays (₹/room/night)</label>
              <input id="bp-accom" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 2500" value={accomPerNight} onChange={e => setAccomPerNight(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-food">Food (₹/person/day)</label>
              <input id="bp-food" className="calc-input" type="number" min="0" step="50"
                placeholder="e.g. 700" value={foodPerDayPerson} onChange={e => setFoodPerDayPerson(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-transport">Total Transport Budget (₹)</label>
              <input id="bp-transport" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 8000" value={transportBudget} onChange={e => setTransportBudget(e.target.value)} />
              <p className="calc-hint">Flights, train, buses — all combined</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-activities">Activities (₹/person/day)</label>
              <input id="bp-activities" className="calc-input" type="number" min="0" step="50"
                placeholder="e.g. 500" value={activitiesPerDay} onChange={e => setActivitiesPerDay(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-shopping">Shopping Budget (₹ total)</label>
              <input id="bp-shopping" className="calc-input" type="number" min="0" step="100"
                placeholder="e.g. 5000" value={shoppingBudget} onChange={e => setShoppingBudget(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="bp-misc">Emergency Buffer (%)</label>
              <select id="bp-misc" className="calc-select" value={miscBuffer} onChange={e => setMiscBuffer(e.target.value)}>
                <option value="5">5% — tight budget</option>
                <option value="10">10% — recommended</option>
                <option value="15">15% — comfortable</option>
                <option value="20">20% — generous</option>
              </select>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Plan My Budget</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">
            {destination ? `${destination} Travel Budget` : 'Your Travel Budget Plan'}
          </h3>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">Total Trip Budget</span>
              <span className="calc-result-value">{fmt(result.total)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Per Person</span>
              <span className="calc-result-num">{fmt(result.perPerson)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Per Day (group)</span>
              <span className="calc-result-num">{fmt(result.perDay)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Daily per Person</span>
              <span className="calc-result-num">{fmt(result.dailyBudget)}</span>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.6rem' }}>Budget Breakdown</p>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {categories.filter(c => c.value > 0).map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                  <span style={{ width: '1.4rem', textAlign: 'center' }}>{c.icon}</span>
                  <span style={{ flex: 1, color: 'var(--muted)' }}>{c.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink-strong)', minWidth: '80px', textAlign: 'right' }}>{fmt(c.value)}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.78rem', minWidth: '36px', textAlign: 'right' }}>{pct(c.value, result.total)}</span>
                </div>
              ))}
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
