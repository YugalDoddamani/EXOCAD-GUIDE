/* exocad PartialCAD guide interactions */

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const menuButton = document.querySelector('.hamburger');
  const overlay = document.querySelector('.overlay');
  const searchInput = document.querySelector('.search-input');
  const searchStatus = document.querySelector('.search-status');
  const backToTop = document.querySelector('.back-to-top');
  const printButton = document.querySelector('.print-btn');
  const navGroups = [...document.querySelectorAll('.nav-section')];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = [...document.querySelectorAll('.hero[id], .tool-section[id]')];
  const mobileNavigation = window.matchMedia('(max-width: 920px)');

  const sectionForLink = (link) => document.getElementById(link.hash.slice(1));
  const normalizeText = (value) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const searchIndex = navLinks.map((link) => {
    const target = sectionForLink(link);
    return {
      link,
      group: link.closest('.nav-section'),
      text: normalizeText(`${link.textContent} ${target?.textContent ?? ''}`),
    };
  });

  let collapsedBeforeSearch = null;
  let activeLinkFrame = null;

  // ---------- MOBILE NAVIGATION ----------
  const setNavigationOpen = (open, returnFocus = false) => {
    if (!sidebar || !menuButton || !mobileNavigation.matches) return;

    sidebar.classList.toggle('open', open);
    sidebar.inert = !open;
    if (open) {
      sidebar.removeAttribute('aria-hidden');
    } else {
      sidebar.setAttribute('aria-hidden', 'true');
    }

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close tool navigation' : 'Open tool navigation');
    overlay?.classList.toggle('open', open);

    if (open) {
      searchInput?.focus({ preventScroll: true });
    } else if (returnFocus) {
      menuButton.focus();
    }
  };

  const syncNavigationForViewport = () => {
    if (!sidebar || !menuButton) return;

    if (mobileNavigation.matches) {
      const open = sidebar.classList.contains('open');
      sidebar.inert = !open;
      if (open) {
        sidebar.removeAttribute('aria-hidden');
      } else {
        sidebar.setAttribute('aria-hidden', 'true');
      }
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close tool navigation' : 'Open tool navigation');
      overlay?.classList.toggle('open', open);
      return;
    }

    sidebar.classList.remove('open');
    sidebar.inert = false;
    sidebar.removeAttribute('aria-hidden');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open tool navigation');
    overlay?.classList.remove('open');
  };

  menuButton?.addEventListener('click', () => {
    setNavigationOpen(!sidebar?.classList.contains('open'));
  });

  overlay?.addEventListener('click', () => setNavigationOpen(false, true));
  mobileNavigation.addEventListener('change', syncNavigationForViewport);
  syncNavigationForViewport();

  // ---------- SEARCH ALL GUIDE CONTENT ----------
  const applySearch = () => {
    if (!sidebar || !searchInput) return;

    const query = normalizeText(searchInput.value);
    const terms = query ? query.split(' ') : [];
    const matchingItems = searchIndex.filter(({ text }) => terms.every((term) => text.includes(term)));
    const matchedLinks = new Set(matchingItems.map(({ link }) => link));

    if (query && collapsedBeforeSearch === null) {
      collapsedBeforeSearch = new Set(
        navGroups.filter((group) => group.classList.contains('collapsed')),
      );
    }

    searchIndex.forEach(({ link }) => {
      link.hidden = Boolean(query) && !matchedLinks.has(link);
    });

    navGroups.forEach((group) => {
      const hasMatch = [...group.querySelectorAll('.nav-links a')].some((link) => !link.hidden);
      group.hidden = Boolean(query) && !hasMatch;

      if (query && hasMatch) {
        group.classList.remove('collapsed');
        group.querySelector('.nav-section-title')?.setAttribute('aria-expanded', 'true');
      }
    });

    if (query) {
      const resultCount = matchingItems.length;
      searchStatus.textContent = resultCount
        ? `${resultCount} matching ${resultCount === 1 ? 'section' : 'sections'} for “${searchInput.value.trim()}”.`
        : `No sections match “${searchInput.value.trim()}”. Try a tool name or parameter.`;
    } else {
      if (collapsedBeforeSearch) {
        navGroups.forEach((group) => {
          const shouldCollapse = collapsedBeforeSearch.has(group);
          group.classList.toggle('collapsed', shouldCollapse);
          group.querySelector('.nav-section-title')?.setAttribute('aria-expanded', String(!shouldCollapse));
        });
        collapsedBeforeSearch = null;
      }

      navGroups.forEach((group) => { group.hidden = false; });
      searchIndex.forEach(({ link }) => { link.hidden = false; });
      searchStatus.textContent = 'Search across tool names, settings, and instructions.';
    }
  };

  searchInput?.addEventListener('input', applySearch);

  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && searchInput.value) {
      searchInput.value = '';
      applySearch();
    }
  });

  // ---------- COLLAPSIBLE NAV GROUPS ----------
  document.querySelectorAll('.nav-section-title').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.nav-section');
      const collapsed = group.classList.toggle('collapsed');
      button.setAttribute('aria-expanded', String(!collapsed));
    });
  });

  // ---------- IN-PAGE NAVIGATION + CURRENT SECTION ----------
  const focusSectionHeading = (target) => {
    const heading = target?.matches('.hero')
      ? target.querySelector('h1')
      : target?.querySelector('h2');

    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = sectionForLink(link);
      if (target) focusSectionHeading(target);

      if (mobileNavigation.matches && sidebar?.classList.contains('open')) {
        setNavigationOpen(false);
      }
    });
  });

  const updateCurrentSection = () => {
    activeLinkFrame = null;
    if (!sections.length) return;

    const threshold = (document.querySelector('.site-header')?.offsetHeight ?? 60) + 24;
    let currentSection = sections[0];

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) {
        currentSection = section;
      } else {
        break;
      }
    }

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      currentSection = sections[sections.length - 1];
    }

    navLinks.forEach((link) => {
      const isCurrent = link.hash === `#${currentSection.id}`;
      link.classList.toggle('active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const scheduleCurrentSectionUpdate = () => {
    if (activeLinkFrame) return;
    activeLinkFrame = window.requestAnimationFrame(updateCurrentSection);
  };

  window.addEventListener('scroll', scheduleCurrentSectionUpdate, { passive: true });
  window.addEventListener('resize', scheduleCurrentSectionUpdate, { passive: true });
  window.addEventListener('hashchange', scheduleCurrentSectionUpdate);
  updateCurrentSection();

  // ---------- BACK TO TOP ----------
  const updateBackToTop = () => {
    if (backToTop) backToTop.hidden = window.scrollY < 480;
  };

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop?.addEventListener('click', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    focusSectionHeading(document.getElementById('overview'));
  });

  // ---------- PRINT ----------
  printButton?.addEventListener('click', () => window.print());

  // ---------- ESCAPE CLOSES THE MOBILE NAV ----------
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNavigation.matches && sidebar?.classList.contains('open')) {
      setNavigationOpen(false, true);
    }
  });
});
