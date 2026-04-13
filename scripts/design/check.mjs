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

function ensureMarkdownSection(markdown, heading) {
  if (!markdown.includes(heading)) {
    fail(`DESIGN.md is missing section: ${heading}`);
  }
}

function ensureCssVar(css, cssVar, expectedValue) {
  const escaped = cssVar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}:\\s*([^;]+);`));

  if (!match) {
    fail(`CSS variable ${cssVar} is missing from app/globals.css`);
  }

  const actualValue = match[1].trim();

  if (actualValue !== expectedValue) {
    fail(`CSS variable ${cssVar} is ${actualValue}, expected ${expectedValue}`);
  }
}

function ensureUniqueRules(rules) {
  const seen = new Set();

  for (const rule of rules) {
    if (seen.has(rule.id)) {
      fail(`Duplicate rule id: ${rule.id}`);
    }

    if (!["error", "warn"].includes(rule.severity)) {
      fail(`Rule ${rule.id} has unsupported severity: ${rule.severity}`);
    }

    seen.add(rule.id);
  }
}

function ensureContractReferences(contract, tokens, rules) {
  for (const tokenRef of contract.tokenRefs) {
    if (!tokens[tokenRef]) {
      fail(`Component contract references missing token: ${tokenRef}`);
    }
  }

  const ruleIds = new Set(rules.map((rule) => rule.id));
  for (const ruleRef of contract.ruleRefs) {
    if (!ruleIds.has(ruleRef)) {
      fail(`Component contract references missing rule: ${ruleRef}`);
    }
  }
}

async function main() {
  const [designMarkdown, cssText, tokensText, rulesText, contractText, authorityText] =
    await Promise.all([
      read("DESIGN.md"),
      read("app/globals.css"),
      read("design/contracts/tokens.json"),
      read("design/contracts/rules.json"),
      read("design/contracts/components/calculator-app.contract.json"),
      read("design/authority.md")
    ]);

  ensureMarkdownSection(designMarkdown, "## 設計原則");
  ensureMarkdownSection(designMarkdown, "## クイックリファレンス");
  ensureMarkdownSection(designMarkdown, "## 禁止パターン");
  ensureMarkdownSection(designMarkdown, "## AI 向けの作業手順");

  if (!authorityText.includes("contracts") || !authorityText.includes("app/globals.css")) {
    fail("design/authority.md does not explain the design source of truth");
  }

  const tokensDoc = parseJson(tokensText, "design/contracts/tokens.json");
  const rulesDoc = parseJson(rulesText, "design/contracts/rules.json");
  const contract = parseJson(contractText, "design/contracts/components/calculator-app.contract.json");

  for (const token of Object.values(tokensDoc.tokens)) {
    ensureCssVar(cssText, token.cssVar, token.value);
  }

  ensureUniqueRules(rulesDoc.rules);
  ensureContractReferences(contract, tokensDoc.tokens, rulesDoc.rules);

  console.log("design:check passed");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
