# Fairdien — To-do & Reminders

![alt text](icons/icon128.png)

**Fairdien** is a small, monochrome to-do and reminder extension for Google Chrome. It gives you one focused place to capture tasks, keep track of what is complete, and receive a desktop notification when a task is due.

The interface follows a restrained black-and-white design in Light and Dark themes, with a System option that follows your operating system preference. Fairdien is currently distributed as source code and is **not listed on the Chrome Web Store**.

## Features

- **Create tasks:** Add a task and see it appear in your list.
- **Edit and manage tasks:** Edit a task, mark it complete, reopen it, or delete it.
- **Task filters:** Switch between To do, All, and Completed.
- **Optional time reminders:** Set a local time using the monochrome hour, minute, and AM/PM picker, or clear the time to leave a task without a reminder.
- **Automatic next occurrence:** A selected time that has already passed today is scheduled for tomorrow.
- **Desktop notifications:** Receive a Chrome notification when a reminder is due.
- **Notification actions:** Mark a task done from its notification or snooze it for 10 minutes.
- **Notification click-through:** Open Fairdien from a reminder notification.
- **Three appearance modes:** Cycle between System, Light, and Dark using the header button.
- **Theme-aware scrollbar:** A slim scrollbar uses a black thumb in Light mode and a white thumb in Dark mode.
- **Local task storage:** Tasks and the appearance preference are saved using Chrome's local extension storage.
- **No account required:** The extension does not need registration or a remote service.

## Download the source

Fairdien is not available from the Chrome Web Store. Clone the project repository:

```bash
git clone https://github.com/darshseraphic/Fairdien.git
```

The repository URL is a placeholder and will be added by the project owner when the repository is ready. There is currently no Chrome Web Store installation link.

## Add Fairdien to Chrome

After cloning the repository:

1. Open Google Chrome.
2. Visit `chrome://extensions`.
3. Turn on **Developer mode** using the switch near the top-right of the page.
4. Select **Load unpacked**.
5. Choose the cloned project folder that contains `manifest.json`.
6. Fairdien should appear in your extensions list. Use Chrome's Extensions menu (the puzzle-piece icon) to pin it to the toolbar for quick access.

To load changes after updating the project files, return to `chrome://extensions` and select the reload icon on the Fairdien card.

## How to use Fairdien

### Create a task

1. Open Fairdien from the Chrome toolbar.
2. Enter a task in **What needs to get done?**
3. Select **Create task**. The task is added to **Your tasks**.

### Add a reminder

1. While creating or editing a task, use the **Reminder** controls.
2. Choose an hour, minute, and AM/PM. The reminder is optional; use **Clear time** to remove it.
3. Create the task or save your changes.

The selected time is interpreted in your device's local time zone. Fairdien schedules the next occurrence of that time: later today when the time is still ahead, or tomorrow when that time has already passed today. The task card shows the scheduled day and time.

### Manage your list

- Use the checkbox beside a task to complete it. Select it again to reopen the task.
- Use the edit control to change its title or reminder.
- Use the delete control to remove it.
- Use **To do**, **All**, and **Completed** to filter the list.

### Use a reminder notification

When a reminder is due, Chrome displays a notification containing the task title. Where supported by the operating system's notification display, the notification includes these actions:

- **Mark done** — completes the task and clears its reminder notification.
- **Snooze 10 min** — schedules another notification for 10 minutes later.

Selecting the notification opens Fairdien. Reminder delivery depends on Chrome running and your operating system allowing Chrome notifications. Do not treat desktop notifications as a guaranteed alarm for safety-critical or time-critical activity.

### Change the appearance

Select the icon button in the top-right corner of Fairdien to cycle through **System → Light → Dark → System**. Your choice is saved locally. System mode follows the operating system's light or dark preference.

## How Fairdien works

1. **Popup interface:** `popup.html` provides the extension's controls and task-list structure.
2. **Presentation:** `popup.css` applies the monochrome layout, theme variables, responsive popup styling, and slim scrollbar.
3. **Task handling:** `popup.js` validates task titles and reminder times, renders the list, handles edits and filters, and saves changes to `chrome.storage.local`.
4. **Reminder scheduling:** `background.js` uses the Chrome Alarms API to schedule reminders independently of whether the popup is open.
5. **Notification delivery:** When an alarm fires, the service worker creates a Chrome notification. Notification actions can complete a task or schedule a 10-minute snooze.
6. **Restore and synchronization:** The service worker rebuilds task alarms when the extension is installed, when Chrome starts, and when the stored task list changes.

Tasks and theme preference are stored in the current Chrome profile using `chrome.storage.local`. The current implementation does not provide account login, cloud synchronization, or a remote task service.

## Project files

```text
fairdien/
├── manifest.json       # Chrome Extension Manifest V3 configuration
├── popup.html          # Popup structure and accessible controls
├── popup.css           # Layout, monochrome themes, and component styling
├── popup.js            # Task UI, task operations, time picker, and local storage
├── background.js       # Reminder alarms and notification handling
├── icons/
│   ├── icon16.png      # Small toolbar / browser UI icon
│   ├── icon32.png      # Higher-density toolbar icon
│   ├── icon48.png      # Extension management page icon
│   └── icon128.png     # Large extension icon and notification icon
├── README.md           # Project overview and user instructions
├── license.txt         # Fairdien proprietary source-available license
├── contributing.md     # Contribution and feedback guidelines
├── security.md         # Security and privacy information
└── Changelog.md        # Project change history
```

### What each code file does

| File | Purpose |
|---|---|
| `manifest.json` | Declares the Manifest V3 extension, its name and version, popup, service worker, icons, and required permissions. |
| `popup.html` | Defines the popup markup, task form, reminder time controls, filters, task list, theme button, and footer. |
| `popup.css` | Defines the visual design, including Light/Dark/System theme tokens, monochrome controls, focus states, and the theme-dependent scrollbar. |
| `popup.js` | Implements task creation, editing, completion, reopening, deletion, filtering, theme selection, time selection, validation, rendering, and local persistence. |
| `background.js` | Restores and schedules reminder alarms, displays notifications, and handles Mark done and Snooze 10 min actions. |
| `icons/` | Contains the extension artwork at the image sizes required by the manifest and notification UI. |

## Permissions

Fairdien requests these Chrome permissions:

| Permission | Why it is used |
|---|---|
| `storage` | Save tasks and the selected appearance mode in the local Chrome profile. |
| `alarms` | Schedule and restore task reminder alarms. |
| `notifications` | Display reminder notifications and their supported actions. |

The manifest does not request host permissions. The current project does not include analytics, advertising, account sign-in, or a remote API integration. See [security.md](security.md) for more information about data handling and security considerations.

## Troubleshooting

- **The extension does not load:** Make sure you selected the project folder that contains `manifest.json`, not the `icons` folder or a parent folder that does not contain the manifest.
- **The notification did not appear:** Check that Chrome is running and that operating-system notification settings allow notifications from Chrome. Check Do Not Disturb / Focus settings as well.
- **A reminder appears later than expected:** Browser alarms and desktop notifications are subject to browser and operating-system scheduling. They should not be used as guaranteed alarms.
- **The task list looks empty:** Confirm that you are using the same Chrome profile in which you created the tasks. Data is stored locally per browser profile and is not synced by Fairdien to a separate account.
- **The interface does not reflect new source files:** Open `chrome://extensions` and reload Fairdien.

## License

Fairdien is proprietary source-available software, not a general-purpose open-source-licensed project. Public access to the source is limited by the terms in [`license.txt`](license.txt). Please read that file before using, copying, modifying, or sharing any project material.

## Contributing and security

Bug reports, usability feedback, and feature suggestions are welcome. Because the project is governed by a proprietary source-available license, do not modify, redistribute, or submit derivative code unless you have first obtained the written permission required by the license. Read [contributing.md](contributing.md) before contributing, and report potential vulnerabilities privately using the instructions in [security.md](security.md).
