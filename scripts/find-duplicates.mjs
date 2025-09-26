#!/usr/bin/env node

import { readdir, stat } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import process from "process";
import { createHash } from "crypto";

const DEFAULT_IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  ".vercel",
  "dist",
  "coverage",
  "build"
]);

const IGNORED_EXTENSIONS = new Set([
  ".map",
  ".lock"
]);

async function main() {
  const rootArg = process.argv[2];
  const rootDir = rootArg ? path.resolve(rootArg) : process.cwd();
  const ignoredDirs = new Set(DEFAULT_IGNORED_DIRS);

  const duplicates = await findDuplicates(rootDir, ignoredDirs);
  if (duplicates.length === 0) {
    console.log("No duplicate files detected.");
    return;
  }

  console.log("Duplicate files found (grouped by identical content):\n");
  duplicates.forEach((group, index) => {
    console.log(`Group ${index + 1}:`);
    group.forEach((filePath) => {
      console.log(`  - ${path.relative(rootDir, filePath)}`);
    });
    console.log("");
  });

  console.log(`Total duplicate groups: ${duplicates.length}`);
}

async function findDuplicates(rootDir, ignoredDirs) {
  const filesBySize = new Map();
  const stack = [rootDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let dirEntries;
    try {
      dirEntries = await readdir(currentDir, { withFileTypes: true });
    } catch (error) {
      console.warn(`Skipping ${currentDir}: ${error.message}`);
      continue;
    }

    for (const entry of dirEntries) {
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name)) {
          continue;
        }
        stack.push(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (IGNORED_EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }

      let fileStats;
      try {
        fileStats = await stat(absolutePath);
      } catch (error) {
        console.warn(`Unable to stat ${absolutePath}: ${error.message}`);
        continue;
      }

      const key = fileStats.size;
      if (!filesBySize.has(key)) {
        filesBySize.set(key, []);
      }
      filesBySize.get(key).push({ path: absolutePath, size: fileStats.size });
    }
  }

  const duplicateGroups = [];

  for (const files of filesBySize.values()) {
    if (files.length < 2) {
      continue;
    }

    const hashes = new Map();

    for (const file of files) {
      const hash = await hashFile(file.path);
      if (!hashes.has(hash)) {
        hashes.set(hash, []);
      }
      hashes.get(hash).push(file.path);
    }

    for (const group of hashes.values()) {
      if (group.length > 1) {
        duplicateGroups.push(group);
      }
    }
  }

  return duplicateGroups;
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("error", (error) => {
      reject(error);
    });

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
}

await main();
