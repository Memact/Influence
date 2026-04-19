import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeInfluenceSnapshot,
  formatDotGraph,
  formatMarkdownPitchReport,
  formatReadableEvidence,
  formatReadableGraph,
  formatReadableInsights,
  formatTerminalReport,
} from "../src/engine.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(projectRoot, "..");
const defaultOutputDir = path.join(workspaceRoot, "pitch-output");
const DEFAULT_SNAPSHOT_BASENAME = "capture-snapshot.json";
const SNAPSHOT_FILENAME_PATTERN = /^capture-snapshot(?:-[^.]+)?\.json$/i;

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const options = {
    outputDir: defaultOutputDir,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--input") {
      options.input = path.resolve(process.cwd(), next || workspaceRoot);
      index += 1;
      continue;
    }

    if (arg === "--output-dir") {
      options.outputDir = path.resolve(process.cwd(), next || defaultOutputDir);
      index += 1;
    }
  }

  return options;
}

async function findLatestSnapshot(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const snapshotEntries = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name === DEFAULT_SNAPSHOT_BASENAME ||
            SNAPSHOT_FILENAME_PATTERN.test(entry.name))
      )
      .map((entry) => path.join(directory, entry.name));

    if (snapshotEntries.length === 0) {
      return null;
    }

    const withStats = await Promise.all(
      snapshotEntries.map(async (filePath) => ({
        filePath,
        stat: await fs.stat(filePath),
      }))
    );

    withStats.sort((left, right) => right.stat.mtimeMs - left.stat.mtimeMs);
    return withStats[0].filePath;
  } catch {
    return null;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = options.input || (await findLatestSnapshot(workspaceRoot));
  if (!inputPath || !(await exists(inputPath))) {
    throw new Error(
      `Capture snapshot not found. Pass --input <path> or export a capture-snapshot-*.json file into ${workspaceRoot} first so Memact Influence has real data to analyze.`
    );
  }

  const snapshot = JSON.parse((await fs.readFile(inputPath, "utf8")).replace(/^\uFEFF/, ""));
  const analysis = analyzeInfluenceSnapshot(snapshot);

  await fs.mkdir(options.outputDir, { recursive: true });

  const files = [
    {
      name: "influence-analysis.json",
      content: `${JSON.stringify(analysis, null, 2)}\n`,
    },
    {
      name: "influence-report.txt",
      content: `${formatTerminalReport(analysis)}\n`,
    },
    {
      name: "influence-insights.txt",
      content: `${formatReadableInsights(analysis.insights) || "No valid influence chains found."}\n`,
    },
    {
      name: "influence-evidence.txt",
      content: `${formatReadableEvidence(analysis.valid_chains) || "No evidence-backed chains found."}\n`,
    },
    {
      name: "influence-graph.txt",
      content: `${formatReadableGraph(analysis.valid_chains) || "No valid influence chains found."}\n`,
    },
    {
      name: "influence-graph.dot",
      content: `${formatDotGraph(analysis.valid_chains)}\n`,
    },
    {
      name: "influence-pitch.md",
      content: `${formatMarkdownPitchReport(analysis)}\n`,
    },
  ];

  await Promise.all(
    files.map((file) =>
      fs.writeFile(path.join(options.outputDir, file.name), file.content, "utf8")
    )
  );

  console.log(`Memact Influence pitch artifacts written to ${options.outputDir}`);
  for (const file of files) {
    console.log(`- ${path.join(options.outputDir, file.name)}`);
  }
}

main().catch((error) => {
  console.error(String(error?.message || error || "Could not build Memact Influence pitch artifacts."));
  process.exitCode = 1;
});
