import { refreshPokemonNameIndex } from "../lib/pokeapiCache";

async function main(): Promise<void> {
  const index = await refreshPokemonNameIndex();
  console.log(`pokemon-name-index.json を更新しました: ${Object.keys(index).length} entries`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "予期しないエラーです。";
  console.error(message);
  process.exit(1);
});
