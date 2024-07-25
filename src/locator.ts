import fs from "fs";
import readline from "readline";

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
  // console.log("files:", filePaths);
  // console.log("target:", targetPath);
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

  let result: LocatorResult = {
    lineNumber: -1,
    targetPath,
    filePath: "",
    targetValue: "",
  };

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
          result.lineNumber = lineNumber;
          result.targetValue = getValueFromLine(strippedLine);
          result.targetPath = targetPath;
          result.filePath = filePath;
          break;
        }
      }
    }
  }

  fileStream && fileStream.close();
  rl && rl.close();

  return result;
}

function getValueFromLine(line: string) {
  const parts = line.split(":");
  return parts?.[1];
}

function getKeyFromLine(line: string) {
  const match = line.match(/"([^"]+)"\s*:/);
  return match ? match[1] : null;
}
