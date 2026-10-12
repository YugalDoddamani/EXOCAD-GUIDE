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
  const sections = [...document.querySelectorAll('.help-home[id], .hero[id], .tool-section[id]')];
  const mobileNavigation = window.matchMedia('(max-width: 920px)');

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

    if (!open && returnFocus) {
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

  // ---------- SHARED SEARCH: SIDEBAR + MAIN FINDER ----------
  const mainToolSearch = document.querySelector('#tool-search');
  const toolCards = [...document.querySelectorAll('.tool-card')];
  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  const taskButtons = [...document.querySelectorAll('.task-shortcut')];
  const toolCount = document.querySelector('#tool-count');
  const toolStatus = document.querySelector('#tool-search-status');
  const toolEmpty = document.querySelector('#tool-empty');
  const waxRescue = document.querySelector('#wax-removal-rescue');
  const clearToolSearch = document.querySelector('#clear-tool-search');
  let activeFilter = 'all';
  let collapsedBeforeSearch = null;
  let activeLinkFrame = null;

  const normalizeText = (value) => (value || '').normalize('NFKD').toLocaleLowerCase().replace(/[^a-z0-9+.#\\s-]/g, ' ').replace(/\\s+/g, ' ').trim();
  const sectionForLink = (link) => document.getElementById(link.hash.slice(1));
  const navSearchIndex = navLinks.map((link) => {
    const target = sectionForLink(link);
    return { link, group: link.closest('.nav-section'), text: normalizeText(`${link.textContent} ${target?.textContent ?? ''}`) };
  });

  const aliases = [
    { terms: ['remove wax','removing wax','cut off wax','cut wax','wax removal','take off wax','shave wax'], extra: ['select wax','cut selection','clone','shift','smudge'] },
    { terms: ['bumpy','bumps','lumpy','uneven','rough'], extra: ['smooth','smooth area','smudge'] },
    { terms: ['palate','palatal','roof of mouth'], extra: ['mesh connector','major connector'] },
    { terms: ['porosity','porous','holes','voids','pits'], extra: ['mesh','filler','paint filler'] },
    { terms: ['too thick','too thin','thin wall','thickness'], extra: ['measure wax','measure thickness'] },
    { terms: ['insertion path','path of insertion','wrong path','tilt'], extra: ['survey blockout'] },
    { terms: ['logo','text marking','label'], extra: ['emboss image'] },
  ];

  const queryExpansion = (query) => {
    const normalized = normalizeText(query);
    const extra = aliases.filter((entry) => entry.terms.some((phrase) => normalized.includes(phrase))).flatMap((entry) => entry.extra);
    return [...new Set(extra.map(normalizeText))];
  };

  const getSectionForCard = (card) => {
    const href = card.getAttribute('href') || '';
    return href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
  };

  const getCardFields = (card) => {
    const section = getSectionForCard(card);
    const title = normalizeText(card.querySelector('b')?.textContent || '');
    const aliasesText = normalizeText(card.dataset.search || '');
    const summary = normalizeText(card.querySelector('p')?.textContent || '');
    const body = normalizeText(section?.textContent || '');
    return { title, aliasesText, summary, body };
  };

  const getScore = (card, query, expanded) => {
    if (!query) return { score: 0, reason: '' };
    const fields = getCardFields(card);
    const phrases = [query, ...expanded];
    const combined = [fields.title, fields.aliasesText, fields.summary, fields.body].join(' ');
    const phraseMatch = phrases.some((phrase) => phrase && combined.includes(phrase));
    const terms = query.split(' ').filter(Boolean);
    const allTermsMatch = terms.every((term) => combined.includes(term));
    if (!phraseMatch && !allTermsMatch) return { score: 0, reason: '' };
    let score = 0;
    let reason = '';
    if (fields.title === query) { score += 140; reason = 'Exact tool name'; }
    else if (fields.title.includes(query)) { score += 100; reason = 'Tool name'; }
    if (phrases.some((phrase) => fields.aliasesText.includes(phrase))) {
      score += 65;
      if (!reason) reason = 'Related task or synonym';
    }
    const titleMatches = terms.filter((term) => fields.title.includes(term)).length;
    score += titleMatches * 24;
    const aliasMatches = terms.filter((term) => fields.aliasesText.includes(term)).length;
    score += aliasMatches * 9;
    const summaryMatches = terms.filter((term) => fields.summary.includes(term)).length;
    score += summaryMatches * 7;
    const bodyMatches = terms.filter((term) => fields.body.includes(term)).length;
    score += bodyMatches * 2;
    const expandedMatches = expanded.reduce((total, phrase) => total + (fields.title.includes(phrase) ? 22 : fields.aliasesText.includes(phrase) ? 14 : fields.summary.includes(phrase) ? 6 : 0), 0);
    score += expandedMatches;
    if (!reason) reason = aliasMatches ? 'Related task wording' : summaryMatches ? 'Tool summary' : 'Instructions';
    // The explicit wax-removal path is deliberately ordered by the safest, most targeted first step.
    if (/remove wax|removing wax|cut off wax|cut wax|wax removal|take off wax|shave wax/.test(query)) {
      const preferred = { 'Select Wax': 500, 'Clone (Fill Wax)': 400, 'Smooth': 300 };
      score += preferred[card.querySelector('b')?.textContent.trim()] || 0;
    }
    return { score, reason };
  };

  const syncQueryToUrl = (query) => {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  };

  const showMatchSnippet = (card, reason, query) => {
    let snippet = card.querySelector('.tool-match-snippet');
    if (!snippet) {
      snippet = document.createElement('span');
      snippet.className = 'tool-match-snippet';
      snippet.setAttribute('aria-live', 'polite');
      const summary = card.querySelector('p');
      if (summary) summary.insertAdjacentElement('afterend', snippet);
      else card.append(snippet);
    }
    if (query) {
      const text = card.querySelector('p')?.textContent.trim() || '';
      snippet.textContent = reason + (text ? ': ' + text : '');
      snippet.hidden = false;
    } else {
      snippet.hidden = true;
    }
  };

  const syncSidebarSearch = (query) => {
    const terms = normalizeText(query).split(' ').filter(Boolean);
    const matchingItems = navSearchIndex.filter(({ text }) => terms.every((term) => text.includes(term)));
    const matchedLinks = new Set(matchingItems.map(({ link }) => link));
    if (query && collapsedBeforeSearch === null) {
      collapsedBeforeSearch = new Set(navGroups.filter((group) => group.classList.contains('collapsed')));
    }
    navSearchIndex.forEach(({ link }) => { link.hidden = Boolean(query) && !matchedLinks.has(link); });
    navGroups.forEach((group) => {
      const hasMatch = [...group.querySelectorAll('.nav-links a')].some((link) => !link.hidden);
      group.hidden = Boolean(query) && !hasMatch;
      if (query && hasMatch) {
        group.classList.remove('collapsed');
        group.querySelector('.nav-section-title')?.setAttribute('aria-expanded', 'true');
      }
    });
    if (!query) {
      if (collapsedBeforeSearch) {
        navGroups.forEach((group) => {
          const shouldCollapse = collapsedBeforeSearch.has(group);
          group.classList.toggle('collapsed', shouldCollapse);
          group.querySelector('.nav-section-title')?.setAttribute('aria-expanded', String(!shouldCollapse));
        });
        collapsedBeforeSearch = null;
      }
      navGroups.forEach((group) => { group.hidden = false; });
      navSearchIndex.forEach(({ link }) => { link.hidden = false; });
    }
    if (searchStatus) searchStatus.textContent = query
      ? (matchingItems.length ? `${matchingItems.length} navigation sections match “${query}”. Main results are ranked by relevance.` : `No navigation links match “${query}”; check the ranked results.`)
      : 'Search across tool names, settings, and instructions.';
  };

  const filterToolCards = (updateUrl = true) => {
    const rawQuery = toolSearch?.value ?? searchInput?.value ?? '';
    const query = normalizeText(rawQuery);
    const expanded = queryExpansion(rawQuery);
    const scored = toolCards.map((card, index) => ({ card, index, ...getScore(card, query, expanded) }));
    const visible = scored.filter(({ card }) => {
      const stageMatch = activeFilter === 'all' || card.dataset.stage === activeFilter;
      return stageMatch && (!query || getScore(card, query, expanded).score > 0);
    }).sort((a, b) => (b.score - a.score) || (a.index - b.index));
    const visibleSet = new Set(visible.map((item) => item.card));
    visible.forEach(({ card, reason }) => {
      card.hidden = false;
      showMatchSnippet(card, reason, query);
      const grid = card.parentElement;
      if (grid) grid.appendChild(card);
    });
    toolCards.forEach((card) => {
      if (!visibleSet.has(card)) card.hidden = true;
      if (!query) showMatchSnippet(card, '', '');
    });
    if (toolCount) toolCount.textContent = query || activeFilter !== 'all'
      ? `${visible.length} ${visible.length === 1 ? 'match' : 'matches'}`
      : `${toolCards.length} guide entries`;
    if (toolStatus) {
      toolStatus.textContent = query
        ? (visible.length ? `${visible.length} ranked results for “${rawQuery.trim()}”. Each card shows why it matched.` : `No direct matches for “${rawQuery.trim()}”. Try a related phrase below or browse the glossary.`)
        : activeFilter === 'all'
          ? 'Search by the problem you see, the tool name, a setting, or a shortcut.'
          : `Showing entries in ${filterButtons.find((button) => button.dataset.filter === activeFilter)?.textContent || 'this category'}.`;
    }
    if (toolEmpty) {
      toolEmpty.hidden = visible.length !== 0;
      const suggestion = toolEmpty.querySelector('p');
      if (suggestion && query) {
        const close = aliases.find((entry) => entry.terms.some((phrase) => query.includes(phrase) || phrase.includes(query)));
        suggestion.textContent = close
          ? `Try these related terms: ${close.extra.join(', ')}. Or search the glossary below.`
          : 'Try a broader term such as wax, rough, undercut, connector, thickness, or one of the glossary terms.';
      }
    }
    if (waxRescue) {
      const waxQuery = /remove wax|removing wax|cut off wax|cut wax|wax removal|take off wax|shave wax/.test(query);
      waxRescue.hidden = !waxQuery;
    }
    if (updateUrl) syncQueryToUrl(rawQuery.trim());
  };

  const runSharedSearch = (source, value) => {
    if (mainToolSearch && source !== mainToolSearch) mainToolSearch.value = value;
    if (searchInput && source !== searchInput) searchInput.value = value;
    filterToolCards();
    syncSidebarSearch(value.trim());
  };

  searchInput?.addEventListener('input', () => runSharedSearch(searchInput, searchInput.value));
  mainToolSearch?.addEventListener('input', () => runSharedSearch(mainToolSearch, mainToolSearch.value));

  [searchInput, mainToolSearch].filter(Boolean).forEach((input) => input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      runSharedSearch(input, '');
      input.focus();
    }
  }));

  filterButtons.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((chip) => {
      const selected = chip.dataset.filter === activeFilter;
      chip.classList.toggle('is-active', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    filterToolCards();
  }));

  taskButtons.forEach((button) => button.addEventListener('click', () => {
    const query = button.dataset.query || button.textContent.trim();
    runSharedSearch(mainToolSearch, query);
    mainToolSearch?.focus();
    document.querySelector('#tool-explorer')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }));

  clearToolSearch?.addEventListener('click', () => {
    runSharedSearch(mainToolSearch, '');
    mainToolSearch?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
        !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      mainToolSearch?.focus();
      document.querySelector('#tool-explorer')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  });

  // Restore a shared search from ?q=... when the page opens.
  const initialQuery = new URLSearchParams(window.location.search).get('q') || '';
  if (mainToolSearch) mainToolSearch.value = initialQuery;
  if (searchInput) searchInput.value = initialQuery;
  syncSidebarSearch(initialQuery);
  filterToolCards(false);
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
    const heading = target?.matches('.hero, .help-home')
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
        if (sidebar && !mobileNavigation.matches && !link.hidden) {
          const itemRect = link.getBoundingClientRect();
          const sideRect = sidebar.getBoundingClientRect();
          if (itemRect.top < sideRect.top + 70 || itemRect.bottom > sideRect.bottom - 24) {
            sidebar.scrollTo({ top: sidebar.scrollTop + itemRect.top - sideRect.top - 90, behavior: 'auto' });
          }
        }
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
