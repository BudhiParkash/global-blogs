import { useState } from 'react';

interface Result {
  trainTotal: number;
  flightTotal: number;
  trainTime: number;
  flightTime: number;
  costDiff: number;
  timeDiff: number;
  costWinner: 'train' | 'flight';
  timeWinner: 'train' | 'flight';
  recommendation: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

function formatHours(h: number) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function TrainVsFlightCalculator() {
  const [route, setRoute] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [trainPrice, setTrainPrice] = useState('');
  const [trainDuration, setTrainDuration] = useState('');
  const [flightPrice, setFlightPrice] = useState('');
  const [flightDuration, setFlightDuration] = useState('');
  const [airportDistance, setAirportDistance] = useState('30');
  const [checkinTime, setCheckinTime] = useState('2');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const n = parseInt(travelers);
    const tp = parseFloat(trainPrice);
    const td = parseFloat(trainDuration);
    const fp = parseFloat(flightPrice);
    const fd = parseFloat(flightDuration);
    const apDist = parseFloat(airportDistance) || 30;
    const checkin = parseFloat(checkinTime) || 2;

    if (!n || !tp || !td || !fp || !fd || n <= 0 || tp <= 0 || td <= 0 || fp <= 0 || fd <= 0) {
      setError('Please fill in ticket prices and journey durations for both options.');
      return;
    }

    const trainTotal = tp * n;
    // flight: ticket + airport transfer both ways (auto ~₹15/km) + check-in time doesn't cost but adds time
    const airportTransferCost = apDist * 2 * 15 * Math.ceil(n / 4); // shared cab estimate
    const flightTotal = (fp * n) + airportTransferCost;

    const trainTime = td;
    const flightTime = fd + checkin + (apDist / 60) * 2; // drive to/from airport

    const costWinner: 'train' | 'flight' = trainTotal <= flightTotal ? 'train' : 'flight';
    const timeWinner: 'train' | 'flight' = trainTime <= flightTime ? 'train' : 'flight';

    const costDiff = Math.abs(flightTotal - trainTotal);
    const timeDiff = Math.abs(flightTime - trainTime);

    let recommendation = '';
    if (costWinner === 'train' && timeWinner === 'train') {
      recommendation = 'Train wins on both cost and total travel time. Choose the train — it is the clear winner for this route.';
    } else if (costWinner === 'flight' && timeWinner === 'flight') {
      recommendation = 'Flight wins on both cost and time. Book your flight for the best experience.';
    } else if (costWinner === 'train' && timeWinner === 'flight') {
      const savings = costDiff;
      const hrs = formatHours(timeDiff);
      recommendation = `Train saves ${fmt(savings)} but flight saves ${hrs} of travel time. If time is money, weigh your hourly value — for leisure travel, the train is usually the better choice.`;
    } else {
      recommendation = `Flight is cheaper by ${fmt(costDiff)}, but the train is faster by ${formatHours(timeDiff)} including airport transfers. If convenience matters most, flight is recommended.`;
    }

    setResult({ trainTotal, flightTotal, trainTime, flightTime, costDiff, timeDiff, costWinner, timeWinner, recommendation });
  }

  function copyResult() {
    if (!result) return;
    const lines = [
      `Train vs Flight Calculator${route ? ' — ' + route : ''} | GlobalsBlog`,
      `Travellers: ${travelers}`,
      `Train: ${fmt(result.trainTotal)} | ${formatHours(result.trainTime)} travel time`,
      `Flight: ${fmt(result.flightTotal)} | ${formatHours(result.flightTime)} total time (incl. airport)`,
      `Verdict: ${result.recommendation}`,
    ].join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareResult() {
    if (!result) return;
    const winner = result.costWinner === 'train' ? 'Train' : 'Flight';
    const text = `${winner} wins for my ${route || 'trip'}! Train: ${fmt(result.trainTotal)} vs Flight: ${fmt(result.flightTotal)}. Compare yours on GlobalsBlog!`;
    if (navigator.share) {
      navigator.share({ title: 'Train vs Flight Calculator', text, url: window.location.href });
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
              <label className="calc-label" htmlFor="tvf-route">Route (optional)</label>
              <input id="tvf-route" className="calc-input" type="text"
                placeholder="e.g. Delhi → Mumbai" value={route} onChange={e => setRoute(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tvf-travelers">Number of Travellers</label>
              <input id="tvf-travelers" className="calc-input" type="number" min="1" max="10" step="1"
                placeholder="e.g. 2" value={travelers} onChange={e => setTravelers(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(59,43,29,0.03)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-strong)' }}>🚂 Train</p>
              <div className="calc-field" style={{ marginBottom: '0.75rem' }}>
                <label className="calc-label" htmlFor="tvf-tp">Ticket Price (₹/person)</label>
                <input id="tvf-tp" className="calc-input" type="number" min="0" step="10"
                  placeholder="e.g. 1200" value={trainPrice} onChange={e => setTrainPrice(e.target.value)} required />
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="tvf-td">Journey Duration (hours)</label>
                <input id="tvf-td" className="calc-input" type="number" min="0" step="0.5"
                  placeholder="e.g. 14" value={trainDuration} onChange={e => setTrainDuration(e.target.value)} required />
              </div>
            </div>
            <div style={{ background: 'rgba(59,43,29,0.03)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink-strong)' }}>✈ Flight</p>
              <div className="calc-field" style={{ marginBottom: '0.75rem' }}>
                <label className="calc-label" htmlFor="tvf-fp">Ticket Price (₹/person)</label>
                <input id="tvf-fp" className="calc-input" type="number" min="0" step="10"
                  placeholder="e.g. 5500" value={flightPrice} onChange={e => setFlightPrice(e.target.value)} required />
              </div>
              <div className="calc-field">
                <label className="calc-label" htmlFor="tvf-fd">Flight Duration (hours)</label>
                <input id="tvf-fd" className="calc-input" type="number" min="0" step="0.25"
                  placeholder="e.g. 2" value={flightDuration} onChange={e => setFlightDuration(e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="calc-grid-2">
            <div className="calc-field">
              <label className="calc-label" htmlFor="tvf-apdist">Airport Distance from City (km)</label>
              <input id="tvf-apdist" className="calc-input" type="number" min="1" step="1"
                placeholder="e.g. 30" value={airportDistance} onChange={e => setAirportDistance(e.target.value)} />
            </div>
            <div className="calc-field">
              <label className="calc-label" htmlFor="tvf-checkin">Check-in + Security (hours)</label>
              <select id="tvf-checkin" className="calc-select" value={checkinTime} onChange={e => setCheckinTime(e.target.value)}>
                <option value="1.5">1.5 hours (domestic, fast)</option>
                <option value="2">2 hours (domestic, standard)</option>
                <option value="2.5">2.5 hours (domestic, busy)</option>
                <option value="3">3 hours (international)</option>
              </select>
            </div>
          </div>
          {error && <p className="calc-error" role="alert">{error}</p>}
          <button type="submit" className="calc-btn">Compare Train vs Flight</button>
        </form>
      </div>

      {result && (
        <div className="calc-results">
          <h3 className="calc-results-title">
            {route ? `${route} — Comparison` : 'Train vs Flight Comparison'}
          </h3>
          <div className="calc-compare-grid">
            <div className={`calc-compare-col${result.costWinner === 'train' ? ' winner' : ''}`}>
              <div className="calc-compare-col-title">
                🚂 Train
                {result.costWinner === 'train' && <span className="winner-badge">CHEAPER</span>}
              </div>
              <div className="calc-compare-main">{fmt(result.trainTotal)}</div>
              <div className="calc-compare-sub">{formatHours(result.trainTime)} door-to-door</div>
            </div>
            <div className={`calc-compare-col${result.costWinner === 'flight' ? ' winner' : ''}`}>
              <div className="calc-compare-col-title">
                ✈ Flight (incl. airport)
                {result.costWinner === 'flight' && <span className="winner-badge">CHEAPER</span>}
              </div>
              <div className="calc-compare-main">{fmt(result.flightTotal)}</div>
              <div className="calc-compare-sub">{formatHours(result.flightTime)} door-to-door</div>
            </div>
          </div>
          <div className="calc-results-grid">
            <div className="calc-result-item">
              <span className="calc-result-label">Cost Difference</span>
              <span className="calc-result-num">{fmt(result.costDiff)}</span>
              <span className="calc-result-note">{result.costWinner === 'train' ? 'Train saves this' : 'Flight saves this'}</span>
            </div>
            <div className="calc-result-item">
              <span className="calc-result-label">Time Difference</span>
              <span className="calc-result-num">{formatHours(result.timeDiff)}</span>
              <span className="calc-result-note">{result.timeWinner === 'train' ? 'Train is faster' : 'Flight is faster'}</span>
            </div>
          </div>
          <div style={{ background: 'rgba(182,91,46,0.06)', border: '1px solid rgba(182,91,46,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Our Recommendation: </strong>{result.recommendation}
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
