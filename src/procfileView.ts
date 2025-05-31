import * as vscode from "vscode";
import * as path from "path";
import { ProcfileEntry, ProcfileManager } from "./procfile";

export class ScriptTreeItem extends vscode.TreeItem {
  public readonly id: string;

  constructor(
    public readonly label: string,
    public readonly scriptCommand: string,
    public readonly source: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public running: boolean = false
  ) {
    super(label, collapsibleState);
    this.tooltip = `${label}: ${scriptCommand}`;
    this.description = scriptCommand;
    this.contextValue = running ? "scriptRunning" : "script";
    this.id = `${source}:${label}`;

    this.iconPath = new vscode.ThemeIcon(running ? "debug-stop" : "debug-start");
  }
}

export class ProcfileScriptProvider implements vscode.TreeDataProvider<ScriptTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ScriptTreeItem | undefined | null | void> =
    new vscode.EventEmitter<ScriptTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ScriptTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private scripts: Map<string, ScriptTreeItem> = new Map();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.scripts.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ScriptTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ScriptTreeItem): Thenable<ScriptTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const procfilePaths = ProcfileManager.findProcfiles(vscode.workspace.workspaceFolders);
    const entries: ProcfileEntry[] = [];

    for (const procfilePath of procfilePaths) {
      entries.push(...ProcfileManager.parseProcfile(procfilePath));
    }

    if (entries.length === 0) {
      return Promise.resolve([]);
    }

    const treeItems: ScriptTreeItem[] = [];

    for (const entry of entries) {
      const id = `${entry.source}:${entry.name}`;
      const existingItem = this.scripts.get(id);

      const treeItem = new ScriptTreeItem(
        entry.name,
        entry.command,
        entry.source,
        vscode.TreeItemCollapsibleState.None,
        existingItem?.running || false
      );

      this.scripts.set(id, treeItem);
      treeItems.push(treeItem);
    }

    return Promise.resolve(treeItems);
  }

  updateScriptStatus(item: ScriptTreeItem, running: boolean): void {
    const script = this.scripts.get(item.id);
    if (script) {
      script.running = running;
      script.contextValue = running ? "scriptRunning" : "script";
      script.iconPath = new vscode.ThemeIcon(running ? "debug-stop" : "debug-start");
      this._onDidChangeTreeData.fire(script);
    }
  }

  getScriptById(id: string): ScriptTreeItem | undefined {
    return this.scripts.get(id);
  }
}
