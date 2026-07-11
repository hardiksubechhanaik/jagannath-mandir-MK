import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import { apiGet } from '../api/client';
import styles from '../styles/blog.module.css';

export default function NewsletterUnsubscribe() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Processing your request…');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setMessage('This unsubscribe link is invalid.');
      return;
    }

    apiGet(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setOk(true);
        setMessage(data.message || 'You have been unsubscribed.');
      })
      .catch((err) => {
        setOk(false);
        setMessage(err.message || 'Could not process this unsubscribe link.');
      });
  }, [params]);

  return (
    <PageShell active="blog" className={styles.page}>
      <section className={styles.newsletter} style={{ minHeight: '50vh' }}>
        <div className={styles.newsletterInner} style={{ justifyContent: 'center' }}>
          <div style={{ maxWidth: 560 }}>
            <p className={styles.newsletterOdia}>ସମ୍ବାଦ</p>
            <h1 className={styles.newsletterTitle}>Email preferences</h1>
            <p className={styles.newsletterCopy} style={{ color: ok ? '#E6DCCB' : '#f5c6cb' }}>
              {message}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
