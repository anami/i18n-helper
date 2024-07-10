import fs from "fs";
import readline from "readline";
import path from "path";

export type LocatorResult = {
  lineNumber: number;
  targetPath: string;
  targetValue: string;
  filePath: string;
};

export async function getLineNumberFromPaths(
  filePaths: string[],
  targetPath: string
): Promise<LocatorResult> {
  console.log("files:", filePaths);
  console.log("target:", targetPath);
  let result: LocatorResult = {
    lineNumber: -1,
    targetPath,
    filePath: "",
    targetValue: "",
  };

  for (const filePath of filePaths) {
    if (result.lineNumber === -1) {
      const currentResult = await getLineNumberForPath(filePath, targetPath);
      if (currentResult.lineNumber >= 0) {
        result = currentResult;
        break;
      }
    }
  }

  return result;
}

export async function getLineNumberForPath(
  filePath: string,
  targetPath: string
): Promise<LocatorResult> {
  let currentPath = [];
  let lineNumber = 0;
  let matchingLine = -1;
  let stringValue = "";

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    lineNumber++;
    const strippedLine = line.trim();

    if (strippedLine.endsWith("{") || strippedLine.endsWith("[")) {
      // Opening a new object or array, add to current path
      const key = getKeyFromLine(strippedLine);
      if (key !== null) {
        currentPath.push(key);
      }
    } else if (
      strippedLine.endsWith("}") ||
      strippedLine.endsWith("]") ||
      strippedLine.endsWith("},")
    ) {
      // Closing an object or array, remove from current path
      currentPath.pop();
    } else if (strippedLine.includes(":")) {
      // It's a key-value pair
      const key = getKeyFromLine(strippedLine);
      if (key !== null) {
        // Check if the current path matches the target path
        const string1 = [...currentPath, key].join(".");

        if (string1 === targetPath) {
          matchingLine = lineNumber;
          stringValue = getValueFromLine(strippedLine);
          break;
        }
      }
    }
  }

  fileStream && fileStream.close();
  rl && rl.close();

  return {
    lineNumber,
    targetPath,
    filePath,
    targetValue: stringValue,
  };
}

function getValueFromLine(line: string) {
  const parts = line.split(":");
  return parts?.[1];
}

function getKeyFromLine(line: string) {
  const match = line.match(/"([^"]+)"\s*:/);
  return match ? match[1] : null;
}

function clickableFilePath(filePath: string, lineNumber: number) {
  const absolutePath = path.resolve(filePath);
  // Some terminals recognize this pattern: file:///<absolute_path>:<line_number>
  const clickablePath = `file://${absolutePath}:${lineNumber}`;

  // ANSI escape code to add an underline (optional for clarity)
  const underlineStart = "\u001b[4m";
  const underlineEnd = "\u001b[24m";

  // ANSI escape code for a hyperlink (if supported by the terminal)
  const hyperlinkStart = `\u001b]8;;${clickablePath}\u0007`;
  const hyperlinkEnd = "\u001b]8;;\u0007";

  return `${hyperlinkStart}${underlineStart}${absolutePath}:${lineNumber}${underlineEnd}${hyperlinkEnd}`;
}

// Example usage
const filePath =
  "/Users/anam.hussain/Code/treasure-data/td-crystal/packages/admin/src/i18n/en/common.json";
const targetPath = "users.userInfo.userResources.dbAccessGranted.noDatabases";

// export async function testLocator() {
//   const lineNumber = await getLineNumberForPath(filePath, targetPath);
//   if (lineNumber !== -1) {
//     // console.log(clickableFilePath(filePath, lineNumber))
//     // console.log(`Path '${targetPath}' found at line ${lineNumber}`);
//     return `${filePath}:${lineNumber}`;
//   }
//   return "";
// }

// getLineNumberForPath(filePath, targetPath).then((lineNumber) => {
//   if (lineNumber !== -1) {
//     // console.log(clickableFilePath(filePath, lineNumber))
//     // console.log(`Path '${targetPath}' found at line ${lineNumber}`);
//     console.log(`${filePath}:${lineNumber}`);
//   } else {
//     console.log(`Path '${targetPath}' not found`);
//   }
// });
