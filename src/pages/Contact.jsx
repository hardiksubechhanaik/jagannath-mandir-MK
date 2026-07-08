import PageShell from '../components/layout/PageShell';
import PageHero from '../components/layout/PageHero';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import ContactInfoSection from '../components/contact/ContactInfoSection';
import ContactFormSection from '../components/contact/ContactFormSection';
import NarasimhaSpotlight from '../components/contact/NarasimhaSpotlight';
import usePageData from '../hooks/usePageData';
import { endpoints } from '../api/client';
import { useTranslation } from '../i18n/useTranslation';
import styles from '../styles/contact.module.css';

export default function Contact() {
  const { t } = useTranslation();
  const { data, loading, error } = usePageData(endpoints.contact);

  if (loading && !data) {
    return (
      <PageShell active="contact" className={styles.page}>
        <PageLoading />
      </PageShell>
    );
  }

  if (error && !data) {
    return (
      <PageShell active="contact" className={styles.page}>
        <PageError message={error.message} />
      </PageShell>
    );
  }

  return (
    <PageShell active="contact" className={styles.page}>
      <PageHero
        eyebrow={t('contact.heroEyebrow')}
        title={t('contact.heroTitle')}
        odia={t('contact.heroOdia')}
      />
      <ContactInfoSection />
      <ContactFormSection />
      <NarasimhaSpotlight narasimhaImage={data.narasimhaImage} />
    </PageShell>
  );
}
