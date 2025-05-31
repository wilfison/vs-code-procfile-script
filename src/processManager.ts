import * as vscode from "vscode";
import * as path from "path";
import { ScriptTreeItem } from "./procfileView";

export interface RunningProcess {
  id: string;
  terminal: vscode.Terminal;
  scriptItem: ScriptTreeItem;
}

export class ProcessManager implements vscode.Disposable {
  private runningProcesses: Map<string, RunningProcess> = new Map();
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      "procfile-script.status",
      vscode.StatusBarAlignment.Left
    );
    this.statusBarItem.name = "Procfile";

    vscode.window.onDidCloseTerminal((terminal) => {
      this.handleTerminalClosed(terminal);
    });
  }

  public startScript(scriptItem: ScriptTreeItem): boolean {
    const id = `${scriptItem.source}:${scriptItem.label}`;

    // Check if this script is already running
    if (this.runningProcesses.has(id)) {
      return false;
    }

    try {
      const terminal = vscode.window.createTerminal({
        name: `Procfile: ${scriptItem.label} (${scriptItem.source})`,
        iconPath: new vscode.ThemeIcon("play"),
      });

      terminal.show();
      terminal.sendText(scriptItem.scriptCommand);

      const process: RunningProcess = {
        id,
        terminal,
        scriptItem,
      };

      this.runningProcesses.set(id, process);
      this.updateStatusBar();

      return true;
    } catch (err) {
      console.error("Failed to start script:", err);
      vscode.window.showErrorMessage(`Failed to start script ${scriptItem.label}: ${err}`);
      return false;
    }
  }

  public stopScript(scriptItem: ScriptTreeItem): boolean {
    const id = `${scriptItem.source}:${scriptItem.label}`;
    const process = this.runningProcesses.get(id);

    if (!process) {
      return false;
    }

    try {
      process.terminal.dispose();
      this.runningProcesses.delete(id);
      this.updateStatusBar();
      return true;
    } catch (err) {
      console.error("Failed to stop script:", err);
      vscode.window.showErrorMessage(`Failed to stop script ${scriptItem.label}: ${err}`);
      return false;
    }
  }

  public stopAllScripts(): void {
    for (const process of this.runningProcesses.values()) {
      try {
        process.terminal.dispose();
      } catch (err) {
        console.error("Failed to stop script:", err);
      }
    }

    this.runningProcesses.clear();
    this.updateStatusBar();
  }

  public isScriptRunning(id: string): boolean {
    return this.runningProcesses.has(id);
  }

  private handleTerminalClosed(terminal: vscode.Terminal): void {
    for (const [id, process] of this.runningProcesses.entries()) {
      if (process.terminal === terminal) {
        this.runningProcesses.delete(id);
        this.updateStatusBar();
        break;
      }
    }
  }

  private updateStatusBar(): void {
    if (this.runningProcesses.size === 0) {
      this.statusBarItem.hide();
      return;
    }

    if (this.runningProcesses.size === 1) {
      const process = Array.from(this.runningProcesses.values())[0];
      this.statusBarItem.text = `$(play) ${process.scriptItem.label}`;
      this.statusBarItem.tooltip = `Running Procfile script: ${process.scriptItem.label} (${process.scriptItem.scriptCommand})`;
    } else {
      this.statusBarItem.text = `$(play) Procfile Scripts (${this.runningProcesses.size})`;
      this.statusBarItem.tooltip = `Running ${this.runningProcesses.size} Procfile scripts`;
    }

    this.statusBarItem.show();
  }

  public dispose(): void {
    this.stopAllScripts();
    this.statusBarItem.dispose();
  }
}
