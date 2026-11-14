# Fairdien Security and Privacy

This document describes the security-related behavior of the current Fairdien Chrome extension. It is intended to help users understand what the extension accesses, where its data is stored, and how to report a possible security problem.

## Data handled by Fairdien

The current implementation stores the following information in Chrome's local extension storage (`chrome.storage.local`):

- Task titles.
- Task creation and completion timestamps.
- Optional reminder timestamps and notification state.
- The selected appearance mode (System, Light, or Dark).

The extension uses locally stored task data to render the task list and schedule reminders. The current source does not include account registration, a cloud task service, analytics, advertising, or outbound API requests. The manifest does not declare host permissions.

**Local storage is not app-level encryption.** Data is kept in the local Chrome profile, so someone who can access your device or Chrome profile may also be able to access extension data. Fairdien does not provide a separate password, encryption layer, or cloud backup. Do not store passwords, financial details, confidential business information, or other highly sensitive material in task titles.

## Chrome permissions

The extension requests these permissions in `manifest.json`:

| Permission | Purpose |
|---|---|
| `storage` | Save tasks and theme preference locally in Chrome. |
| `alarms` | Schedule reminder times and restore scheduled reminders. |
| `notifications` | Show reminder notifications and handle their action buttons. |

No host permissions are requested by the manifest. The extension's current implementation does not need access to the contents of websites you visit.

## Notifications and privacy

A reminder notification displays the task title. Depending on your operating system's notification settings, that title may be visible on your desktop or lock screen. Avoid putting sensitive information in task titles, and adjust your operating system's notification privacy settings if needed.

Reminder delivery depends on Chrome and the operating system. Chrome should be running, and desktop notifications must be permitted. Browser alarms and desktop notifications are not guaranteed real-time or safety-critical alerting systems.

## Safer use

- Install Fairdien only from a repository or release you trust.
- Review the manifest permissions before loading an unpacked copy.
- Keep Chrome and your operating system up to date.
- Protect your operating-system account and Chrome profile with appropriate device security.
- Do not place secrets or highly sensitive information in task titles.
- Check notification privacy settings on shared devices or devices that display lock-screen notifications.
- Before sharing diagnostic output, remove personal task titles and other private information.

## Reporting a security issue

Please report suspected vulnerabilities privately rather than opening a public issue or posting technical details publicly.

Contact:

**Darshseraphic**  
**Darsh.seraphic@gmail.com**

Include a concise description, the affected Fairdien version, Chrome and operating-system versions, steps to reproduce the issue, and a description of its potential impact. Do not include passwords, tokens, private task data, or other secrets.

Please allow the project owner an opportunity to review a report before publicly disclosing vulnerability details. No specific response or remediation deadline is promised.

## Scope and limitations

This document reflects the source included with the current project. It is not a guarantee that every Chrome, operating-system, or third-party environment is free of vulnerabilities. Security also depends on the integrity of the browser, the device, the installed project files, and the user's Chrome profile.

For licensing and permitted use, see [`license.txt`](license.txt).
