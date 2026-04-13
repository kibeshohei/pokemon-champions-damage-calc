import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

function fail(message) {
  throw new Error(message);
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extractQuickReferenceRows(markdown) {
  const lines = markdown.split("\n");
  const rows = new Map();
  let inTable = false;

  for (const line of lines) {
    if (line.startsWith("| `color.bg` |")) {
      inTable = true;
    }

    if (!inTable) {
      continue;
    }

    if (!line.startsWith("|")) {
      break;
    }

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length !== 4 || cells[0] === "Token" || cells[0] === "------") {
      continue;
    }

    rows.set(cells[0].replaceAll("`", ""), {
      cssVar: cells[1].replaceAll("`", ""),
      value: cells[2].replaceAll("`", "")
    });
  }

  return rows;
}

async function main() {
  const [designMarkdown, tokensText] = await Promise.all([
    read("DESIGN.md"),
    read("design/contracts/tokens.json")
  ]);

  const tokensDoc = parseJson(tokensText, "design/contracts/tokens.json");
  const rows = extractQuickReferenceRows(designMarkdown);

  for (const [tokenId, token] of Object.entries(tokensDoc.tokens)) {
    if (!rows.has(tokenId)) {
      continue;
    }

    const row = rows.get(tokenId);

    if (row.cssVar !== token.cssVar) {
      fail(`DESIGN.md quick reference drift for ${tokenId}: css var is ${row.cssVar}, expected ${token.cssVar}`);
    }

    if (row.value !== token.value) {
      fail(`DESIGN.md quick reference drift for ${tokenId}: value is ${row.value}, expected ${token.value}`);
    }
  }

  console.log("design:drift passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
