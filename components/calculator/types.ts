import type { PokemonApiData, StatPoints } from "../../src/types";

export type SideState = {
  lookupName: string;
  loading: boolean;
  error: string | null;
  pokemon: PokemonApiData | null;
  natureName: string;
  statPoints: StatPoints;
};
