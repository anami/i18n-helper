import * as vscode from "vscode";

export function getSelectionOrExtendedWord(editor: vscode.TextEditor): string {
  let word = "";

  if (editor) {
    const document = editor.document;
    const position = editor.selection.active;
    const selection = editor.selection;
    // first check if there is a selection of some length

    if (selection && !selection.isEmpty) {
      const selectionRange = new vscode.Range(
        selection.start.line,
        selection.start.character,
        selection.end.line,
        selection.end.character
      );
      word = document.getText(selectionRange);
    } else {
      // Custom function to get the word range including dots and other characters
      const wordRange = getExtendedWordRange(document, position);
      word = wordRange ? document.getText(wordRange) : "";
    }
  }

  return word;
}

export function getExtendedWordRange(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | undefined {
  const text = document.lineAt(position.line).text;
  const regex = /[a-zA-Z0-9._]+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;
    const range = new vscode.Range(
      new vscode.Position(position.line, matchStart),
      new vscode.Position(position.line, matchEnd)
    );

    if (range.contains(position)) {
      return range;
    }
  }

  return undefined;
}

/**
 * This function opens a file at a specific line number.
 * @param {string} filePath - The path to the file to open.
 * @param {number} lineNumber - The line number to reveal.
 */
export async function openFileAtLine(filePath: string, lineNumber: number) {
  try {
    // Open the text document
    const document = await vscode.workspace.openTextDocument(filePath);

    // Show the text document
    const editor = await vscode.window.showTextDocument(document);

    // Move the cursor to the specific line number (line numbers are zero-based)
    const position = new vscode.Position(lineNumber - 1, 0);
    const range = new vscode.Range(position, position);
    editor.selection = new vscode.Selection(position, position);

    // Reveal the range (scroll to the specific line)
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to open file at line ${lineNumber}: ${(error as Error).message}`
    );
  }
}

export function showInfoAtCursor(message: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  const position = editor.selection.active;

  // Create a decoration type
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: message,
      margin: "0 0 0 1em",
      backgroundColor: "rgba(255,255,255,0.7)",
      color: "red",
      border: "1px solid red",
    },
  });

  // Apply the decoration
  editor.setDecorations(decorationType, [
    { range: new vscode.Range(position, position) },
  ]);

  // Optionally clear the decoration after some time
  setTimeout(() => {
    decorationType.dispose();
  }, 3000); // Clear after 3 seconds
}

export function canExecuteCommand(): boolean {
  const fileLanguage = vscode.window?.activeTextEditor?.document?.languageId;

  const isJsonFile = fileLanguage?.includes("json");

  if (!isJsonFile) {
    vscode.window.showErrorMessage(
      "You must be in a JSON file to execute this command"
    );
  }

  return !!isJsonFile;
}
