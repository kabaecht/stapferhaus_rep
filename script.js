const shell = document.getElementById('shell');
const timelineList = document.getElementById('timelineList');
const timeline = document.querySelector('.timeline');
const panels = Array.from(document.querySelectorAll('.panel'));

const numberedPanels = Array.from(document.querySelectorAll('.panel')).filter((panel) => panel.querySelector('.index'));
const timelineItems = [];

function scrollToPanel(panel) {
  const isMobile = window.matchMedia('(max-width: 980px)').matches;

  if (isMobile) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  shell.scrollTo({
    left: panel.offsetLeft,
    behavior: 'smooth'
  });
}

function isDesktopViewport() {
  return !window.matchMedia('(max-width: 980px)').matches;
}

const WHEEL_SCROLL_FACTOR = 0.65;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMaxScrollLeft() {
  return Math.max(0, shell.scrollWidth - shell.clientWidth);
}

function applyWheelScroll(deltaY, deltaMode) {
  const deltaScale = deltaMode === 1 ? 16 : deltaMode === 2 ? window.innerHeight : 1;
  const maxScroll = getMaxScrollLeft();
  const nextScroll = shell.scrollLeft + deltaY * deltaScale * WHEEL_SCROLL_FACTOR;
  shell.scrollLeft = clamp(nextScroll, 0, maxScroll);
}

function buildTimeline() {
  if (!timelineList) {
    return;
  }

  numberedPanels.forEach((panel) => {
    const indexElement = panel.querySelector('.index');
    if (!indexElement) {
      return;
    }

    const number = indexElement.textContent.trim();
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'timeline-item';
    item.textContent = number;
    item.setAttribute('aria-label', `Gehe zu Abschnitt ${number}`);

    item.addEventListener('click', () => {
      scrollToPanel(panel);
    });

    const listEntry = document.createElement('li');
    listEntry.appendChild(item);
    timelineList.appendChild(listEntry);
    timelineItems.push(item);
  });
}

function updateActiveTimelineItem() {
  if (!timelineItems.length || !panels.length) {
    return;
  }

  const isMobile = window.matchMedia('(max-width: 980px)').matches;
  const viewportCenter = isMobile ? window.innerHeight / 2 : window.innerWidth / 2;
  if (timeline) {
    const heroPanel = document.querySelector('.hero-image')?.closest('.panel');
    if (heroPanel) {
      const heroRect = heroPanel.getBoundingClientRect();
      const isHeroOutOfViewport = isMobile ? heroRect.bottom <= 0 : heroRect.right <= 0;
      timeline.classList.toggle('is-visible', isHeroOutOfViewport);
    } else {
      timeline.classList.remove('is-visible');
    }
  }

  let activeIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  numberedPanels.forEach((panel, index) => {
    const rect = panel.getBoundingClientRect();
    const panelCenter = isMobile ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
    const distance = Math.abs(panelCenter - viewportCenter);

    if (distance < bestDistance) {
      bestDistance = distance;
      activeIndex = index;
    }
  });

  timelineItems.forEach((item, index) => {
    item.classList.toggle('is-active', index === activeIndex);
  });
}

buildTimeline();
updateActiveTimelineItem();

shell.addEventListener('wheel', (event) => {
  if (!isDesktopViewport()) {
    return;
  }

  if (Math.abs(event.deltaX) > 0) {
    return;
  }

  if (Math.abs(event.deltaY) > 0) {
    event.preventDefault();
    applyWheelScroll(event.deltaY, event.deltaMode);
  }
}, { passive: false });

shell.addEventListener('scroll', updateActiveTimelineItem, { passive: true });
window.addEventListener('scroll', updateActiveTimelineItem, { passive: true });
window.addEventListener('resize', () => {
  shell.scrollLeft = clamp(shell.scrollLeft, 0, getMaxScrollLeft());
  updateActiveTimelineItem();
});

// Touch-Support für mobile Geräte
let touchStartX = 0;
let touchScrollLeft = 0;

shell.addEventListener('touchstart', (event) => {
  if (!isDesktopViewport()) {
    return;
  }

  touchStartX = event.touches[0].clientX;
  touchScrollLeft = shell.scrollLeft;
}, { passive: true });

shell.addEventListener('touchmove', (event) => {
  if (!isDesktopViewport()) {
    return;
  }

  const touchCurrentX = event.touches[0].clientX;
  const diff = touchStartX - touchCurrentX;
  shell.scrollLeft = touchScrollLeft + diff;
}, { passive: true });







