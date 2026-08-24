import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("================================");
    console.log("G-CHAT VOICE CLONE START");
    console.log("================================");

    const apiKey = process.env.FISH_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "FISH_API_KEY is missing. Check Vercel Environment Variables.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const audio = formData.get("audio");
    const title = formData.get("title");

    console.log("TITLE:", title);
    console.log("AUDIO:", audio);

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No audio file reached the server.",
        },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Voice name was not received.",
        },
        { status: 400 }
      );
    }

    console.log("FILE NAME:", audio.name);
    console.log("FILE TYPE:", audio.type);
    console.log("FILE SIZE:", audio.size);

    if (audio.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded audio file is empty.",
        },
        { status: 400 }
      );
    }

    /*
     * SEND FILE TO FISH AUDIO
     */

    const fishForm = new FormData();

    fishForm.append(
      "voices",
      audio,
      audio.name
    );

    fishForm.append(
      "title",
      title
    );

    fishForm.append(
      "description",
      "Voice created with G-Chat Voice Max"
    );

    fishForm.append(
      "visibility",
      "private"
    );

    console.log(
      "Sending request to Fish Audio..."
    );

    const fishResponse = await fetch(
      "https://api.fish.audio/model",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
        },

        body: fishForm,
      }
    );

    const fishText =
      await fishResponse.text();

    console.log(
      "FISH STATUS:",
      fishResponse.status
    );

    console.log(
      "FISH RESPONSE:",
      fishText
    );

    /*
     * RETURN FISH RESPONSE DIRECTLY
     *
     * This is temporary.
     * We are doing this so we can see
     * exactly what Fish Audio is returning.
     */

    return NextResponse.json(
      {
        success:
          fishResponse.ok,

        fishStatus:
          fishResponse.status,

        fishResponse:
          fishText,

        file: {
          name: audio.name,
          type: audio.type,
          size: audio.size,
        },

        message:
          fishResponse.ok
            ? "Fish Audio accepted the request."
            : "Fish Audio rejected the request.",
      },
      {
        status: fishResponse.ok
          ? 200
          : 502,
      }
    );

  } catch (error) {

    console.error(
      "================================"
    );

    console.error(
      "G-CHAT CLONE ERROR"
    );

    console.error(error);

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown server error.",

      },
      {
        status: 500,
      }
    );
  }
}