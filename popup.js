'use strict';

const TASKS_KEY = 'fairdien.tasks';
const THEME_KEY = 'fairdien.theme';

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const reminderInput = document.getElementById('reminder-time');
const reminderHour = document.getElementById('reminder-hour');
const reminderMinute = document.getElementById('reminder-minute');
const reminderPeriod = document.getElementById('reminder-period');
const clearReminderButton = document.getElementById('clear-reminder');
const submitButton = document.getElementById('submit-task');
const submitLabel = document.getElementById('submit-label');
const cancelEditButton = document.getElementById('cancel-edit');
const formError = document.getElementById('form-error');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const openCount = document.getElementById('open-count');
const listSummary = document.getElementById('list-summary');
const themeToggle = document.getElementById('theme-toggle');
const liveStatus = document.getElementById('live-status');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const THEME_ORDER = ['system', 'light', 'dark'];

let tasks = [];
let currentFilter = 'active';
let editingId = null;
let statusTimer = null;
let currentTheme = 'system';

function localTimeValue(timestamp) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function populateTimeOptions() {
  for (let hour = 1; hour <= 12; hour += 1) {
    const option = document.createElement('option');
    option.value = String(hour);
    option.textContent = String(hour).padStart(2, '0');
    reminderHour.append(option);
  }
  for (let minute = 0; minute <= 59; minute += 1) {
    const option = document.createElement('option');
    option.value = String(minute).padStart(2, '0');
    option.textContent = String(minute).padStart(2, '0');
    reminderMinute.append(option);
  }
}

function syncTimePicker() {
  const hasPartialValue = Boolean(reminderHour.value || reminderMinute.value || reminderPeriod.value);
  const isComplete = Boolean(reminderHour.value && reminderMinute.value && reminderPeriod.value);
  if (isComplete) {
    let hours = Number(reminderHour.value) % 12;
    if (reminderPeriod.value === 'PM') hours += 12;
    reminderInput.value = `${String(hours).padStart(2, '0')}:${reminderMinute.value}`;
  } else {
    reminderInput.value = '';
  }
  clearReminderButton.hidden = !hasPartialValue;
  return { hasPartialValue, isComplete };
}

function setTimePicker(timeValue = '') {
  if (!timeValue) {
    reminderHour.value = '';
    reminderMinute.value = '';
    reminderPeriod.value = '';
    syncTimePicker();
    return;
  }
  const match = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!match) {
    setTimePicker('');
    return;
  }
  const twentyFourHour = Number(match[1]);
  const minute = Number(match[2]);
  if (twentyFourHour > 23 || minute > 59) {
    setTimePicker('');
    return;
  }
  reminderHour.value = String(twentyFourHour % 12 || 12);
  reminderMinute.value = String(minute).padStart(2, '0');
  reminderPeriod.value = twentyFourHour >= 12 ? 'PM' : 'AM';
  syncTimePicker();
}

function nextReminderTimestamp(timeValue) {
  const match = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const now = new Date();
  const reminder = new Date(now);
  reminder.setHours(hours, minutes, 0, 0);
  if (reminder.getTime() <= now.getTime()) reminder.setDate(reminder.getDate() + 1);
  return reminder.getTime();
}

function showStatus(message) {
  liveStatus.textContent = message;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { liveStatus.textContent = ''; }, 3000);
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function themeIcon(theme) {
  if (theme === 'light') {
    return '<circle cx="12" cy="12" r="3.7" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.8v2m0 14.4v2M2.8 12h2m14.4 0h2M5.5 5.5l1.4 1.4m10.2 10.2 1.4 1.4m0-13-1.4 1.4M6.9 17.1l-1.4 1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';
  }
  if (theme === 'dark') {
    return '<path d="M20.2 15.1A8.6 8.6 0 0 1 8.9 3.8 8.7 8.7 0 1 0 20.2 15.1Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  return '<rect x="3.5" y="4" width="17" height="12.5" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 20h8m-4-3.5V20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>';
}

function applyTheme(theme) {
  currentTheme = THEME_ORDER.includes(theme) ? theme : 'system';
  if (currentTheme === 'light' || currentTheme === 'dark') {
    document.documentElement.dataset.theme = currentTheme;
  } else {
    delete document.documentElement.dataset.theme;
  }
  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(currentTheme) + 1) % THEME_ORDER.length];
  const label = `Appearance: ${currentTheme}. Click to switch to ${nextTheme}.`;
  themeToggle.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none">${themeIcon(currentTheme)}</svg>`;
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}

async function loadInitialState() {
  const stored = await chrome.storage.local.get([TASKS_KEY, THEME_KEY]);
  tasks = Array.isArray(stored[TASKS_KEY]) ? stored[TASKS_KEY] : [];
  applyTheme(stored[THEME_KEY] || 'system');
  renderTasks();
}

function saveTasks(nextTasks) {
  tasks = nextTasks;
  renderTasks();
  return chrome.storage.local.set({ [TASKS_KEY]: tasks });
}

function dateLabel(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const isTomorrow = date.getFullYear() === tomorrow.getFullYear()
    && date.getMonth() === tomorrow.getMonth()
    && date.getDate() === tomorrow.getDate();
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  if (sameDay) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  const day = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
  return `${day}, ${time}`;
}

function makeIcon(pathMarkup, viewBox = '0 0 24 24') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = pathMarkup;
  return svg;
}

function sortTasks(items) {
  return [...items].sort((a, b) => {
    if (Boolean(a.completedAt) !== Boolean(b.completedAt)) return a.completedAt ? 1 : -1;
    if (!a.completedAt && a.remindAt && b.remindAt) return a.remindAt - b.remindAt;
    if (!a.completedAt && a.remindAt) return -1;
    if (!a.completedAt && b.remindAt) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

function buildTaskCard(task) {
  const card = document.createElement('article');
  card.className = `task-card${task.completedAt ? ' is-completed' : ''}`;
  card.dataset.taskId = task.id;

  const checkLabel = document.createElement('label');
  checkLabel.className = 'check-wrap';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(task.completedAt);
  checkbox.dataset.action = 'toggle';
  checkbox.setAttribute('aria-label', task.completedAt ? `Reopen ${task.title}` : `Complete ${task.title}`);
  const checkVisual = document.createElement('span');
  checkVisual.className = 'check-visual';
  checkVisual.append(makeIcon('<path d="m5.5 12.5 4.1 4.1L18.5 7.7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'));
  checkLabel.append(checkbox, checkVisual);

  const main = document.createElement('div');
  main.className = 'task-main';
  const title = document.createElement('span');
  title.className = 'task-title';
  title.textContent = task.title;
  main.append(title);

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  if (task.remindAt) {
    const reminder = document.createElement('span');
    const overdue = !task.completedAt && task.remindAt < Date.now() && !task.notifiedAt;
    reminder.className = `meta-reminder${overdue ? ' is-overdue' : ''}`;
    reminder.append(makeIcon('<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'));
    reminder.append(document.createTextNode(task.notifiedAt ? 'Reminder sent' : dateLabel(task.remindAt)));
    meta.append(reminder);
  } else {
    const noReminder = document.createElement('span');
    noReminder.textContent = 'No reminder set';
    meta.append(noReminder);
  }
  if (task.completedAt) {
    const separator = document.createElement('span');
    separator.className = 'meta-separator';
    const completed = document.createElement('span');
    completed.textContent = 'Completed';
    meta.append(separator, completed);
  }
  main.append(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-button';
  editButton.dataset.action = 'edit';
  editButton.setAttribute('aria-label', `Edit ${task.title}`);
  editButton.title = 'Edit task';
  editButton.append(makeIcon('<path d="m14.5 5.5 4 4M4 20l4.1-.9L19 8.2a2.1 2.1 0 0 0-3-3L5.1 16.1 4 20Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'));
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-button';
  deleteButton.dataset.action = 'delete';
  deleteButton.setAttribute('aria-label', `Delete ${task.title}`);
  deleteButton.title = 'Delete task';
  deleteButton.append(makeIcon('<path d="M4.5 7h15M9 7V4.5h6V7m-8.5 0 1 13h9l1-13M10 10.5v6m4-6v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'));
  actions.append(editButton, deleteButton);
  card.append(checkLabel, main, actions);
  return card;
}

function renderTasks() {
  const openTasks = tasks.filter(task => !task.completedAt);
  const filtered = currentFilter === 'active'
    ? tasks.filter(task => !task.completedAt)
    : currentFilter === 'completed'
      ? tasks.filter(task => Boolean(task.completedAt))
      : tasks;
  const sorted = sortTasks(filtered);
  openCount.textContent = String(openTasks.length);
  listSummary.textContent = `${openTasks.length} OPEN`;
  taskList.replaceChildren(...sorted.map(buildTaskCard));
  const isEmpty = sorted.length === 0;
  emptyState.hidden = !isEmpty;
  taskList.hidden = isEmpty;
  if (isEmpty) {
    const title = emptyState.querySelector('.empty-title');
    const copy = emptyState.querySelector('.empty-copy');
    if (currentFilter === 'completed') {
      title.textContent = 'No completed tasks yet.';
      copy.textContent = 'Finished tasks will be kept here for a quick look back.';
    } else if (currentFilter === 'all' && tasks.length === 0) {
      title.textContent = 'Nothing on your list.';
      copy.textContent = 'Add a task above and give your day a little direction.';
    } else {
      title.textContent = 'You’re all caught up.';
      copy.textContent = 'No open tasks right now. Enjoy the clear space.';
    }
  }
  filterButtons.forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function resetComposer() {
  editingId = null;
  form.reset();
  setTimePicker('');
  submitLabel.textContent = 'Create task';
  cancelEditButton.hidden = true;
  document.getElementById('create-heading').textContent = 'Create a task';
  showFormError('');
}

function beginEdit(task) {
  editingId = task.id;
  titleInput.value = task.title;
  setTimePicker(task.remindAt ? localTimeValue(task.remindAt) : '');
  submitLabel.textContent = 'Save changes';
  cancelEditButton.hidden = false;
  document.getElementById('create-heading').textContent = 'Edit task';
  showFormError('');
  titleInput.focus();
  document.querySelector('.composer-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

populateTimeOptions();
[reminderHour, reminderMinute, reminderPeriod].forEach(select => {
  select.addEventListener('change', () => {
    syncTimePicker();
    showFormError('');
  });
});
clearReminderButton.addEventListener('click', () => {
  setTimePicker('');
  showFormError('');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    showFormError('Add a task name before creating it.');
    titleInput.focus();
    return;
  }
  const timeSelection = syncTimePicker();
  if (timeSelection.hasPartialValue && !timeSelection.isComplete) {
    showFormError('Complete the reminder time or clear it.');
    return;
  }
  let remindAt = null;
  if (reminderInput.value) {
    remindAt = nextReminderTimestamp(reminderInput.value);
    if (!Number.isFinite(remindAt)) {
      showFormError('Choose a valid reminder time.');
      return;
    }
  }

  try {
    if (editingId) {
      const previous = tasks.find(task => task.id === editingId);
      if (!previous) {
        resetComposer();
        return;
      }
      const reminderChanged = (previous.remindAt || null) !== remindAt;
      const updated = tasks.map(task => task.id === editingId ? {
        ...task,
        title,
        remindAt,
        notifiedAt: reminderChanged ? null : task.notifiedAt
      } : task);
      await saveTasks(updated);
      resetComposer();
      showStatus('Task updated.');
    } else {
      const task = {
        id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        title,
        createdAt: Date.now(),
        completedAt: null,
        remindAt,
        notifiedAt: null
      };
      await saveTasks([task, ...tasks]);
      resetComposer();
      showStatus(remindAt ? 'Task created with a reminder.' : 'Task created.');
    }
  } catch (error) {
    console.error('Could not save task:', error);
    showFormError('Your task could not be saved. Please try again.');
  }
});

cancelEditButton.addEventListener('click', resetComposer);

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

taskList.addEventListener('change', async event => {
  const checkbox = event.target.closest('input[data-action="toggle"]');
  if (!checkbox) return;
  const card = checkbox.closest('[data-task-id]');
  const id = card?.dataset.taskId;
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  const completedAt = checkbox.checked ? Date.now() : null;
  const updated = tasks.map(item => item.id === id ? {
    ...item,
    completedAt,
    notifiedAt: !completedAt && item.remindAt && item.remindAt > Date.now() ? null : item.notifiedAt
  } : item);
  try {
    await saveTasks(updated);
    showStatus(completedAt ? 'Task completed.' : 'Task reopened.');
  } catch (error) {
    console.error('Could not update task:', error);
    showStatus('Could not update the task.');
  }
});

taskList.addEventListener('click', async event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.closest('[data-task-id]')?.dataset.taskId;
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  if (button.dataset.action === 'edit') {
    beginEdit(task);
    return;
  }
  if (button.dataset.action === 'delete') {
    const nextTasks = tasks.filter(item => item.id !== id);
    try {
      await saveTasks(nextTasks);
      if (editingId === id) resetComposer();
      showStatus('Task deleted.');
    } catch (error) {
      console.error('Could not delete task:', error);
      showStatus('Could not delete the task.');
    }
  }
});

themeToggle.addEventListener('click', async () => {
  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(currentTheme) + 1) % THEME_ORDER.length];
  applyTheme(nextTheme);
  try {
    await chrome.storage.local.set({ [THEME_KEY]: nextTheme });
  } catch (error) {
    console.error('Could not save theme:', error);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes[TASKS_KEY]) {
    tasks = Array.isArray(changes[TASKS_KEY].newValue) ? changes[TASKS_KEY].newValue : [];
    renderTasks();
  }
  if (changes[THEME_KEY]) applyTheme(changes[THEME_KEY].newValue || 'system');
});

loadInitialState().catch(error => {
  console.error('Could not load Fairdien:', error);
  showFormError('Could not load your tasks. Try reopening the extension.');
});
