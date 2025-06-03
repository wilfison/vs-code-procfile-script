import { ThemeColor, ThemeIcon } from "vscode";

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

export function getIcon(name: string, running?: boolean, with_color?: boolean): ThemeIcon {
  const [iconName, color] = running
    ? SCRIPT_ICONS.stop
    : SCRIPT_ICONS[name] || SCRIPT_ICONS.default;

  const iconColor = color && (with_color || running) ? new ThemeColor(color) : undefined;

  return new ThemeIcon(iconName, iconColor);
}
