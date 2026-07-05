import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

export default function Overview() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    store.getSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  if (!summary) {
    return (
      <>
        <div style={{ marginBottom: 26 }}>
          <div className="eyebrow">Dashboard · ଜୟ ଜଗନ୍ନାଥ</div>
          <h1 className="page-title">Welcome back, Admin</h1>
        </div>
        <p className="page-sub">Loading dashboard…</p>
      </>
    );
  }

  const stats = [
    { label: 'Donations · month', value: summary.donationsThisMonth, note: `Across ${summary.donationCount} gifts` },
    { label: 'Unread messages', value: String(summary.unreadMessages), note: `${summary.unreadMessages} awaiting reply` },
    { label: 'Gallery photos', value: String(summary.galleryCount), note: 'Published live' },
    { label: 'Upcoming festivals', value: String(summary.upcomingFestivals), note: 'From today onward' },
  ];

  return (
    <>
      <div style={{ marginBottom: 26 }}>
        <div className="eyebrow">Dashboard · ଜୟ ଜଗନ୍ନାଥ</div>
        <h1 className="page-title">Welcome back, Admin</h1>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-note">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Donations — last 6 months</div>
          <div className="chart">
            {summary.last6Months.map((c) => (
              <div className="chart-col" key={c.m}>
                <div className="chart-bar" style={{ height: c.h }} />
                <div className="chart-m">{c.m}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Recent activity</div>
          {summary.recentActivity.length === 0 ? (
            <p className="page-sub" style={{ margin: 0 }}>No donations, messages, or posts yet.</p>
          ) : (
            summary.recentActivity.map((a, i) => (
              <div className="activity-row" key={i}>
                <span className="activity-dot" />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
