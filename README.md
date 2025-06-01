# Procfile Script

A Visual Studio Code extension to run scripts defined in Procfile files.

[![Version](https://img.shields.io/visual-studio-marketplace/v/wilfison.procfile-script.svg)](https://marketplace.visualstudio.com/items?itemName=wilfison.procfile-script)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/wilfison.procfile-script.svg)](https://marketplace.visualstudio.com/items?itemName=wilfison.procfile-script)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/wilfison.procfile-script.svg)](https://marketplace.visualstudio.com/items?itemName=wilfison.procfile-script)

![Procfile Script in action](https://github.com/wilfison/vs-code-procfile-script/raw/HEAD/resources/preview.gif)

## How to use

1. Install the extension
2. Open a project containing a `Procfile` or `Procfile.dev` file
3. Locate the "Procfile Scripts" section in the Explorer panel of VS Code
4. Click on the script to run it
5. Click again to stop the script

## Supported formats

The extension supports standard Procfile format:

```
process_name: command to run
```

It also supports the `Procfile.dev` format, which is commonly used for development environments.

```
web: node server.js
worker: node worker.js
```

The `Procfile.dev` can contain multiple scripts, and the extension will display them in a hierarchical tree structure:

```
- Procfile.dev
  - web
  - js
  - css
- Procfile
  - web
  - worker
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
