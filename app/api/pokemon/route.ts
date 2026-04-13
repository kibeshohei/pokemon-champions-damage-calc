import { NextRequest, NextResponse } from "next/server";

import { fetchPokemonApiData } from "../../../src/lib/pokeapi";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "name query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const pokemon = await fetchPokemonApiData(name);
    return NextResponse.json({ pokemon });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch pokemon data.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
