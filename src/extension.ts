import * as vscode from "vscode";
import { ProcfileScriptProvider, ScriptTreeItem } from "./procfileView";
import { ProcessManager } from "./processManager";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "procfile-script" is now active');

  // Create the Procfile script provider
  const procfileScriptProvider = new ProcfileScriptProvider();
  const processManager = new ProcessManager();

  // Register the tree data provider
  const treeView = vscode.window.createTreeView("procfileScripts", {
    treeDataProvider: procfileScriptProvider,
    showCollapseAll: false,
  });

  // Register commands
  const refreshCommand = vscode.commands.registerCommand("procfile-script.refreshEntry", () => {
    procfileScriptProvider.refresh();
  });

  const startScriptCommand = vscode.commands.registerCommand(
    "procfile-script.startScript",
    (item: ScriptTreeItem) => {
      if (item) {
        const success = processManager.startScript(item);
        procfileScriptProvider.updateScriptStatus(item, success);
      }
    }
  );

  const stopScriptCommand = vscode.commands.registerCommand(
    "procfile-script.stopScript",
    (item: ScriptTreeItem) => {
      if (item) {
        const success = processManager.stopScript(item);
        procfileScriptProvider.updateScriptStatus(item, success);
      }
    }
  );

  // Watch for file changes on Procfile files
  const createFileWatcher = () => {
    const procfileConfig = vscode.workspace.getConfiguration("procfile-script");
    const procfileFiles: string[] = procfileConfig.get("files") || ["Procfile", "Procfile.dev"];
    const pattern = `**/{${procfileFiles.join(",")}}`;

    return vscode.workspace.createFileSystemWatcher(pattern);
  };

  let fileWatcher = createFileWatcher();

  // Recria o watcher quando a configuração muda
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("procfile-script.files")) {
      fileWatcher.dispose();
      fileWatcher = createFileWatcher();
      procfileScriptProvider.refresh();
    }
  });

  fileWatcher.onDidChange(() => {
    procfileScriptProvider.refresh();
  });

  fileWatcher.onDidCreate(() => {
    procfileScriptProvider.refresh();
  });

  fileWatcher.onDidDelete(() => {
    procfileScriptProvider.refresh();
  });

  // Push disposables to context subscriptions
  context.subscriptions.push(
    treeView,
    refreshCommand,
    startScriptCommand,
    stopScriptCommand,
    fileWatcher,
    processManager
  );
}

export function deactivate() {
  // Nothing to do
}
