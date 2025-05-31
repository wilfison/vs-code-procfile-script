# Procfile Script

A Visual Studio Code extension to run scripts defined in Procfile files, similar to the "NPM SCRIPTS" panel in VS Code.

## Features

This extension allows you to run and manage scripts defined in `Procfile` and `Procfile.dev` files directly in VS Code:

- Organização hierárquica de scripts agrupados por arquivo Procfile
- Execução de scripts com um único clique
- Interrupção de scripts em execução
- Indicação visual de scripts em execução
- Barra de status com informações sobre os scripts em execução

## How to use

1. Install the extension
2. Open a project containing a `Procfile` or `Procfile.dev` file
3. Locate the "Procfile Scripts" section in the Explorer panel of VS Code
4. Click the "play" button next to a script to run it
5. Click the "stop" button to stop a running script

## Supported formats

The extension supports standard Procfile format:

```
process_name: command to run
```

Por exemplo:

```
web: node server.js
worker: node worker.js
```

Os scripts são organizados hierarquicamente na visualização em árvore:

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
