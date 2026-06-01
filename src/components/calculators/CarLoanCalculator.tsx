import { useState } from 'react';

interface Result {
  emi: number;
  loanAmount: number;
  totalPayable: number;
  totalInterest: number;
  interestRatio: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function CarLoanCalculator() {
  const [carPrice, setCarPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const price = parseFloat(carPrice);
    const down = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate);
    const years = parseFloat(tenure);

    if (!price || !rate || !years || price <= 0 || rate <= 0 || years <= 0) {
      setError('Please enter valid values for car price, interest rate, and tenure.');
      return;
    }
    if (down >= price) {
      setError('Down payment cannot be equal to or more than the car price.');
      return;
    }

    const loanAmount = price - down;
    const r = rate / 100 / 12;
    const n = years * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - loanAmount;

    setResult({ emi, loanAmount, totalPayable, totalInterest, interestRatio: (totalInterest / totalPayable) * 100 });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      'Car Loan EMI Calculator — GlobalsBlog',
      `Car Price: ${fmt(parseFloat(carPrice))}`,
      `Down Payment: ${fmt(parseFloat(downPayment) || 0)}`,
      `Loan Amount: ${fmt(result.loanAmount)}`,
      `Interest Rate: ${interestRate}% p.a.`,
      `Tenure: ${tenure} years`,
      `Monthly EMI: ${fmt(result.emi)}`,
      `Total Interest: ${fmt(result.totalInterest)}`,
      `Total Payable: ${fmt(result.totalPayable)}`,
    ].join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const text = `My car loan EMI: ${fmt(result.emi)}/month for a ${fmt(parseFloat(carPrice))} car. Total payable: ${fmt(result.totalPayable)}. Calculate yours on GlobalsBlog!`;
    if (navigator.share) {
      navigator.share({ title: 'Car Loan EMI Calculator', text, url: window.location.href });
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
              <label className="calc-label" htmlFor="cl-price">Car Price (₹)</label>
              <input id="cl-price" className="calc-input" type="number" min="50000" step="1000"
                placeholder="e.g. 1000000" value={carPrice} onChange={e => setCarPrice(e.target.value)} required />
              <p className="calc-hint">On-road price of the car</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="cl-down">Down Payment (₹)</label>
              <input id="cl-down" className="calc-input" type="number" min="0" step="1000"
                placeholder="e.g. 200000" value={downPayment} onChange={e => setDownPayment(e.target.value)} />
              <p className="calc-hint">Leave 0 if no down payment</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="cl-rate">Interest Rate (% p.a.)</label>
              <input id="cl-rate" className="calc-input" type="number" min="1" max="30" step="0.01"
                placeholder="e.g. 8.5" value={interestRate} onChange={e => setInterestRate(e.target.value)} required />
              <p className="calc-hint">Banks typically offer 7%–12%</p>
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="cl-tenure">Loan Tenure (years)</label>
              <select id="cl-tenure" className="calc-select" value={tenure} onChange={e => setTenure(e.target.value)} required>
                <option value="">Select tenure</option>
                {[1,2,3,4,5,6,7].map(y => <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Calculate EMI</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">Your Car Loan Breakdown</h3>
          <div className="calc-results-grid">
            <div className="calc-result-highlight">
              <span className="calc-result-label">Monthly EMI</span>
              <span className="calc-result-value">{fmt(result.emi)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Loan Amount</span>
              <span className="calc-result-num">{fmt(result.loanAmount)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Total Interest</span>
              <span className="calc-result-num">{fmt(result.totalInterest)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Total Payable</span>
              <span className="calc-result-num">{fmt(result.totalPayable)}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Interest Portion</span>
              <span className="calc-result-num">{result.interestRatio.toFixed(1)}%</span>
              <span className="calc-result-note">of total amount paid</span>
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
