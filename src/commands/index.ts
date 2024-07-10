import { Disposable, commands } from "vscode";
import { peekCommand } from "./peekCommand";
import { gotoLineCommand } from "./gotoLineCommand";
import { copyPathCommand } from "./copyPathCommand";
import { searchPathCommand } from "./searchPathCommand";

export function registerCommands(): Disposable[] {
  return [
    commands.registerCommand("i18n-helper.peek", peekCommand),
    commands.registerCommand("i18n-helper.gotoLine", gotoLineCommand),
    commands.registerCommand("i18n-helper.copyPath", copyPathCommand),
    commands.registerCommand("i18n-helper.searchPath", searchPathCommand),
  ];
}
