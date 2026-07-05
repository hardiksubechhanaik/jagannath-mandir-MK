import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

const STATUS_CLASS = { Success: 'status-success', Pending: 'status-pending', Failed: 'status-failed' };
const nextStatus = (s) => (s === 'Pending' ? 'Success' : s === 'Success' ? 'Failed' : 'Pending');

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [monthTotal, setMonthTotal] = useState('₹0');
  const pending = donations.filter((d) => d.status === 'Pending').length;

  useEffect(() => {
    store.list('donations').then(setDonations);
    store.getSummary().then((s) => setMonthTotal(s.donationsThisMonth)).catch(() => {});
  }, []);

  async function cycle(id, current) {
    setDonations(await store.update('donations', id, { status: nextStatus(current) }));
  }

  const metrics = (
    <div className="don-metrics">
      <div className="metric">
        <div className="metric-val" style={{ color: 'var(--green)' }}>{monthTotal}</div>
        <div className="metric-lbl">This month</div>
      </div>
      <div className="metric">
        <div className="metric-val" style={{ color: 'var(--gold)' }}>{pending}</div>
        <div className="metric-lbl">Pending</div>
      </div>
    </div>
  );

  return (
    <>
      <PageHead eyebrow="Seva & Dana" title="Donations" right={metrics} />
      <p className="page-sub">Donations received through the website. Click a status to update it as payments settle.</p>

      {donations.length === 0 ? (
        <div className="empty-panel card">
          <div className="empty-panel-title">No donations yet</div>
          <p className="empty-panel-text">
            When devotees complete a donation on the website, their record will appear here
            so you can track purpose, amount, and payment status.
          </p>
        </div>
      ) : (
        <div className="table table--donations">
          <div className="thead">
            <div>Donor</div><div>Purpose</div><div>Amount</div><div>Date</div><div>Status</div>
          </div>
          {donations.map((d) => (
            <div className="trow" key={d.id}>
              <div className="don-cell don-cell--donor">
                <span className="don-cell-label">Donor</span>
                <div className="td-name">{d.name}</div>
                <div className="td-sub">{d.freq}</div>
              </div>
              <div className="don-cell don-cell--purpose">
                <span className="don-cell-label">Purpose</span>
                <div className="td-purpose">{d.purpose}</div>
              </div>
              <div className="don-cell don-cell--amount">
                <span className="don-cell-label">Amount</span>
                <div className="td-amount">{d.amount}</div>
              </div>
              <div className="don-cell don-cell--date">
                <span className="don-cell-label">Date</span>
                <div className="td-date">{d.date}</div>
              </div>
              <div className="don-cell don-cell--status">
                <span className="don-cell-label">Status</span>
                <span
                  className={'status-pill ' + STATUS_CLASS[d.status]}
                  title="Click to change"
                  onClick={() => cycle(d.id, d.status)}
                >
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
