import * as vscode from "vscode";
import {
  getExtendedWordRange,
  getSelectionOrExtendedWord,
  openFileAtLine,
  showInfoAtCursor,
} from "./util";
import { getLineNumberFromPaths } from "../locator";

export async function peekCommand() {
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

      showInfoAtCursor(result.targetValue);
    }
  }
}
