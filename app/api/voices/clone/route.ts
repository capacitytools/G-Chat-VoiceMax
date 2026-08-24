import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.FISH_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "FISH_API_KEY is missing in Vercel." },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const audio = formData.get("audio");
    const title = formData.get("title");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "No audio file was received." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Please enter a voice name." },
        { status: 400 }
      );
    }

    if (audio.size === 0) {
      return NextResponse.json(
        { error: "The audio file is empty." },
        { status: 400 }
      );
    }

    console.log("VOICE CLONE START");
    console.log("File:", audio.name);
    console.log("Type:", audio.type);
    console.log("Size:", audio.size);
    console.log("Title:", title);

    const fishForm = new FormData();

    fishForm.append("voices", audio, audio.name);
    fishForm.append("title", title);
    fishForm.append(
      "description",
      "Voice created with G-Chat Voice Max"
    );
    fishForm.append("visibility", "private");

    const response = await fetch(
      "https://api.fish.audio/model",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
        },

        body: fishForm,
      }
    );

    const responseText = await response.text();

    console.log(
      "FISH STATUS:",
      response.status
    );

    console.log(
      "FISH RESPONSE:",
      responseText
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            responseText ||
            `Fish Audio returned ${response.status}`,
        },
        {
          status: response.status,
        }
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Fish Audio returned an invalid response.",
          raw: responseText,
        },
        {
          status: 502,
        }
      );
    }

    const voiceId =
      data._id ||
      data.id ||
      data.model_id;

    if (!voiceId) {
      return NextResponse.json(
        {
          error:
            "Fish Audio created a response, but no voice ID was returned.",
          response: data,
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,

      voice: {
        id: voiceId,
        title:
          data.title || title,
        description:
          data.description ||
          "Voice created with G-Chat Voice Max",
        createdAt:
          new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error(
      "VOICE CLONE CRASH:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Voice cloning failed.",
      },
      {
        status: 500,
      }
    );
  }
}