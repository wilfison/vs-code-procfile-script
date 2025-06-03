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
4. Click the 'play' button on the right of a script to run it, or on the Procfile itself to run all scripts.
5. Click the 'stop' button on the right to stop the running script or Procfile.

## Runners

| Language       | Runner                                                     |
| -------------- | ---------------------------------------------------------- |
| Ruby (Default) | [foreman](https://github.com/ddollar/foreman)              |
| Go             | [forego](https://github.com/ddollar/forego)                |
| Node.js        | [node-foreman](https://github.com/strongloop/node-foreman) |
| Java/JVM       | [gaffer](https://github.com/jingweno/gaffer)               |
| Go             | [goreman](https://github.com/mattn/goreman)                |
| python         | [honcho](https://github.com/nickstenning/honcho)           |
| Perl           | [proclet](https://github.com/kazeburo/Proclet)             |
| shell          | [shoreman](https://github.com/chrismytton/shoreman)        |
| Crystal        | [crank](https://github.com/arktisklada/crank)              |
| Haskell        | [houseman](https://github.com/fujimura/houseman)           |
| Go             | [spm](https://github.com/bytegust/spm)                     |

## Supported formats

The extension supports standard `Procfile` format:

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

## Configuration

The extension offers the following configuration options:

- `procfile-script.files`: Array of Procfile filenames to detect (default: `["Procfile", "Procfile.dev"]`)
- `procfile-script.runner`: Command used to run Procfile files (default: `"foreman"`)

You can customize these settings in VS Code's settings:

```json
{
  "procfile-script.files": ["Procfile", "Procfile.dev", "Procfile.local"],
  "procfile-script.runner": "foreman"
}
```

## Planned features

- Custom color configuration for different scripts

---

**Enjoy!**
