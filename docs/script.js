(() => {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const copyButton = document.getElementById('copyCloneCommand');
  const cloneCommand = document.getElementById('cloneCommand');
  const toast = document.getElementById('toast');
  const year = document.getElementById('year');
  const themeKey = 'fairdien-site-theme';
  const themeModes = ['system', 'light', 'dark'];
  const command = 'git clone https://github.com/darshseraphic/Fairdien.git';
  let toastTimer = 0;
  let copyTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  }

  function applyTheme(mode, persist = true) {
    const next = themeModes.includes(mode) ? mode : 'system';
    root.dataset.theme = next;
    if (themeLabel) {
      themeLabel.textContent = next[0].toUpperCase() + next.slice(1);
    }
    if (themeToggle) {
      const label = `Color theme: ${next}. Click to switch to ${themeModes[(themeModes.indexOf(next) + 1) % themeModes.length]}.`;
      themeToggle.setAttribute('aria-label', label);
      themeToggle.title = label;
    }
    if (persist) {
      try {
        window.localStorage.setItem(themeKey, next);
      } catch (error) {
        console.warn('Fairdien website could not save the theme preference.', error);
      }
    }
  }

  let storedTheme = 'system';
  try {
    storedTheme = window.localStorage.getItem(themeKey) || 'system';
  } catch (error) {
    console.warn('Fairdien website could not read the theme preference.', error);
  }
  applyTheme(storedTheme, false);

  themeToggle?.addEventListener('click', () => {
    const current = themeModes.includes(root.dataset.theme) ? root.dataset.theme : 'system';
    const next = themeModes[(themeModes.indexOf(current) + 1) % themeModes.length];
    applyTheme(next);
  });

  copyButton?.addEventListener('click', async () => {
    const text = cloneCommand?.textContent?.trim() || command;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copyButton.textContent = 'Copied';
        showToast('Clone command copied.');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (error) {
      if (cloneCommand) {
        const range = document.createRange();
        range.selectNodeContents(cloneCommand);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      copyButton.textContent = 'Select to copy';
      showToast('The command is selected. Copy it from the page.');
    }

    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2200);
  });

  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
})();
