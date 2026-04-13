import { loadPokemonNameIndex } from "./pokeapiCache";

function normalizePokemonInput(input: string): string {
  return input.trim();
}

export async function resolvePokemonApiName(input: string): Promise<string> {
  const normalized = normalizePokemonInput(input);

  if (!normalized) {
    throw new Error("ポケモン名またはPokeAPI識別子を入力してください。");
  }

  if (/^[a-z0-9-]+$/i.test(normalized)) {
    return normalized.toLowerCase();
  }

  const pokemonNameIndex = await loadPokemonNameIndex();
  const indexedName = pokemonNameIndex[normalized];

  if (indexedName) {
    return indexedName;
  }

  if (normalized.startsWith("メガ")) {
    const baseName = normalized.slice("メガ".length);
    const baseIndexedName = pokemonNameIndex[baseName];

    if (baseIndexedName) {
      return `${baseIndexedName}-mega`;
    }
  }

  return normalized.toLowerCase();
}
