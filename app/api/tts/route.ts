import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const text = body?.text;
    const referenceId = body?.reference_id;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          error: "Text is required.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.FISH_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Fish Audio API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const requestBody: {
      text: string;
      format: string;
      reference_id?: string;
    } = {
      text,
      format: "mp3",
    };

    if (referenceId) {
      requestBody.reference_id =
        referenceId;
    }

    const response = await fetch(
      "https://api.fish.audio/v1/tts",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",

          model: "s2.1-pro-free",

          Accept: "audio/mpeg",
        },

        body: JSON.stringify(
          requestBody
        ),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Fish Audio error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            errorText ||
            "Fish Audio failed to generate audio.",
        },
        {
          status: response.status,
        }
      );
    }

    const audioBuffer =
      await response.arrayBuffer();

    return new NextResponse(
      audioBuffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "audio/mpeg",

          "Content-Disposition":
            'attachment; filename="g-chat-voice-max.mp3"',

          "Cache-Control":
            "no-store",
        },
      }
    );

  } catch (error) {

    console.error(
      "TTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to generate audio.",
      },
      {
        status: 500,
      }
    );
  }
}