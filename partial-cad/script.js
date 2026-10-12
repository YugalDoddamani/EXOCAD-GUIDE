/* exocad PartialCAD guide interactions */

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  const menuButton = document.querySelector('.hamburger');
  const overlay = document.querySelector('.overlay');
  const backToTop = document.querySelector('.back-to-top');
  const printButton = document.querySelector('.print-btn');
  const navGroups = [...document.querySelectorAll('.nav-section')];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = [...document.querySelectorAll('.help-home[id], .tool-section[id]')];
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
  const glossarySearchResults = document.querySelector('#glossary-search-results');
  const glossarySearchList = document.querySelector('#glossary-search-list');
  const glossaryEntries = [...document.querySelectorAll('.glossary-list > div')];
  const toolEmpty = document.querySelector('#tool-empty');
  const waxRescue = document.querySelector('#wax-removal-rescue');
  const clearToolSearch = document.querySelector('#clear-tool-search');
  const instantResults = document.querySelector('#instant-search-results');
  const categoryShelf = document.querySelector('.category-shelf');
  const folderButtons = [...document.querySelectorAll('[data-folder-filter]')];
  let activeFilter = 'all';
  let activeLinkFrame = null;

  const normalizeText = (value) => (value || '').normalize('NFKD').toLocaleLowerCase().replace(/[^a-z0-9+.#\s-]/g, ' ').replace(/\b(how|do|i|the|a|to|where|should|can|you)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const sectionForLink = (link) => document.getElementById(link.hash.slice(1));

  const rescues = [{ id: 'wax-removal-rescue', phrases: ['remove wax','removing wax','cut off wax','cut wax','delete wax','get rid of wax','wax removal','take off wax','shave wax'], order: ['Select Wax', 'Clone (Fill Wax)', 'Smooth'] }];

  const aliases = [
    { terms: rescues[0].phrases, extra: ['select wax','cut selection','clone','shift','smudge'] },
    { terms: ['go back','previous step','back a step','undo step','how do i go back','undo','back'], extra: ['keyboard shortcuts','workflow overview'] },
    { terms: ['where do i start','start','begin','beginner','first step','new','learn'], extra: ['workflow overview','trim scan','new to partialcad'] },
    { terms: ['bumpy','bumps','lumpy','uneven','rough'], extra: ['smooth','smooth area','smudge'] },
    { terms: ['palate','palatal','roof of mouth'], extra: ['mesh connector','major connector'] },
    { terms: ['porosity','porous','holes','voids','pits'], extra: ['mesh','filler','paint filler'] },
    { terms: ['too thick','too thin','thin wall','thickness'], extra: ['measure wax','measure thickness'] },
    { terms: ['insertion path','path of insertion','wrong path','tilt'], extra: ['survey blockout'] },
    { terms: ['logo','text marking','label'], extra: ['emboss image'] },
  ];

  const queryExpansion = (query) => {
    const normalized = normalizeText(query).replace(/\b(how|do|i|the|a|to|where|should|can|you)\b/g, ' ').replace(/\s+/g, ' ').trim();
    const extra = aliases.filter((entry) => entry.terms.some((phrase) => normalized.includes(phrase))).flatMap((entry) => entry.extra);
    return [...new Set(extra.map(normalizeText))];
  };

  const getSectionForCard = (card) => {
    const href = card.getAttribute('href') || '';
    return href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
  };

  // Tool copy is static after page load. Cache it once instead of reading every full
  // reference section on each keypress, which keeps search responsive on long pages.
  const cardFieldCache = new WeakMap();
  const getCardFields = (card) => {
    const cached = cardFieldCache.get(card);
    if (cached) return cached;
    const section = getSectionForCard(card);
    const fields = {
      title: normalizeText(card.querySelector('b')?.textContent || ''),
      aliasesText: normalizeText(card.dataset.search || ''),
      summary: normalizeText(card.querySelector('p')?.textContent || ''),
      body: normalizeText(section?.textContent || '')
    };
    cardFieldCache.set(card, fields);
    return fields;
  };

  const getScore = (card, query, expanded) => {
    if (!query) return { score: 0, reason: '' };
    const fields = getCardFields(card);
    const phrases = [query, ...expanded];
    const combined = [fields.title, fields.aliasesText, fields.summary, fields.body].join(' ');
    const phraseMatch = phrases.some((phrase) => phrase && combined.includes(phrase));
    const terms = query.split(' ').filter((term) => !['how','do','i','the','a','to','where','should','can','you'].includes(term));
    const allTermsMatch = terms.length > 0 && terms.every((term) => combined.includes(term));
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
    score += Math.min(bodyMatches, 3) * 2;
    const expandedMatches = expanded.reduce((total, phrase) => total + (fields.title.includes(phrase) ? 22 : fields.aliasesText.includes(phrase) ? 14 : fields.summary.includes(phrase) ? 6 : 0), 0);
    score += expandedMatches;
    if (!reason) reason = aliasMatches ? 'Related task wording' : summaryMatches ? 'Tool summary' : 'Instructions';
    // The explicit wax-removal path is deliberately ordered by the safest, most targeted first step.
    const rescue = rescues.find((entry) => entry.phrases.some((phrase) => query.includes(phrase)));
    if (rescue) {
      const preferred = Object.fromEntries(rescue.order.map((name, index) => [name, (rescue.order.length - index) * 500]));
      score += preferred[card.querySelector('b')?.textContent.trim()] || 0;
    }
    return { score, reason };
  };

  const renderGlossaryMatches = (query, expanded) => {
    if (!glossarySearchResults || !glossarySearchList) return [];
    glossarySearchList.replaceChildren();
    if (!query) {
      glossarySearchResults.hidden = true;
      return [];
    }
    const terms = query.split(' ').filter(Boolean);
    const matches = glossaryEntries.map((entry) => {
      const title = normalizeText(entry.querySelector('dt')?.textContent || '');
      const definition = normalizeText(entry.querySelector('dd')?.textContent || '');
      const combined = title + ' ' + definition;
      const directPhrase = combined.includes(query);
      const allTerms = terms.every((term) => combined.includes(term));
      const aliasMatch = expanded.some((phrase) => combined.includes(phrase));
      const score = (title === query ? 100 : title.includes(query) ? 70 : directPhrase ? 40 : allTerms ? 20 : aliasMatch ? 10 : 0);
      return { entry, title, definition, score };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    matches.forEach(({ entry, title }) => {
      const link = document.createElement('a');
      link.href = '#' + entry.id;
      const term = document.createElement('strong');
      term.textContent = entry.querySelector('dt')?.textContent || title;
      const definition = document.createElement('span');
      definition.textContent = entry.querySelector('dd')?.textContent || '';
      link.append(term, definition);
      glossarySearchList.append(link);
    });
    glossarySearchResults.hidden = matches.length === 0;
    return matches;
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
      snippet.textContent = reason ? `Matched: ${reason.toLowerCase()}` : '';
      snippet.hidden = false;
    } else {
      snippet.hidden = true;
    }
  };

  const guidePages = [{"title":"Workflow Overview","href":"#workflow","terms":"workflow overview steps start begin first step new to partialcad learn","desc":"See the full sequence from case setup to saving the build."},{"title":"Keyboard Shortcuts","href":"#keyboard-shortcuts","terms":"keyboard shortcuts go back previous step back a step undo step ctrl backspace ctrl z","desc":"Find the shortcuts for going back or undoing an edit."},{"title":"Mouse Controls","href":"#mouse-controls","terms":"mouse controls rotate pan zoom click controls","desc":"Review the basic mouse gestures used in PartialCAD."},{"title":"Case Setup in DentalDB","href":"#case-setup-dentaldb","terms":"case setup dentaldb upper lower flexible new case","desc":"Check the case and arch setup before entering PartialCAD."},{"title":"Hardware Requirements","href":"#requirements","terms":"hardware requirements graphics card gpu computer requirements","desc":"Check the hardware needed to run PartialCAD."},{"title":"Glossary","href":"#glossary","terms":"glossary undercut rest seat blockout relief wax riser tissue stop","desc":"Look up common framework design terms."}];

  const filterToolCards = (updateUrl = true) => {
    const rawQuery = mainToolSearch?.value ?? '';
    const query = normalizeText(rawQuery);
    const expanded = queryExpansion(rawQuery);
    const glossaryMatches = renderGlossaryMatches(query, expanded);
    const scored = toolCards.map((card, index) => ({ card, index, ...getScore(card, query, expanded) }));
    const guideMatches = query ? guidePages.map((page) => ({...page, score: (normalizeText(page.title) === query ? 160 : 0) + (normalizeText(page.terms).includes(query) ? 110 : 0) + query.split(' ').filter(Boolean).filter(term => normalizeText(page.title+' '+page.terms+' '+page.desc).includes(term)).length * 12})).filter(page => page.score > 0).sort((a,b)=>b.score-a.score) : [];
    const matchedRescue = rescues.find((entry) => entry.phrases.some((phrase) => query.includes(phrase)));
    const waxIntent = Boolean(matchedRescue);
    const waxPriority = new Set(matchedRescue?.order || []);
    const visible = scored.filter(({ card, score }) => {
      const stageMatch = activeFilter === 'all' || card.dataset.stage === activeFilter;
      const waxMatch = !waxIntent || waxPriority.has(card.querySelector('b')?.textContent.trim());
      return stageMatch && waxMatch && (!query || score > 0);
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
      ? `${visible.length + guideMatches.length} ${(visible.length + guideMatches.length) === 1 ? 'match' : 'matches'}`
      : `${toolCards.length} guide entries`;
    if (toolStatus) {
      toolStatus.textContent = query
        ? (visible.length || guideMatches.length ? `${visible.length} ranked tool results for “${rawQuery.trim()}”${glossaryMatches.length ? ` and ${glossaryMatches.length} glossary match${glossaryMatches.length === 1 ? '' : 'es'}` : ''}. Each card shows why it matched.` : (glossaryMatches.length ? `No tool cards matched “${rawQuery.trim()}”, but ${glossaryMatches.length} glossary term${glossaryMatches.length === 1 ? ' may' : 's may'} help.` : `No direct matches for “${rawQuery.trim()}”. Try a related phrase below or browse the glossary.`))
        : activeFilter === 'all'
          ? 'Search by the problem you see, the tool name, a setting, or a shortcut.'
          : `Showing entries in ${filterButtons.find((button) => button.dataset.filter === activeFilter)?.textContent || 'this category'}.`;
    }
    if (instantResults) {
      instantResults.replaceChildren();
      instantResults.hidden = !query;
      if (categoryShelf) categoryShelf.hidden = Boolean(query);
      if (query) {
        if (!visible.length && !guideMatches.length) {
          const empty = document.createElement('p');
          empty.className = 'instant-empty';
          empty.textContent = 'No matches yet. Try “Smooth”, “blockout” or “remove wax”.';
          instantResults.append(empty);
        } else if (matchedRescue) {
          const rescueTitle = document.createElement('p'); rescueTitle.className = 'instant-more'; rescueTitle.textContent = 'Try these in order'; instantResults.append(rescueTitle);
          matchedRescue.order.forEach((name, index) => {
            const card = visible.find(({ card }) => card.querySelector('b')?.textContent?.trim() === name)?.card;
            if (!card) return;
            const link = document.createElement('a'); link.className = 'instant-result'; link.href = card.getAttribute('href'); link.setAttribute('role', 'option');
            const title = document.createElement('strong'); title.textContent = `${index + 1}. ${name}`;
            const description = document.createElement('span');
            description.textContent = name === 'Select Wax' ? 'Select the area, then use Cut Selection for a clean, defined removal.' : name === 'Clone (Fill Wax)' ? 'Hold Shift while using Clone to remove a fixed thickness of wax. Hold Ctrl to add on top.' : 'Use Smooth for small local corrections when cutting a clean boundary is not ideal.';
            const arrow = document.createElement('span'); arrow.className = 'instant-result-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; link.append(title, description, arrow); instantResults.append(link);
          });
        } else {
          [...visible.slice(0, 6).map(item => ({type:'tool',...item})), ...guideMatches.slice(0,2).map(page=>({type:'guide',...page}))].sort((a,b)=>b.score-a.score).slice(0,8).forEach((result) => {
            if(result.type === 'guide') { const link=document.createElement('a'); link.className='instant-result'; link.href=result.href; link.setAttribute('role','option'); const title=document.createElement('strong'); title.textContent=result.title; const description=document.createElement('span'); description.textContent=result.desc; const arrow=document.createElement('span'); arrow.className='instant-result-arrow'; arrow.setAttribute('aria-hidden','true'); arrow.textContent='↗'; link.append(title,description,arrow); instantResults.append(link); return; }
            const card=result.card;
            const link = document.createElement('a');
            link.className = 'instant-result';
            link.href = card.getAttribute('href');
            link.setAttribute('role', 'option');
            const title = document.createElement('strong');
            title.textContent = card.querySelector('b')?.textContent?.trim() || 'Open guide entry';
            const description = document.createElement('span');
            description.textContent = card.querySelector('p')?.textContent?.trim() || 'Open this guide entry.';
            const arrow = document.createElement('span');
            arrow.className = 'instant-result-arrow';
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = '↗';
            link.append(title, description, arrow);
            instantResults.append(link);
          });
          if (visible.length > 8) {
            const more = document.createElement('p');
            more.className = 'instant-more';
            more.textContent = 'Showing 8 of ' + visible.length + ' matches. Scroll down for the full list.';
            instantResults.append(more);
          }
        }
      }
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
    if (waxRescue) waxRescue.hidden = true;
    if (updateUrl) syncQueryToUrl(rawQuery.trim());
  };

  const runSharedSearch = (source, value) => {
    if (mainToolSearch && source !== mainToolSearch) mainToolSearch.value = value;
    filterToolCards();
  };

  mainToolSearch?.addEventListener('input', () => runSharedSearch(mainToolSearch, mainToolSearch.value));

  [mainToolSearch].filter(Boolean).forEach((input) => input.addEventListener('keydown', (event) => {
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

  folderButtons.forEach((button) => button.addEventListener('click', () => {
    if (mainToolSearch) runSharedSearch(mainToolSearch, '');
    activeFilter = button.dataset.folderFilter;
    filterButtons.forEach((chip) => {
      const selected = chip.dataset.filter === activeFilter;
      chip.classList.toggle('is-active', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    filterToolCards();
    const guideExplorer = document.querySelector('.tool-explorer');
    guideExplorer?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
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

    const threshold = (document.querySelector('.site-header')?.offsetHeight ?? 60) + 40;
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


});
