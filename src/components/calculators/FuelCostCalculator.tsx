import { useState } from 'react';

interface Result {
  liters: number;
  cost: number;
  perKm: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function FuelCostCalculator() {
  const [distance, setDistance] = useState('');
  const [mileage, setMileage] = useState('');
  const [price, setPrice] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const d = parseFloat(distance);
    const m = parseFloat(mileage);
    const p = parseFloat(price);
    if (!d || !m || !p || d <= 0 || m <= 0 || p <= 0) {
      setError('Please enter valid positive numbers in all fields.');
      return;
    }
    const liters = d / m;
    setResult({ liters, cost: liters * p, perKm: (liters * p) / d });
  }

  function copyResult() {
    if (!result) return;
    const text = [
      'Fuel Cost Calculator — GlobalsBlog',
      `Distance: ${distance} km`,
      `Fuel Efficiency: ${mileage} km/L`,
      `Fuel Price: ₹${price}/L`,
      `Fuel Required: ${result.liters.toFixed(2)} L`,
      `Total Fuel Cost: ${fmt(result.cost)}`,
      `Cost per km: ₹${result.perKm.toFixed(2)}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const text = `Fuel cost for my ${distance} km trip: ${fmt(result.cost)} (₹${result.perKm.toFixed(2)}/km). Calculated on GlobalsBlog!`;
    if (navigator.share) {
      navigator.share({ title: 'Fuel Cost Calculator', text, url: window.location.href });
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
              <label className="calc-label" htmlFor="fc-distance">Distance (km)</label>
              <input id="fc-distance" className="calc-input" type="number" min="1" step="any"
                placeholder="e.g. 500" value={distance} onChange={e => setDistance(e.target.value)} required />
              <p className="calc-hint">Total trip distance</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="fc-mileage">Fuel Efficiency (km/L)</label>
              <input id="fc-mileage" className="calc-input" type="number" min="1" step="0.1"
                placeholder="e.g. 15" value={mileage} onChange={e => setMileage(e.target.value)} required />
              <p className="calc-hint">Your car's average mileage</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="fc-price">Fuel Price (₹/L)</label>
              <input id="fc-price" className="calc-input" type="number" min="1" step="0.01"
                placeholder="e.g. 102" value={price} onChange={e => setPrice(e.target.value)} required />
              <p className="calc-hint">Current petrol/diesel price</p>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Calculate Fuel Cost</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">Your Fuel Cost Breakdown</h3>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">Total Fuel Cost</span>
              <span className="calc-result-value">{fmt(result.cost)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Fuel Required</span>
              <span className="calc-result-num">{result.liters.toFixed(2)} L</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Cost per km</span>
              <span className="calc-result-num">₹{result.perKm.toFixed(2)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Cost per 100 km</span>
              <span className="calc-result-num">{fmt(result.perKm * 100)}</span>
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
