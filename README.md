# Procfile Script

A Visual Studio Code extension to run scripts defined in Procfile files, similar to the "NPM SCRIPTS" panel in VS Code.

## Features

This extension allows you to run and manage scripts defined in `Procfile` and `Procfile.dev` files directly in VS Code:

- Tree view of Procfile scripts in the sidebar
- Run scripts with a single click
- Stop running scripts
- Visual indication of running scripts
- Status bar with information about running scripts

## How to use

1. Install the extension
2. Open a project containing a `Procfile` or `Procfile.dev` file
3. Click the extension icon in the activity bar to open the "Procfile Scripts" view
4. Click the "play" button next to a script to run it
5. Click the "stop" button to stop a running script

## Supported formats

The extension supports standard Procfile format:

```
process_name: command to run
```

For example:

```
web: node server.js
worker: node worker.js
```

The following files are automatically recognized:

- `Procfile`
- `Procfile.dev`

## Planned features

- Custom color configuration for different scripts
- Support for more Procfile formats
- Option to start scripts automatically when the project opens
- Script grouping for batch execution

---

**Enjoy!**
