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

  // Problem-first tool finder: search both task language and the full reference section.
  const toolSearch = document.querySelector('#tool-search');
  const toolCards = [...document.querySelectorAll('.tool-card')];
  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  const taskButtons = [...document.querySelectorAll('.task-shortcut')];
  const toolCount = document.querySelector('#tool-count');
  const toolStatus = document.querySelector('#tool-search-status');
  const toolEmpty = document.querySelector('#tool-empty');
  const clearToolSearch = document.querySelector('#clear-tool-search');
  const instantResults = document.querySelector('#instant-search-results');
  const folderButtons = [...document.querySelectorAll('[data-folder-filter]')];
  const categoryShelf = document.querySelector('.category-shelf');
  let activeFilter = 'all';

  const normalizeToolText = (value) => (value || '').normalize('NFKD').toLocaleLowerCase().replace(/[^a-z0-9+.#\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  const cardSearchText = (card) => {
    const href = card.getAttribute('href') || '';
    const section = href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
    return normalizeToolText([card.textContent, card.dataset.search, section?.textContent].filter(Boolean).join(' '));
  };

  const filterToolCards = () => {
    const rawQuery = toolSearch?.value ?? '';
    const query = normalizeToolText(rawQuery);
    const terms = query ? query.split(' ').filter(Boolean) : [];
    let visible = 0;

    toolCards.forEach((card) => {
      const stageMatch = activeFilter === 'all' || card.dataset.stage === activeFilter;
      const haystack = cardSearchText(card);
      const queryMatch = !terms.length || terms.every((term) => haystack.includes(term));
      card.hidden = !(stageMatch && queryMatch);
      if (!card.hidden) visible += 1;
    });

    if (toolCount) toolCount.textContent = visible + (visible === 1 ? ' result' : ' results');
    if (toolStatus) {
      if (terms.length) {
        toolStatus.textContent = visible
          ? visible + (visible === 1 ? ' matching guide entry' : ' matching guide entries') + ' for “' + rawQuery.trim() + '”. Select a result to open its instructions.'
          : 'No matches for “' + rawQuery.trim() + '”. Try “wax”, “blockout”, “curve” or “thickness”.';
      } else {
        toolStatus.textContent = activeFilter === 'all'
          ? 'Showing all tools. Search by problem, tool, setting or shortcut.'
          : 'Showing tools in ' + (filterButtons.find((button) => button.dataset.filter === activeFilter)?.textContent || 'this category') + '.';
      }
    }
    if (toolEmpty) toolEmpty.hidden = visible !== 0;

    // Keep live results directly under the search field so users never need to scroll to find them.
    if (instantResults) {
      instantResults.replaceChildren();
      instantResults.hidden = !terms.length;
      if (categoryShelf) categoryShelf.hidden = Boolean(terms.length);
      if (terms.length) {
        const matches = toolCards.filter((card) => !card.hidden);
        if (!matches.length) {
          const empty = document.createElement('p');
          empty.className = 'instant-empty';
          empty.textContent = 'No matches yet. Try a tool name like “Smooth” or a task like “remove wax”.';
          instantResults.append(empty);
        } else {
          matches.slice(0, 8).forEach((card) => {
            const link = document.createElement('a');
            link.className = 'instant-result';
            link.href = card.getAttribute('href');
            link.setAttribute('role', 'option');
            const title = document.createElement('strong');
            title.textContent = card.querySelector('b')?.textContent?.trim() || card.textContent.trim();
            const description = document.createElement('span');
            description.textContent = card.querySelector('p')?.textContent?.trim() || 'Open this guide entry.';
            const arrow = document.createElement('span');
            arrow.className = 'instant-result-arrow';
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = '↗';
            link.append(title, description, arrow);
            instantResults.append(link);
          });
          if (matches.length > 8) {
            const more = document.createElement('p');
            more.className = 'instant-more';
            more.textContent = 'Showing 8 of ' + matches.length + ' matches. Scroll down for the full list.';
            instantResults.append(more);
          }
        }
      }
    }
  };

  const setToolFilter = (filter) => {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    filterToolCards();
  };

  filterButtons.forEach((button) => button.addEventListener('click', () => setToolFilter(button.dataset.filter)));

  folderButtons.forEach((button) => button.addEventListener('click', () => {
    if (toolSearch) toolSearch.value = '';
    setToolFilter(button.dataset.folderFilter);
    document.querySelector('#tool-explorer')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }));

  taskButtons.forEach((button) => button.addEventListener('click', () => {
    if (toolSearch) toolSearch.value = button.dataset.query || button.textContent.trim();
    setToolFilter('all');
    toolSearch?.focus();
    document.querySelector('#tool-explorer')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }));

  toolSearch?.addEventListener('input', filterToolCards);

  clearToolSearch?.addEventListener('click', () => {
    if (toolSearch) toolSearch.value = '';
    setToolFilter('all');
    toolSearch?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
        !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      toolSearch?.focus();
      document.querySelector('#tool-explorer')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    if (event.key === 'Escape' && document.activeElement === toolSearch && toolSearch.value) {
      toolSearch.value = '';
      filterToolCards();
    }
  });

  filterToolCards();
});
