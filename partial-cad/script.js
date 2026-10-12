/* ===== exocad PartialCAD Guide - JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- SIDEBAR TOGGLE (mobile) ----------
  const hamburger = document.querySelector('.hamburger');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.querySelector('.overlay');

  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Close sidebar when a link is clicked (mobile)
  sidebar?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      }
    });
  });

  // ---------- SEARCH ----------
  const searchInput = document.querySelector('.search-input');
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    sidebar.querySelectorAll('.nav-links a').forEach(a => {
      const text = a.textContent.toLowerCase();
      a.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
    // Show/hide section titles based on visible children
    sidebar.querySelectorAll('.nav-section').forEach(sec => {
      const visibleLinks = sec.querySelectorAll('.nav-links a:not([style*="display: none"])');
      sec.style.display = visibleLinks.length ? '' : 'none';
    });
  });

  // ---------- SECTION COLLAPSE ----------
  document.querySelectorAll('.nav-section-title').forEach(title => {
    title.addEventListener('click', () => {
      title.parentElement.classList.toggle('collapsed');
    });
  });

  // ---------- ACTIVE LINK HIGHLIGHTING ----------
  const sections = document.querySelectorAll('.tool-section[id]');
  const navLinks = sidebar?.querySelectorAll('.nav-links a[href^="#"]');

  const updateActiveLink = () => {
    let currentId = '';
    const offset = 100;
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top < offset) currentId = section.id;
    });
    navLinks?.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ---------- READING PROGRESS BAR ----------
  const progressBar = document.querySelector('.reading-progress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- BACK TO TOP ----------
  const backBtn = document.querySelector('.back-to-top');
  const toggleBackBtn = () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', toggleBackBtn, { passive: true });
  backBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- SMOOTH SECTION TRANSITIONS ----------
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(18px)';
    section.style.transition = 'opacity .45s ease, transform .45s ease';
    observer.observe(section);
  });

  // ---------- EXPAND / COLLAPSE ALL ----------
  const expandAllBtn = document.querySelector('.expand-all');
  expandAllBtn?.addEventListener('click', () => {
    const collapsed = sidebar.querySelectorAll('.nav-section.collapsed');
    collapsed.forEach(sec => sec.classList.remove('collapsed'));
  });

  // ---------- PRINT BUTTON ----------
  const printBtn = document.querySelector('.print-btn');
  printBtn?.addEventListener('click', () => window.print());

});
