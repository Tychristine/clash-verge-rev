import fs from "fs";
import path from "path";
import { createRequire } from "module";
import fsp from "fs/promises";
import * as tar from "tar";

const target = process.argv.slice(2)[0];

const ARCH_MAP = {
  "x86_64-pc-windows-msvc": "x64",
  "aarch64-pc-windows-msvc": "arm64",
};

const arch = ARCH_MAP[target] || process.arch;

// Resolve Build Production Resources Directory
async function ResolveScoop() {
  const releaseDir = target
    ? `./src-tauri/target/${target}/release`
    : `./src-tauri/target/release`;
  // Add config directory
  const configDir = path.join(releaseDir, ".config");
  try {
    // Create config mark
    await fsp.mkdir(configDir, { recursive: true });
    const portableFilePath = path.join(configDir, "PORTABLE");
    if (!fs.existsSync(portableFilePath)) {
      await fsp.writeFile(portableFilePath, "Packaged by Christine");
      // Check if build directory exists
      if (!fs.existsSync(releaseDir)) {
        new Error("could not found the release dir");
      }
    }
  } catch (error) {
    console.error(error);
  }
  const filesToArchive = [
    path.join("clash-verge.exe"),
    path.join("verge-mihomo.exe"),
    path.join("verge-mihomo-alpha.exe"),
    path.join("resources"),
    path.join(".config"),
  ];
  const require = createRequire(import.meta.url);
  const packageJson = require("../package.json");
  const { version } = packageJson;
  const archiveName = `Clash.Verge_${version}_${arch}_scoop.tar`;
  tar
    .c(
      {
        gzip: true,
        file: archiveName,
        cwd: releaseDir,
      },
      filesToArchive,
    )
    .then((_) => {
      console.log(`Created scoop package: ${archiveName}`);
    });
}
ResolveScoop().catch(console.error);
