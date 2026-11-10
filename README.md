# Dynamic Project Title

Dynamic Project Title automatically sets the Visual Studio Code window title using the name defined in supported project configuration files.

It is particularly useful when working with multiple projects or remote workspaces where the folder name alone does not provide a useful window or taskbar title.

## Features

### Automatic Project Titles

Dynamic Project Title looks for supported configuration files inside the workspace's `.vscode` directory.

Currently supported:

- `wireferry.json`
- `sftp.json`

If a supported file contains a `name` property, its value is used as the project title.

For example, a configuration file containing `"name": "My Project"` will use **My Project** as the project title.

The default VS Code window title will then display the project title followed by the active file name.

### Automatic Updates

The extension watches supported configuration files for changes.

Changing the `name` property automatically updates the project title without requiring VS Code to be restarted.

Creating or deleting a supported configuration file also causes the project title to be refreshed.

### Configuration File Priority

When multiple supported configuration files exist, the following priority is used:

1. `wireferry.json`
2. `sftp.json`

### Workspace Name Fallback

If no supported configuration file provides a project name, Dynamic Project Title falls back to the current workspace folder name.

### Custom Window Titles

A custom title can be set directly from the VS Code Command Palette.

Open the Command Palette and select:

**Dynamic Project Title: Set Custom Window Title**

Enter the required title and the extension will create or update the workspace-specific `window.title` setting.

To return to automatic project title detection, select:

**Dynamic Project Title: Remove Custom Window Title**

### Existing Window Title Settings

A workspace-specific `window.title` setting is treated as an intentional override and takes precedence over automatic project title detection.

If a global User `window.title` setting is configured, Dynamic Project Title will warn that the global setting prevents the extension from managing the window title.

## Default Window Title Format

The extension uses `${projectTitle}${separator}${activeEditorShort}` as its default window title format.

This displays the dynamically determined project title followed by the active file name.

## Requirements

Dynamic Project Title requires Visual Studio Code 1.145.0 or later.

No additional software or configuration is required.

## Commands

The following commands are available from the VS Code Command Palette:

- **Dynamic Project Title: Set Custom Window Title**
- **Dynamic Project Title: Remove Custom Window Title**

## Release Notes

### 0.0.1

Initial release.

Features include:

- Dynamic project titles from `wireferry.json`
- Dynamic project titles from `sftp.json`
- Automatic title updates when configuration files change
- Workspace folder name fallback
- Workspace-specific custom window titles
- Command Palette commands for setting and removing custom titles
- Detection of existing workspace and global `window.title` settings