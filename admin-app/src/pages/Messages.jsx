import { useEffect, useState } from 'react';
import { store } from '../data/store.js';
import PageHead from '../components/PageHead.jsx';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const unread = messages.filter((m) => m.unread).length;

  useEffect(() => {
    store.list('messages').then(setMessages);
  }, []);

  async function toggle(id, current) {
    setMessages(await store.update('messages', id, { unread: !current }));
  }

  async function remove(id) {
    setMessages(await store.remove('messages', id));
  }

  return (
    <>
      <PageHead eyebrow="Contact Inbox" title="Messages" />
      <p className="page-sub">Enquiries from the Contact page. {unread} unread.</p>

      <div className="stack">
        {messages.map((m) => (
          <div className={'msg-card' + (m.unread ? ' unread' : '')} key={m.id}>
            <div className="msg-top">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="msg-head">
                  {m.unread && <span className="msg-unread-dot" />}
                  <span className="msg-name">{m.name}</span>
                  <span className="msg-email">· {m.email}</span>
                </div>
                <div className="msg-body">{m.message}</div>
              </div>
              <div className="msg-time">{m.time}</div>
            </div>
            <div className="row-actions">
              <button className="btn-soft" onClick={() => toggle(m.id, m.unread)}>
                {m.unread ? 'Mark as read' : 'Mark unread'}
              </button>
              <a className="btn-dark" href={`mailto:${m.email}`}>Reply</a>
              <button className="btn-danger" style={{ marginLeft: 'auto' }} onClick={() => remove(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
