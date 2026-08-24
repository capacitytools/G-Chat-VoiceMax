import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.FISH_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Fish Audio API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const pageSize =
      searchParams.get("page_size") || "20";

    const pageNumber =
      searchParams.get("page_number") || "1";

    const title =
      searchParams.get("title") || "";

    const language =
      searchParams.get("language") || "";

    const params = new URLSearchParams();

    params.set("page_size", pageSize);
    params.set("page_number", pageNumber);

    if (title) {
      params.set("title", title);
    }

    if (language) {
      params.set("language", language);
    }

    const response = await fetch(
      `https://api.fish.audio/model?${params.toString()}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Fish Audio voices error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            errorText ||
            "Unable to load voices.",
        },
        {
          status: response.status,
        }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "VOICE LIBRARY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load voice library.",
      },
      {
        status: 500,
      }
    );
  }
}