import { useState } from 'react';

interface Result {
  estimatedToll: number;
  withFastTag: number;
  distance: number;
  vehicleClass: string;
  approxBooths: number;
}

type VehicleType = 'car' | 'lcv' | 'bus' | 'truck' | 'multiaxle';

const RATES: Record<VehicleType, { label: string; ratePerKm: number; fastTagDiscount: number }> = {
  car:       { label: 'Car / Jeep / Van',          ratePerKm: 1.7,  fastTagDiscount: 0.05 },
  lcv:       { label: 'Light Commercial Vehicle',   ratePerKm: 2.75, fastTagDiscount: 0.05 },
  bus:       { label: 'Bus / Truck (2-axle)',        ratePerKm: 5.65, fastTagDiscount: 0.05 },
  truck:     { label: 'Heavy Vehicle (3-axle)',      ratePerKm: 6.15, fastTagDiscount: 0.05 },
  multiaxle: { label: 'Oversized / Multi-axle',     ratePerKm: 8.5,  fastTagDiscount: 0.05 },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function TollCalculator() {
  const [distance, setDistance] = useState('');
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const d = parseFloat(distance);
    if (!d || d <= 0) {
      setError('Please enter a valid distance in km.');
      return;
    }
    const rate = RATES[vehicle];
    const raw = d * rate.ratePerKm;
    const withFastTag = raw * (1 - rate.fastTagDiscount);
    const approxBooths = Math.max(1, Math.round(d / 60));
    setResult({
      estimatedToll: Math.round(raw),
      withFastTag: Math.round(withFastTag),
      distance: d,
      vehicleClass: rate.label,
      approxBooths,
    });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      'Road Toll Calculator — GlobalsBlog',
      `Distance: ${result.distance} km`,
      `Vehicle: ${result.vehicleClass}`,
      `Estimated Toll (cash): ${fmt(result.estimatedToll)}`,
      `With FASTag (5% off): ${fmt(result.withFastTag)}`,
      `Approx. toll booths: ${result.approxBooths}`,
      'Note: Estimates based on NHAI average rates. Actual tolls vary by highway.',
    ].join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const text = `Toll estimate for my ${result.distance} km highway trip: ${fmt(result.withFastTag)} with FASTag. Calculated on GlobalsBlog!`;
    if (navigator.share) {
      navigator.share({ title: 'Toll Calculator', text, url: window.location.href });
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
              <label className="calc-label" htmlFor="toll-dist">Highway Distance (km)</label>
              <input id="toll-dist" className="calc-input" type="number" min="1" step="any"
                placeholder="e.g. 400" value={distance} onChange={e => setDistance(e.target.value)} required />
              <p className="calc-hint">Total distance on national highway / expressway</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="toll-vehicle">Vehicle Type</label>
              <select id="toll-vehicle" className="calc-select" value={vehicle}
                onChange={e => setVehicle(e.target.value as VehicleType)}>
                {(Object.entries(RATES) as [VehicleType, typeof RATES[VehicleType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Estimate Toll Charges</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">Estimated Toll Charges</h3>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">With FASTag (recommended)</span>
              <span className="calc-result-value">{fmt(result.withFastTag)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Cash Toll (approx.)</span>
              <span className="calc-result-num">{fmt(result.estimatedToll)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">FASTag Savings (5%)</span>
              <span className="calc-result-num">{fmt(result.estimatedToll - result.withFastTag)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Approx. Toll Booths</span>
              <span className="calc-result-num">{result.approxBooths}</span>
              <span className="calc-result-note">on a typical NH/expressway</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 1rem' }}>
            * Estimates based on NHAI average rates. Actual toll charges vary by highway, state, and toll plaza.
          </p>
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
