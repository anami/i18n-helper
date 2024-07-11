import * as vscode from "vscode";
import { getSelectionOrExtendedWord, openFileAtLine } from "./util";
import { getLineNumberFromPaths } from "../locator";

export async function gotoLineCommand() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const word = getSelectionOrExtendedWord(editor);

    // get the JSON file to check against
    const jsonPaths = vscode.workspace
      .getConfiguration("locator")
      .get<string[]>("jsonFilePaths", []);

    const result = await getLineNumberFromPaths(jsonPaths, word);
    if (result.lineNumber >= 0) {
      vscode.window.showInformationMessage(
        `${word}:${result.targetValue} found in line: ${result.lineNumber}`
      );

      openFileAtLine(result.filePath, result.lineNumber);
    }
  }
}
