import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export interface ProcfileEntry {
  name: string;
  command: string;
  source: string; // 'Procfile' or 'Procfile.dev'
}

export class ProcfileManager {
  private static readonly PROCFILE_REGEX = /^([A-Za-z0-9_-]+):\s*(.+)$/;

  public static findProcfiles(
    workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined
  ): string[] {
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    const procfilePaths: string[] = [];
    const procfileConfig = vscode.workspace.getConfiguration("procfile-script");
    const procfileFiles: string[] = procfileConfig.get("files") || ["Procfile", "Procfile.dev"];

    for (const folder of workspaceFolders) {
      for (const file of procfileFiles) {
        const procfilePath = path.join(folder.uri.fsPath, file);
        if (fs.existsSync(procfilePath)) {
          procfilePaths.push(procfilePath);
        }
      }
    }

    return procfilePaths;
  }

  public static parseProcfile(procfilePath: string): ProcfileEntry[] {
    if (!fs.existsSync(procfilePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(procfilePath, "utf-8");
      const lines = content.split("\n");
      const entries: ProcfileEntry[] = [];
      const sourceName = path.basename(procfilePath);

      for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith("#")) {
          continue;
        }

        const match = trimmedLine.match(this.PROCFILE_REGEX);
        if (match) {
          entries.push({
            name: match[1],
            command: match[2],
            source: sourceName,
          });
        }
      }

      return entries;
    } catch (error) {
      console.error(`Error parsing Procfile ${procfilePath}:`, error);
      return [];
    }
  }

  /**
   * Get the configured runner command for Procfiles
   */
  public static getRunnerCommand(): string {
    const config = vscode.workspace.getConfiguration("procfile-script");
    return config.get("runner") || "foreman";
  }

  /**
   * Build a command to run a Procfile using the configured runner
   */
  public static buildRunCommand(procfilePath: string, processName?: string): string {
    const runner = this.getRunnerCommand();
    const baseCommand = `${runner} start -f "${procfilePath}"`;

    // If a specific process was specified, add it to the command
    if (processName) {
      return `${baseCommand} -p ${processName}`;
    }

    return baseCommand;
  }
}
