import * as vscode from "vscode";
import { ScriptTreeItem, ProcfileTreeItem } from "./procfileView";
import { ProcfileManager } from "./procfile";
import { getIcon } from "./icons";

export interface RunningProcess {
  id: string;
  command: string;
  terminal: vscode.Terminal;
  item: ScriptTreeItem | ProcfileTreeItem;
  label: string;
  running?: boolean;
  description?: string;
}

export class ProcessManager implements vscode.Disposable {
  public runningProcesses: Map<string, RunningProcess> = new Map();
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

    vscode.window.onDidEndTerminalShellExecution((event) => {
      if (event.terminal) {
        this.handleTerminalClosed(event.terminal);
      }
    });
  }

  /**
   * Start a script or Procfile
   */
  public startScript(item: ScriptTreeItem | ProcfileTreeItem): boolean {
    if (item instanceof ScriptTreeItem) {
      return this.startScriptItem(item);
    } else if (item instanceof ProcfileTreeItem) {
      return this.startProcfileItem(item);
    }
    return false;
  }

  /**
   * Start an individual script
   */
  private startScriptItem(scriptItem: ScriptTreeItem): boolean {
    const id = `${scriptItem.source}:${scriptItem.label}`;

    // Check if this script is already running
    if (this.runningProcesses.has(id)) {
      return true;
    }

    try {
      const process = this.buildProcess(scriptItem);
      this.handleStartProcess(process);
      this.updateStatusBar();

      return true;
    } catch (err) {
      console.error("Failed to start script:", err);
      vscode.window.showErrorMessage(`Failed to start script ${scriptItem.label}: ${err}`);
      return false;
    }
  }

  /**
   * Start an entire Procfile
   */
  private startProcfileItem(procfileItem: ProcfileTreeItem): boolean {
    const id = procfileItem.id;

    // Check if this Procfile is already running
    if (this.runningProcesses.has(id)) {
      return true;
    }

    try {
      const process = this.buildProcess(procfileItem);
      this.handleStartProcess(process);
      this.updateStatusBar();
      return true;
    } catch (err) {
      console.error("Failed to start Procfile:", err);
      vscode.window.showErrorMessage(`Failed to start Procfile ${procfileItem.label}: ${err}`);
      return false;
    }
  }

  /**
   * Stop a running script or Procfile
   */
  public stopScript(item: ScriptTreeItem | ProcfileTreeItem): boolean {
    let id: string = item.id;

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
      console.error("Failed to stop process:", err);
      vscode.window.showErrorMessage(`Failed to stop process ${process.label}: ${err}`);
      return false;
    }
  }

  public stopAllScripts(): void {
    for (const process of this.runningProcesses.values()) {
      try {
        process.terminal.dispose();
      } catch (err) {
        console.error("Failed to stop process:", err);
      }
    }

    this.runningProcesses.clear();
    this.updateStatusBar();
  }

  public isScriptRunning(id: string): boolean {
    return this.runningProcesses.has(id);
  }

  private handleStartProcess(process: RunningProcess): void {
    process.terminal.show();
    process.terminal.sendText(process.command);
    this.runningProcesses.set(process.id, process);
  }

  private buildProcess(item: ScriptTreeItem | ProcfileTreeItem): RunningProcess {
    const existingProcess = this.runningProcesses.get(item.id);
    const runCommand = item.scriptCommand;

    if (existingProcess) {
      existingProcess.command = runCommand;

      return existingProcess;
    }

    const terminal = vscode.window.createTerminal({
      name: item.label,
      iconPath: getIcon(item.label, false, true),
    });

    const description =
      item instanceof ScriptTreeItem
        ? item.scriptCommand
        : `Full Procfile (${ProcfileManager.getRunnerCommand()})`;

    const process: RunningProcess = {
      id: item.id,
      command: runCommand,
      terminal,
      item: item,
      label: item.label,
      running: true,
      description,
    };

    return process;
  }

  private handleTerminalClosed(terminal: vscode.Terminal): void {
    for (const [id, process] of this.runningProcesses.entries()) {
      if (process.terminal === terminal) {
        // Remove from running processes
        this.runningProcesses.delete(id);
        this.updateStatusBar();

        // Emit an event that can be captured to update the UI
        vscode.commands.executeCommand("procfile-script.refreshEntry");
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
      this.statusBarItem.text = `$(play) ${process.label}`;
      this.statusBarItem.tooltip = `Running: ${process.label}${
        process.description ? ` (${process.description})` : ""
      }`;
    } else {
      this.statusBarItem.text = `$(play) Procfile Processes (${this.runningProcesses.size})`;
      this.statusBarItem.tooltip = `Running ${this.runningProcesses.size} Procfile processes`;
    }

    this.statusBarItem.show();
  }

  public dispose(): void {
    this.stopAllScripts();
    this.statusBarItem.dispose();
  }
}
