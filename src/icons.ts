import path from "path";
import { IconPath, ThemeColor, ThemeIcon, Uri } from "vscode";

const SCRIPT_ICONS: Record<string, Array<string>> = {
  stop: ["stop-circle", "editorError.foreground"],
  web: ["globe", "terminal.ansiBlue"],
  css: ["file-code", "terminal.ansiGreen"],
  js: ["json", "terminal.ansiYellow"],
  worker: ["server", "terminal.ansiCyan"],
  ruby: ["ruby", "terminal.ansiRed"],
  api: ["symbol-method"],
  test: ["beaker"],
  procfile: ["file"],
  default: ["wrench"],
};

export function getProcfileIcon(name: string, running?: boolean): ThemeIcon | IconPath {
  const [iconName, color] = running
    ? SCRIPT_ICONS.stop
    : SCRIPT_ICONS[name] || SCRIPT_ICONS.default;

  if (name === "procfile" && !running) {
    return Uri.file(path.join(__dirname, "..", "resources", "procfile.svg"));
  }

  const iconColor = color && running ? new ThemeColor(color) : undefined;

  return new ThemeIcon(iconName, iconColor);
}

export function getIcon(name: string, running?: boolean, with_color?: boolean): ThemeIcon {
  const [iconName, color] = running
    ? SCRIPT_ICONS.stop
    : SCRIPT_ICONS[name] || SCRIPT_ICONS.default;

  const iconColor = color && (with_color || running) ? new ThemeColor(color) : undefined;

  return new ThemeIcon(iconName, iconColor);
}

export function getIconAndColor(name: string): [string, string | undefined] {
  const [iconName, color] = SCRIPT_ICONS[name] || SCRIPT_ICONS.default;

  return [iconName, color];
}
