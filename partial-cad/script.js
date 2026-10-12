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

  // Interactive workflow map and searchable tool library.
  const toolSearch = document.querySelector('#tool-search');
  const toolCards = [...document.querySelectorAll('.tool-card')];
  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  const toolCount = document.querySelector('#tool-count');
  const toolStatus = document.querySelector('#tool-search-status');
  const toolEmpty = document.querySelector('#tool-empty');
  const clearToolSearch = document.querySelector('#clear-tool-search');
  const workflowNodes = [...document.querySelectorAll('.workflow-node[data-stage]')];
  const stageTitle = document.querySelector('#stage-detail-title');
  const stageDescription = document.querySelector('#stage-detail-description');
  const stageStep = document.querySelector('#stage-step');
  const stageToolLinks = document.querySelector('#stage-tool-links');
  let activeFilter = 'all';
  const stages = {
    prepare: { number:'01 / 05', title:'Prepare', description:'Start with scan and case context. Explore preparation tools and setup information documented in the guide.', links:[['Trim Scan','#trim-scan'],['Hardware requirements','#requirements'],['Mouse controls','#mouse-controls']] },
    analyse: { number:'02 / 05', title:'Analyse', description:'Explore survey and blockout information, then find the controls used to review or edit that preparation. Exact paths depend on the case and documented workflow.', links:[['Survey / Blockout','#survey'],['Edit Blockout','#edit-blockout'],['Secondary Blockout','#secondary-blockout']] },
    construct: { number:'03 / 05', title:'Construct', description:'Find guide entries for adding parts and working with framework elements. Some operations are design-dependent; consult the original workflow notes.', links:[['Add Parts','#add-parts'],['Draw Connector','#draw-connector'],['Mesh & Connector','#mesh-connector'],['Bar','#bar'],['Apply Clasps','#apply-clasps']] },
    refine: { number:'04 / 05', title:'Refine & detail', description:'Explore editing and detailing tools. This is a discovery category, not a claim that every tool must be used or that operations occur in a fixed order.', links:[['Smooth','#smooth'],['Smudge','#smudge'],['Select Wax','#select-wax'],['Emboss with Curve','#emboss-curve'],['Filler','#filler'],['Measure Wax','#measure-wax']] },
    finish: { number:'05 / 05', title:'Assemble & export', description:'Review the guide material for assembling parts and preparing build output. Consult documented settings and case-specific instructions before exporting.', links:[['Assemble Parts','#assemble-parts'],['Save for Build','#save-build']] }
  };
  const normalizeToolText = (value) => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const filterToolCards = () => {
    const query = normalizeToolText(toolSearch?.value ?? '');
    let visible = 0;
    toolCards.forEach((card) => {
      const stageMatch = activeFilter === 'all' || card.dataset.stage === activeFilter;
      const haystack = normalizeToolText(card.textContent + ' ' + (card.dataset.search || ''));
      const queryMatch = !query || query.split(' ').every((term) => haystack.includes(term));
      card.hidden = !(stageMatch && queryMatch);
      if (!card.hidden) visible += 1;
    });
    if (toolCount) toolCount.textContent = visible + (visible === 1 ? ' tool shown' : ' tools shown');
    if (toolStatus) toolStatus.textContent = query
      ? visible + (visible === 1 ? ' result' : ' results') + ' for “' + toolSearch.value.trim() + '”.'
      : activeFilter === 'all' ? 'Showing tools from the existing guide.' : 'Showing tools in ' + (filterButtons.find((button) => button.dataset.filter === activeFilter)?.textContent || 'this stage') + '.';
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
  const selectStage = (stage) => {
    const data = stages[stage];
    if (!data) return;
    workflowNodes.forEach((node) => {
      const selected = node.dataset.stage === stage;
      node.classList.toggle('is-selected', selected);
      node.setAttribute('aria-pressed', String(selected));
    });
    if (stageTitle) stageTitle.textContent = data.title;
    if (stageDescription) stageDescription.textContent = data.description;
    if (stageStep) stageStep.textContent = data.number;
    if (stageToolLinks) {
      stageToolLinks.replaceChildren();
      data.links.forEach(([label, href]) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label + ' ↗';
        stageToolLinks.append(link);
      });
    }
    if (toolSearch) toolSearch.value = '';
    setToolFilter(stage);
  };
  workflowNodes.forEach((node) => node.addEventListener('click', () => selectStage(node.dataset.stage)));
  filterButtons.forEach((button) => button.addEventListener('click', () => setToolFilter(button.dataset.filter)));
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
    }
    if (event.key === 'Escape' && document.activeElement === toolSearch && toolSearch.value) {
      toolSearch.value = '';
      filterToolCards();
    }
  });
  filterToolCards();

});
