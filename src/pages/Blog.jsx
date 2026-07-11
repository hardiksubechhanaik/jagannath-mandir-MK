import { useCallback, useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import PageLoading, { PageError } from '../components/layout/PageLoading';
import { getBlogFilterCategories } from '../data/blogCategories.js';
import { getPosts } from '../data/blog.js';
import { apiPost, endpoints } from '../api/client';
import { useRefetchOnFocus } from '../hooks/usePageData.js';
import { useTranslation } from '../i18n/useTranslation';
import {
  formatInstagramHandle,
  hasInstagramHandle,
  instagramProfileUrl,
} from '../lib/creatorSpotlight.js';
import { formatRichText } from '../lib/richText.js';
import BlogPostModal from '../components/blog/BlogPostModal.jsx';
import styles from '../styles/blog.module.css';

const CATEGORY_KEYS = {
  All: 'all',
  Festivals: 'festivals',
  Traditions: 'traditions',
  'Temple Life': 'templeLife',
};

function translateCategory(category, t) {
  const key = CATEGORY_KEYS[category];
  return key ? t(`blog.categories.${key}`) : category;
}

function RichExcerpt({ text, className }) {
  if (!text) return null;
  return (
    <div
      className={`${className} ${styles.richText}`.trim()}
      dangerouslySetInnerHTML={{ __html: formatRichText(text) }}
    />
  );
}

function PostAuthor({ post, className = '' }) {
  if (!post.name) return null;

  const showInstagram = hasInstagramHandle(post.instaId);

  return (
    <p className={`${styles.postAuthor} ${className}`.trim()}>
      <span>{post.name}</span>
      {showInstagram && (
        <a
          href={instagramProfileUrl(post.instaId)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.postInsta}
        >
          {formatInstagramHandle(post.instaId)}
        </a>
      )}
    </p>
  );
}

function PostMedia({ post, variant = 'card' }) {
  const labelClass =
    variant === 'featured'
      ? `${styles.phLabel} ${styles.phLabelFeatured}`
      : styles.phLabel;

  if (post.image) {
    return (
      <img
        src={post.image}
        alt={post.title}
        className={styles.postImage}
      />
    );
  }

  return (
    <div className={styles.ph} aria-hidden="true">
      <span className={labelClass}>[ {post.title} ]</span>
    </div>
  );
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function Blog() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [category, setCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const loadPosts = useCallback(() => {
    return getPosts()
      .then((result) => {
        setPosts(result);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err);
      });
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useRefetchOnFocus(loadPosts);

  const categories = useMemo(
    () => (posts ? getBlogFilterCategories(posts) : ['All']),
    [posts],
  );

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (category === 'All') return posts;
    return posts.filter((post) => post.category === category);
  }, [posts, category]);

  const featured = filtered[0] ?? null;
  const gridPosts = featured ? filtered.slice(1) : filtered;
  const isEmpty = filtered.length === 0;

  async function handleSubscribe(event) {
    event.preventDefault();
    setSubscribed(false);

    if (!isValidEmail(email)) {
      setEmailError(t('forms.newsletterInvalid'));
      return;
    }

    setEmailError('');
    setSubscribing(true);
    try {
      await apiPost(endpoints.newsletterSubscribe, { email: email.trim(), source: 'blog' });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setEmailError(err.message || t('forms.newsletterInvalid'));
    } finally {
      setSubscribing(false);
    }
  }

  if (loadError) {
    return (
      <PageShell active="blog" className={styles.page}>
        <PageError message={loadError.message} />
      </PageShell>
    );
  }

  if (!posts) {
    return (
      <PageShell active="blog" className={styles.page}>
        <div className={styles.loadingWrap}>
          <PageLoading />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell active="blog" className={styles.page}>
      <section className={styles.hero} aria-labelledby="blog-hero-title">
        <div className="templeHeroBg" aria-hidden="true" />
        <div className="templeHeroOverlay" aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>{t('blog.heroEyebrow')}</p>
          <h1 id="blog-hero-title" className={styles.heroTitle}>
            {t('blog.heroTitle')}
          </h1>
          <p className={styles.heroOdia}>{t('blog.heroOdia')}</p>
        </div>
      </section>

      {featured && (
        <section className={styles.featuredSection} aria-labelledby="featured-post-title">
          <article className={styles.featuredCard}>
            <div className={styles.featuredMedia}>
              <PostMedia post={featured} variant="featured" />
            </div>
            <div className={styles.featuredBody}>
              <div className={styles.featuredMeta}>
                <span className={styles.featuredBadge}>{translateCategory(featured.category, t)}</span>
                <time className={styles.featuredDate} dateTime={featured.date}>
                  {featured.date}
                </time>
              </div>
              <h2 id="featured-post-title" className={styles.featuredTitle}>
                {featured.title}
              </h2>
              <PostAuthor post={featured} className={styles.featuredAuthor} />
              <RichExcerpt text={featured.body} className={styles.featuredExcerpt} />
              <button type="button" className={styles.readLink} onClick={() => setSelectedPost(featured)}>
                {t('common.readFullStory')}
              </button>
            </div>
          </article>
        </section>
      )}

      <section className={styles.gridSection} aria-labelledby="from-the-mandir">
        <div className={styles.gridHeader}>
          <div>
            <p className={styles.gridEyebrow}>{t('blog.latestEyebrow')}</p>
            <h2 id="from-the-mandir" className={styles.gridTitle}>
              {t('blog.gridTitle')}
            </h2>
          </div>
          <div className={styles.filterWrap}>
            <label htmlFor="blog-category-filter" className={styles.filterLabel}>
              {t('blog.filterAria')}
            </label>
            <select
              id="blog-category-filter"
              className={styles.filterSelect}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {translateCategory(item, t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEmpty ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>{t('blog.emptyTitle')}</p>
            <p className={styles.emptyText}>{t('blog.emptyText')}</p>
          </div>
        ) : (
          <div className={styles.postGrid}>
            {gridPosts.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postCardMedia}>
                  <PostMedia post={post} />
                </div>
                <div className={styles.postCardBody}>
                  <div className={styles.postMeta}>
                    <span className={styles.postCategory}>{translateCategory(post.category, t)}</span>
                    <time className={styles.postDate} dateTime={post.date}>
                      {post.date}
                    </time>
                  </div>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <PostAuthor post={post} />
                  <RichExcerpt text={post.body} className={styles.postExcerpt} />
                  <button type="button" className={styles.postFooter} onClick={() => setSelectedPost(post)}>
                    {t('common.readMore')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <BlogPostModal
        post={selectedPost}
        categoryLabel={selectedPost ? translateCategory(selectedPost.category, t) : ''}
        onClose={() => setSelectedPost(null)}
      />

      <section className={styles.newsletter} aria-labelledby="newsletter-title">
        <div className={styles.newsletterInner}>
          <div>
            <p className={styles.newsletterOdia}>{t('blog.newsletterOdia')}</p>
            <h2 id="newsletter-title" className={styles.newsletterTitle}>
              {t('blog.newsletterTitle')}
            </h2>
            <p className={styles.newsletterCopy}>{t('blog.newsletterCopy')}</p>
          </div>
          <form className={styles.newsletterForm} onSubmit={handleSubscribe} noValidate>
            <div className={styles.newsletterField}>
              <label htmlFor="blog-newsletter-email" className="visually-hidden">
                {t('blog.emailLabel')}
              </label>
              <input
                id="blog-newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t('blog.emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                  setSubscribed(false);
                }}
                className={`${styles.emailInput} ${emailError ? styles.emailInputError : ''}`}
                aria-invalid={emailError ? 'true' : undefined}
                aria-describedby={emailError ? 'newsletter-error' : subscribed ? 'newsletter-success' : undefined}
              />
              {emailError && (
                <p id="newsletter-error" className={styles.formError} role="alert">
                  {emailError}
                </p>
              )}
              {subscribed && (
                <p id="newsletter-success" className={styles.formSuccess} role="status">
                  {t('forms.newsletterSuccess')}
                </p>
              )}
            </div>
            <button type="submit" className={styles.subscribeBtn} disabled={subscribing}>
              {subscribing ? '…' : t('common.subscribe')}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
