import * as vscode from "vscode";
import * as path from "path";
import { ProcfileManager } from "./procfile";
import { ProcessManager } from "./processManager";

export class ProcfileTreeItem extends vscode.TreeItem {
  public readonly id: string;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath: string,
    public running: boolean = false
  ) {
    super(label, collapsibleState);
    this.contextValue = running ? "running-procfile" : "procfile";
    this.iconPath = new vscode.ThemeIcon(running ? "stop-circle" : "file");
    this.id = `procfile:${label}`;

    this.tooltip = `${label} (${filePath})`;
  }
}

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
    this.contextValue = running ? "running" : "script";
    this.id = `${source}:${label}`;

    this.iconPath = new vscode.ThemeIcon(running ? "stop-circle" : "wrench");
  }
}

export class ProcfileScriptProvider
  implements vscode.TreeDataProvider<ProcfileTreeItem | ScriptTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ProcfileTreeItem | ScriptTreeItem | undefined | null | void
  > = new vscode.EventEmitter<ProcfileTreeItem | ScriptTreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<
    ProcfileTreeItem | ScriptTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private scripts: Map<string, ScriptTreeItem> = new Map();
  private procfiles: Map<string, ProcfileTreeItem> = new Map();
  private scriptsByProcfile: Map<string, ScriptTreeItem[]> = new Map();

  constructor(public processManager: ProcessManager) {
    this.refresh();
  }

  refresh(): void {
    this.scripts.clear();
    this.procfiles.clear();
    this.scriptsByProcfile.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ProcfileTreeItem | ScriptTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(
    element?: ProcfileTreeItem | ScriptTreeItem
  ): Thenable<Array<ProcfileTreeItem | ScriptTreeItem>> {
    if (!element) {
      // Root level: return Procfile items
      return this.getProcfiles();
    } else if (element instanceof ProcfileTreeItem) {
      // Procfile level: return scripts for this Procfile
      const id = element.id;
      if (id) {
        return Promise.resolve(this.scriptsByProcfile.get(id) || []);
      }
      return Promise.resolve([]);
    } else {
      // Script level: no children
      return Promise.resolve([]);
    }
  }

  private getProcfiles(): Thenable<ProcfileTreeItem[]> {
    const procfilePaths = ProcfileManager.findProcfiles(vscode.workspace.workspaceFolders);
    const procfileItems: ProcfileTreeItem[] = [];

    // Clear existing maps
    this.scripts.clear();
    this.procfiles.clear();
    this.scriptsByProcfile.clear();

    // For each Procfile
    for (const procfilePath of procfilePaths) {
      const entries = ProcfileManager.parseProcfile(procfilePath);

      if (entries.length > 0) {
        const sourceName = entries[0].source || path.basename(procfilePath);
        const procfileId = `procfile:${sourceName}`;

        // Create Procfile item
        const procfileItem = new ProcfileTreeItem(
          sourceName,
          vscode.TreeItemCollapsibleState.Expanded,
          procfilePath,
          this.processManager.isScriptRunning(`procfile_full:${sourceName}`)
        );

        this.procfiles.set(procfileId, procfileItem);
        procfileItems.push(procfileItem);

        // Create child script items
        const scriptItems: ScriptTreeItem[] = [];

        for (const entry of entries) {
          const id = `${entry.source}:${entry.name}`;
          const existingItem = this.scripts.get(id);

          const scriptItem = new ScriptTreeItem(
            entry.name,
            entry.command,
            entry.source,
            vscode.TreeItemCollapsibleState.None,
            existingItem?.running || this.processManager.isScriptRunning(id)
          );

          this.scripts.set(id, scriptItem);
          scriptItems.push(scriptItem);
        }

        // Store scripts associated with this Procfile
        this.scriptsByProcfile.set(procfileId, scriptItems);
      }
    }

    return Promise.resolve(procfileItems);
  }

  getScriptById(id: string): ScriptTreeItem | undefined {
    return this.scripts.get(id);
  }
}
