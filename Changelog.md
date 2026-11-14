# Changelog

This file records the functionality and user-facing changes present in Fairdien. The current extension version is defined in `manifest.json`.

## Branding update

- Standardized the displayed product name as **Fairdien** across the Chrome extension interface, browser labels, notifications, and project documentation.

## 1.2.0 — Current project version

- Added a custom monochrome reminder time selector with separate hour, minute, and AM/PM controls.
- Kept reminders time-only; no calendar date selector is shown in the task form.
- A selected time that has already passed for the current local day is scheduled for the next day.
- Added a clear-time action so a reminder can be removed from a task.
- Replaced a theme dropdown with a compact button that cycles through System, Light, and Dark.
- Removed the introductory promotional headline and supporting copy to keep the popup focused on task creation and the task list.
- Refined the monochrome Light and Dark themes and retained the slim theme-aware scrollbar (black in Light mode, white in Dark mode).
- Added task creation, editing, completion, reopening, deletion, and To do / All / Completed filters.
- Added Chrome reminder notifications with Mark done and Snooze 10 min actions.
- Saved tasks and theme preference locally with Chrome extension storage.

## Repository documentation update

- Added this changelog, the project README, contribution guidelines, security and privacy information, and the proprietary source-available license text.
- The documentation update does not change the extension's runtime version or task behavior.
