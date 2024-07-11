import * as vscode from "vscode";
import getJsonPath from "../json.path";
import { canExecuteCommand } from "./util";

export async function searchPathCommand() {
  if (!canExecuteCommand()) {
    return;
  }
  const editor = vscode.window.activeTextEditor;
  const text = editor?.document.getText();
  const offset = editor?.document.offsetAt(editor?.selection.start);

  const configuration = vscode.workspace.getConfiguration("json.copyJsonPath");

  const includeFileName = configuration.get<boolean>("includeFileName");
  const useBracketNotation = configuration.get<boolean>("useBracketNotation");
  const quote = configuration.get<String>("quote");
  const pathOutput = configuration.get<string>("output") ?? "%PATH%";

  if (offset && text) {
    const rawPath: string = getJsonPath(text, offset, editor, {
      includeFileName,
      useBracketNotation,
      quote,
    });

    const path = pathOutput.replace("%PATH%", rawPath);

    // Trigger the search in VSCode
    vscode.commands.executeCommand("workbench.action.findInFiles", {
      query: path,
      triggerSearch: true,
      filesToInclude: "*.jsx, *.js, *.ts, *.tsx",
    });
  } else {
    vscode.window.showErrorMessage("Failed to copy path");
  }
}
