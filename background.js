'use strict';

const TASKS_KEY = 'fairdien.tasks';
const ALARM_PREFIX = 'fairdien:task:';
const NOTIFICATION_PREFIX = 'fairdien:notification:';
const SNOOZE_MINUTES = 10;

async function readTasks() {
  const data = await chrome.storage.local.get(TASKS_KEY);
  return Array.isArray(data[TASKS_KEY]) ? data[TASKS_KEY] : [];
}

async function writeTasks(tasks) {
  await chrome.storage.local.set({ [TASKS_KEY]: tasks });
}

async function clearTaskAlarm(taskId) {
  await chrome.alarms.clear(`${ALARM_PREFIX}${taskId}`);
}

async function scheduleTask(task) {
  const alarmName = `${ALARM_PREFIX}${task.id}`;
  await chrome.alarms.clear(alarmName);
  if (!task || task.completedAt || !Number.isFinite(task.remindAt) || task.notifiedAt) return;
  const when = Math.max(task.remindAt, Date.now() + 1000);
  chrome.alarms.create(alarmName, { when });
}

async function syncAlarms() {
  const tasks = await readTasks();
  const existing = await chrome.alarms.getAll();
  await Promise.all(existing
    .filter(alarm => alarm.name.startsWith(ALARM_PREFIX))
    .map(alarm => chrome.alarms.clear(alarm.name)));
  await Promise.all(tasks.map(scheduleTask));

  // Remove a reminder notification when its task was completed, deleted, or rescheduled.
  const validNotifications = new Set(tasks
    .filter(task => !task.completedAt && task.notifiedAt)
    .map(task => `${NOTIFICATION_PREFIX}${task.id}`));
  const notifications = await chrome.notifications.getAll();
  await Promise.all(Object.keys(notifications)
    .filter(id => id.startsWith(NOTIFICATION_PREFIX) && !validNotifications.has(id))
    .map(id => chrome.notifications.clear(id)));
}

async function showTaskNotification(task) {
  const notificationId = `${NOTIFICATION_PREFIX}${task.id}`;
  try {
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Fairdien reminder',
      message: task.title,
      contextMessage: 'It’s time for a task you planned.',
      priority: 1,
      buttons: [
        { title: 'Mark done' },
        { title: 'Snooze 10 min' }
      ]
    });
  } catch (error) {
    console.warn('Could not show a Fairdien notification:', error);
  }
}

chrome.alarms.onAlarm.addListener(async alarm => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;
  const taskId = alarm.name.slice(ALARM_PREFIX.length);
  const tasks = await readTasks();
  const task = tasks.find(item => item.id === taskId);
  if (!task || task.completedAt || !Number.isFinite(task.remindAt) || task.notifiedAt) return;

  // If Chrome wakes slightly early, put the alarm back for the intended time.
  if (task.remindAt > Date.now() + 1000) {
    await scheduleTask(task);
    return;
  }

  const updatedTasks = tasks.map(item => item.id === taskId ? { ...item, notifiedAt: Date.now() } : item);
  await writeTasks(updatedTasks);
  await showTaskNotification({ ...task, notifiedAt: Date.now() });
});

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (!notificationId.startsWith(NOTIFICATION_PREFIX)) return;
  const taskId = notificationId.slice(NOTIFICATION_PREFIX.length);
  const tasks = await readTasks();
  const task = tasks.find(item => item.id === taskId);
  if (!task) {
    await chrome.notifications.clear(notificationId);
    return;
  }

  if (buttonIndex === 0) {
    const updated = tasks.map(item => item.id === taskId ? { ...item, completedAt: Date.now() } : item);
    await writeTasks(updated);
    await clearTaskAlarm(taskId);
    await chrome.notifications.clear(notificationId);
  } else if (buttonIndex === 1) {
    const remindAt = Date.now() + SNOOZE_MINUTES * 60 * 1000;
    const updated = tasks.map(item => item.id === taskId ? { ...item, remindAt, notifiedAt: null } : item);
    await writeTasks(updated);
    await chrome.notifications.clear(notificationId);
    await scheduleTask({ ...task, remindAt, notifiedAt: null });
  }
});

chrome.notifications.onClicked.addListener(async notificationId => {
  if (!notificationId.startsWith(NOTIFICATION_PREFIX)) return;
  try {
    if (chrome.action && chrome.action.openPopup) {
      await chrome.action.openPopup();
      return;
    }
  } catch (_) {
    // Fall back to opening the extension UI in a tab on Chrome versions where openPopup is unavailable.
  }
  const taskId = notificationId.slice(NOTIFICATION_PREFIX.length);
  await chrome.tabs.create({ url: `${chrome.runtime.getURL('popup.html')}?task=${encodeURIComponent(taskId)}` });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[TASKS_KEY]) {
    syncAlarms().catch(error => console.warn('Could not sync Fairdien reminders:', error));
  }
});

chrome.runtime.onInstalled.addListener(() => {
  syncAlarms().catch(error => console.warn('Could not initialize Fairdien reminders:', error));
});

chrome.runtime.onStartup.addListener(() => {
  syncAlarms().catch(error => console.warn('Could not restore Fairdien reminders:', error));
});
