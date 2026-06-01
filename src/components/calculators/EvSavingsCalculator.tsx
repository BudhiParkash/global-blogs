import { useState } from 'react';

interface Result {
  petrolMonthly: number;
  evMonthly: number;
  monthlySavings: number;
  yearlySavings: number;
  petrolPerKm: number;
  evPerKm: number;
  breakEvenMonths: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDec = (n: number, d = 2) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: d }).format(n);

export default function EvSavingsCalculator() {
  const [monthlyKm, setMonthlyKm] = useState('');
  const [petrolMileage, setPetrolMileage] = useState('');
  const [petrolPrice, setPetrolPrice] = useState('');
  const [evEfficiency, setEvEfficiency] = useState('');
  const [electricityRate, setElectricityRate] = useState('');
  const [evPremium, setEvPremium] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const km = parseFloat(monthlyKm);
    const pm = parseFloat(petrolMileage);
    const pp = parseFloat(petrolPrice);
    const ev = parseFloat(evEfficiency) || 6;
    const er = parseFloat(electricityRate);
    const premium = parseFloat(evPremium) || 0;

    if (!km || !pm || !pp || !er || km <= 0 || pm <= 0 || pp <= 0 || er <= 0) {
      setError('Please fill all required fields with valid positive numbers.');
      return;
    }

    const petrolPerKm = pp / pm;
    const evPerKm = er / ev;
    const petrolMonthly = km * petrolPerKm;
    const evMonthly = km * evPerKm;
    const monthlySavings = petrolMonthly - evMonthly;
    const yearlySavings = monthlySavings * 12;
    const breakEvenMonths = premium > 0 && monthlySavings > 0 ? Math.ceil(premium / monthlySavings) : 0;

    setResult({ petrolMonthly, evMonthly, monthlySavings, yearlySavings, petrolPerKm, evPerKm, breakEvenMonths });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      'EV Savings Calculator — GlobalsBlog',
      `Monthly distance: ${monthlyKm} km`,
      `Petrol cost/month: ${fmt(result.petrolMonthly)}`,
      `EV cost/month: ${fmt(result.evMonthly)}`,
      `Monthly savings: ${fmt(result.monthlySavings)}`,
      `Yearly savings: ${fmt(result.yearlySavings)}`,
      result.breakEvenMonths > 0 ? `EV breaks even in: ${result.breakEvenMonths} months` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const text = `Switching to an EV could save me ${fmt(result.yearlySavings)}/year! Calculated on GlobalsBlog.`;
    if (navigator.share) {
      navigator.share({ title: 'EV Savings Calculator', text, url: window.location.href });
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
              <label className="calc-label" htmlFor="ev-km">Monthly Distance (km)</label>
              <input id="ev-km" className="calc-input" type="number" min="1" step="any"
                placeholder="e.g. 1500" value={monthlyKm} onChange={e => setMonthlyKm(e.target.value)} required />
              <p className="calc-hint">Average km you drive per month</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ev-petrol-mileage">Petrol Car Mileage (km/L)</label>
              <input id="ev-petrol-mileage" className="calc-input" type="number" min="1" step="0.1"
                placeholder="e.g. 14" value={petrolMileage} onChange={e => setPetrolMileage(e.target.value)} required />
              <p className="calc-hint">Your current car's mileage</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ev-petrol-price">Petrol Price (₹/L)</label>
              <input id="ev-petrol-price" className="calc-input" type="number" min="1" step="0.01"
                placeholder="e.g. 102" value={petrolPrice} onChange={e => setPetrolPrice(e.target.value)} required />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ev-efficiency">EV Efficiency (km/kWh)</label>
              <input id="ev-efficiency" className="calc-input" type="number" min="1" step="0.1"
                placeholder="e.g. 6" value={evEfficiency} onChange={e => setEvEfficiency(e.target.value)} />
              <p className="calc-hint">Typical Indian EVs: 5–7 km/kWh</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ev-electricity">Electricity Rate (₹/kWh)</label>
              <input id="ev-electricity" className="calc-input" type="number" min="1" step="0.1"
                placeholder="e.g. 8" value={electricityRate} onChange={e => setElectricityRate(e.target.value)} required />
              <p className="calc-hint">Home charging rate per unit</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="ev-premium">EV Price Premium (₹) <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
              <input id="ev-premium" className="calc-input" type="number" min="0" step="1000"
                placeholder="e.g. 200000" value={evPremium} onChange={e => setEvPremium(e.target.value)} />
              <p className="calc-hint">Extra cost of EV vs petrol variant for break-even calc</p>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Calculate EV Savings</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">Your EV Savings Estimate</h3>
          <div className="calc-compare-grid">
            <div className="calc-compare-col">
              <div className="calc-compare-col-title">⛽ Petrol Car</div>
              <div className="calc-compare-main">{fmt(result.petrolMonthly)}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/mo</span></div>
              <div className="calc-compare-sub">₹{fmtDec(result.petrolPerKm)}/km running cost</div>
            </div>
            <div className="calc-compare-col winner">
              <div className="calc-compare-col-title">⚡ Electric Vehicle <span className="winner-badge">CHEAPER</span></div>
              <div className="calc-compare-main">{fmt(result.evMonthly)}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/mo</span></div>
              <div className="calc-compare-sub">₹{fmtDec(result.evPerKm)}/km running cost</div>
            </div>
          </div>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">Yearly Savings with EV</span>
              <span className="calc-result-value">{fmt(result.yearlySavings)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Monthly Savings</span>
              <span className="calc-result-num">{fmt(result.monthlySavings)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">5-Year Savings</span>
              <span className="calc-result-num">{fmt(result.yearlySavings * 5)}</span>
            </div>
            {result.breakEvenMonths > 0 && (
              <div className="calc-result-item">
                <span className="calc-result-label">Break-Even Period</span>
                <span className="calc-result-num">{result.breakEvenMonths} months</span>
                <span className="calc-result-note">~{Math.ceil(result.breakEvenMonths / 12)} years</span>
              </div>
            )}
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
