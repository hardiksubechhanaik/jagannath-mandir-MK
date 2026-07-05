import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LOGIN_PATH,
  isNavGroupActive,
  isNavItemActive,
} from '../data/nav';
import { useTempleStatusCopy } from '../hooks/useTempleStatusCopy';
import { LOCALES } from '../i18n/LanguageContext';
import { getNav } from '../i18n/getNav';
import { useTranslation } from '../i18n/useTranslation';
import TempleLogo from './TempleLogo';
import styles from '../styles/siteHeader.module.css';

function NavDropdownLink({ to, label, pathname, locationHash, onNavigate }) {
  const active = isNavItemActive(pathname, locationHash, to);

  return (
    <Link
      to={to}
      className={active ? `${styles.dropdownLink} ${styles.dropdownLinkActive}` : styles.dropdownLink}
      onClick={onNavigate}
      role="menuitem"
    >
      {label}
    </Link>
  );
}

function NavDropdown({
  group,
  pathname,
  locationHash,
  openMenu,
  setOpenMenu,
  onNavigate,
}) {
  const menuId = useId();
  const panelRef = useRef(null);
  const isOpen = openMenu === group.label;
  const isActive = isNavGroupActive(pathname, locationHash, group.items);

  const open = useCallback(() => setOpenMenu(group.label), [group.label, setOpenMenu]);
  const close = useCallback(() => setOpenMenu(null), [setOpenMenu]);

  function handleTriggerKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen) {
        close();
      } else {
        open();
        requestAnimationFrame(() => {
          panelRef.current?.querySelector('a')?.focus();
        });
      }
    }
    if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      open();
      requestAnimationFrame(() => {
        panelRef.current?.querySelector('a')?.focus();
      });
    }
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      close();
    }
  }

  function handlePanelKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  return (
    <div
      className={styles.navGroup}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <button
        type="button"
        className={`${styles.navTrigger} ${isOpen || isActive ? styles.navTriggerActive : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
      >
        {group.label}
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdownWrap}>
          <div className={styles.dropdownBridge} aria-hidden="true" />
          <div
            id={menuId}
            ref={panelRef}
            className={styles.dropdownPanel}
            role="menu"
            onKeyDown={handlePanelKeyDown}
          >
            {group.items.map((item) => (
              <NavDropdownLink
                key={item.to}
                to={item.to}
                label={item.label}
                pathname={pathname}
                locationHash={locationHash}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteHeader({ ribbon: ribbonOverride, ribbonExtra }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const menuBtnRef = useRef(null);
  const location = useLocation();
  const { pathname, hash: locationHash } = location;
  const { t, locale, setLocale } = useTranslation();
  const nav = useMemo(() => getNav(t), [t]);
  const templeStatus = useTempleStatusCopy();
  const {
    statusDot,
    statusGlow,
    statusText,
    nextText,
    pulse,
  } = ribbonOverride ?? templeStatus;

  const closeMobileMenu = useCallback(() => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      menuBtnRef.current?.focus();
    });
  }, []);

  const closeMenus = useCallback(() => {
    setOpenMenu(null);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      if (navRef.current?.contains(document.activeElement)) {
        menuBtnRef.current?.focus();
      }
    });
  }, []);

  useEffect(() => {
    closeMenus();
  }, [pathname, locationHash, closeMenus]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) {
      document.body.dataset.menuOpen = 'true';
    } else {
      delete document.body.dataset.menuOpen;
    }
    return () => {
      document.body.style.overflow = '';
      delete document.body.dataset.menuOpen;
    };
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        if (menuOpen) {
          closeMobileMenu();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMobileMenu]);

  useEffect(() => {
    if (!openMenu) return undefined;

    function handlePointerDown(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMenu]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setHeight = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${el.offsetHeight}px`,
      );
    };

    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const donateActive = pathname === '/donate';

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={styles.ribbon}>
          <div className={styles.ribbonInner}>
            <div className={styles.ribbonLeft}>
              <span
                className={pulse ? `${styles.statusDot} livePulse` : styles.statusDot}
                style={{ background: statusDot, boxShadow: pulse ? undefined : `0 0 0 3px ${statusGlow}` }}
              />
              <span className={styles.ribbonStatus}>{statusText}</span>
            </div>
            <div className={styles.ribbonRight}>
              <span className={styles.ribbonNext}>{nextText}</span>
              {ribbonExtra}
              <span className={styles.langBar}>
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={locale === l.code ? styles.langOdia : styles.langEn}
                    onClick={() => setLocale(l.code)}
                    aria-label={l.native}
                    aria-current={locale === l.code ? 'true' : undefined}
                  >
                    {l.label}
                  </button>
                ))}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.navBar}>
          <div className={styles.nav}>
            <Link to="/" className={styles.logoLockup}>
              <TempleLogo className={styles.logoImage} size={46} alt="" />
              <div className={styles.logoText}>
                <div className={styles.logoName}>{t('site.templeName')}</div>
                <div className={styles.logoSub}>{t('site.logoSub')}</div>
              </div>
            </Link>

            <Link
              to="/prasad"
              className={styles.mobileHeaderPrasad}
              onClick={closeMenus}
            >
              {t('nav.bookPrasad')}
            </Link>

            <button
              ref={menuBtnRef}
              type="button"
              className={menuOpen ? `${styles.menuBtn} ${styles.menuBtnOpen}` : styles.menuBtn}
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              aria-label={menuOpen ? t('common.closeMenu') : t('common.openMenu')}
              onClick={() => (menuOpen ? closeMobileMenu() : setMenuOpen(true))}
            >
              <span className={styles.menuIcon} aria-hidden="true" />
            </button>

            {menuOpen && (
              <button
                type="button"
                className={styles.navOverlay}
                aria-label={t('common.closeMenu')}
                onClick={closeMobileMenu}
              />
            )}

            <nav
              id="site-nav"
              ref={navRef}
              className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}
              aria-label={t('common.mainNav')}
            >
              <div className={styles.desktopNav}>
                {nav.map((entry) => {
                  if (entry.to) {
                    return (
                      <NavLink
                        key={entry.label}
                        to={entry.to}
                        end
                        className={({ isActive }) =>
                          isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                        }
                      >
                        {entry.label}
                      </NavLink>
                    );
                  }

                  return (
                    <NavDropdown
                      key={entry.label}
                      group={entry}
                      pathname={pathname}
                      locationHash={locationHash}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      onNavigate={closeMenus}
                    />
                  );
                })}
              </div>

              <div className={styles.navActions}>
                <Link
                  to={LOGIN_PATH}
                  className={styles.loginLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/prasad"
                  className={styles.loginLink}
                  onClick={closeMenus}
                >
                  {t('nav.bookPrasad')}
                </Link>
                <Link
                  to="/donate"
                  className={donateActive ? styles.donateBtnActive : styles.donateBtn}
                  onClick={closeMenus}
                >
                  {t('nav.donate')}
                </Link>
              </div>

              <div className={styles.mobileDrawerHead}>
                <span className={styles.mobileDrawerTitle}>{t('common.menu')}</span>
              </div>

              <div className={styles.mobileNav}>
                {nav.map((entry) => {
                  if (entry.to) {
                    return (
                      <NavLink
                        key={entry.to}
                        to={entry.to}
                        end
                        className={({ isActive }) =>
                          isActive
                            ? `${styles.mobileLink} ${styles.mobileLinkActive}`
                            : styles.mobileLink
                        }
                        onClick={closeMenus}
                      >
                        {entry.label}
                      </NavLink>
                    );
                  }

                  return (
                    <div key={entry.label} className={styles.mobileGroup}>
                      <div className={styles.mobileGroupLabel}>{entry.label}</div>
                      {entry.items.map((item) => {
                        const active = isNavItemActive(pathname, locationHash, item.to);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={
                              active
                                ? `${styles.mobileLink} ${styles.mobileLinkActive}`
                                : styles.mobileLink
                            }
                            onClick={closeMenus}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}

                <div className={styles.mobileActions}>
                  <Link
                    to={LOGIN_PATH}
                    className={styles.mobileLoginBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenus}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/prasad"
                    className={styles.mobileLoginBtn}
                    onClick={closeMenus}
                  >
                    {t('nav.bookPrasad')}
                  </Link>
                  <Link
                    to="/donate"
                    className={styles.mobileDonateBtn}
                    onClick={closeMenus}
                  >
                    {t('nav.donate')}
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <div className={styles.headerSpacer} aria-hidden="true" />
    </>
  );
}
