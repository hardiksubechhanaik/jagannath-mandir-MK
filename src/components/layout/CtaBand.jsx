import { Link } from 'react-router-dom';
import maroonStyles from '../../styles/about.module.css';
import creamStyles from '../../styles/deities.module.css';

export default function CtaBand({ odia, title, body, buttonLabel, buttonTo, variant = 'maroon' }) {
  if (variant === 'cream') {
    return (
      <section className={creamStyles.ctaSection} style={{ background: '#FBF6EA' }}>
        <div className={creamStyles.ctaInner}>
          <div className={creamStyles.eyebrow}>{odia}</div>
          <h2 className={creamStyles.ctaH2}>{title}</h2>
          <p className={creamStyles.ctaBody}>{body}</p>
          <div className={creamStyles.ctaBtns}>
            <Link to={buttonTo} className={creamStyles.btnMaroon}>{buttonLabel}</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={maroonStyles.donateCta}>
      <div className={maroonStyles.donateCtaInner}>
        <div className={maroonStyles.donateCtaOdia}>{odia}</div>
        <h2 className={maroonStyles.donateCtaH2}>{title}</h2>
        <p className={maroonStyles.donateCtaBody}>{body}</p>
        <Link to={buttonTo} className={maroonStyles.donatePrimaryBtn}>
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
