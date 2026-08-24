import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();

    const audio = formData.get("audio");
    const title = formData.get("title");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload an audio file.",
        },
        {
          status: 400,
        }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {
          error: "Voice name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (audio.size === 0) {
      return NextResponse.json(
        {
          error: "The uploaded audio file is empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Fish Audio voice model creation
     */

    const fishFormData = new FormData();

    fishFormData.append("voices", audio);

    fishFormData.append(
      "title",
      title
    );

    fishFormData.append(
      "description",
      "Voice cloned with G-Chat Voice Max."
    );

    fishFormData.append(
      "visibility",
      "private"
    );

    const response = await fetch(
      "https://api.fish.audio/model",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
        },

        body: fishFormData,
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Fish clone error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            errorText ||
            "Fish Audio could not create the voice clone.",
        },
        {
          status: response.status,
        }
      );
    }

    const data =
      await response.json();

    /*
     * We return only the useful information
     * to the browser.
     */

    return NextResponse.json(
      {
        success: true,

        voice: {
          id:
            data._id ||
            data.id,

          title:
            data.title ||
            title,

          description:
            data.description ||
            "Voice cloned with G-Chat Voice Max.",

          createdAt:
            new Date().toISOString(),
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "VOICE CLONE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the voice clone.",
      },
      {
        status: 500,
      }
    );
  }
}