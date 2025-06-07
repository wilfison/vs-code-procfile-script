import * as vscode from "vscode";
import { ScriptTreeItem, ProcfileTreeItem } from "./procfileView";
import { ProcfileManager } from "./procfile";
import { getIcon, getIconAndColor } from "./icons";

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
  private statusBarItems: Map<string, vscode.StatusBarItem> = new Map();
  private summaryStatusBarItem: vscode.StatusBarItem;

  constructor() {
    this.summaryStatusBarItem = vscode.window.createStatusBarItem(
      "procfile-script.status",
      vscode.StatusBarAlignment.Left
    );
    this.summaryStatusBarItem.name = "Procfile";

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
      this.summaryStatusBarItem.hide();

      // Dispose individual status bar items
      for (const statusBarItem of this.statusBarItems.values()) {
        statusBarItem.dispose();
      }
      this.statusBarItems.clear();
      return;
    }

    // Update summary item
    this.summaryStatusBarItem.text = `$(play) Procfile (${this.runningProcesses.size})`;
    this.summaryStatusBarItem.tooltip = `${this.runningProcesses.size} Procfile processes running`;
    this.summaryStatusBarItem.show();

    // Track existing items to remove outdated ones
    const currentIds = new Set<string>();

    // Create or update individual status bar items for each process
    for (const [id, process] of this.runningProcesses.entries()) {
      currentIds.add(id);
      let statusBarItem = this.statusBarItems.get(id);

      // Create new status bar item if it doesn't exist
      if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(
          `procfile-script.process.${id}`,
          vscode.StatusBarAlignment.Left
        );

        // Add command to focus on the terminal when clicked
        statusBarItem.command = {
          title: "Focus Terminal",
          command: "procfile-script.focusTerminal",
          arguments: [id],
        };

        this.statusBarItems.set(id, statusBarItem);
      }

      const processDescription = process.description ? ` (${process.description})` : "";
      const [iconName, color] = getIconAndColor(process.label);

      // Update status bar item
      statusBarItem.text = `$(${iconName}) ${process.label}`;
      statusBarItem.tooltip = `Procfile process: ${process.label}${processDescription}. Click to focus.`;
      statusBarItem.color = color ? new vscode.ThemeColor(color) : undefined;
      statusBarItem.show();
    }

    // Remove any status bar items for processes that are no longer running
    for (const [id, statusBarItem] of this.statusBarItems.entries()) {
      if (!currentIds.has(id)) {
        statusBarItem.dispose();
        this.statusBarItems.delete(id);
      }
    }
  }

  public focusTerminal(id: string): void {
    const process = this.runningProcesses.get(id);
    if (process) {
      process.terminal.show();
    }
  }

  public dispose(): void {
    this.stopAllScripts();
    this.summaryStatusBarItem.dispose();

    // Dispose all individual status bar items
    for (const statusBarItem of this.statusBarItems.values()) {
      statusBarItem.dispose();
    }
  }
}
