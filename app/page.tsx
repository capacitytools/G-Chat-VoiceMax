"use client";

import { useEffect, useState } from "react";

type Voice = {
  _id: string;
  title: string;
  description?: string;
  languages?: string[];
  tags?: string[];
  cover_image?: string;
  author?: {
    nickname?: string;
  };
};

export default function Home() {
  const [text, setText] = useState("");

  const [voices, setVoices] = useState<Voice[]>([]);

  const [selectedVoice, setSelectedVoice] =
    useState("");

  const [loadingVoices, setLoadingVoices] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadVoices();
  }, []);

  async function loadVoices() {
    try {
      setLoadingVoices(true);

      const response = await fetch(
        "/api/voices?page_size=20&page_number=1"
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load voices."
        );
      }

      const data = await response.json();

      const items = Array.isArray(data.items)
        ? data.items
        : [];

      setVoices(items);

      if (items.length > 0) {
        setSelectedVoice(items[0]._id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load voices."
      );
    } finally {
      setLoadingVoices(false);
    }
  }

  async function generateVoice() {
    if (!text.trim()) {
      setError(
        "Please enter some text first."
      );

      return;
    }

    if (!selectedVoice) {
      setError(
        "Please select a voice."
      );

      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const response = await fetch(
        "/api/tts",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            text,
            reference_id:
              selectedVoice,
          }),
        }
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.error ||
            "Voice generation failed."
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08050d] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <div>

            <h1 className="text-2xl font-black">

              <span className="text-red-500">
                G-CHAT
              </span>{" "}

              <span className="text-purple-400">
                VOICE
              </span>{" "}

              <span className="text-green-400">
                MAX
              </span>

            </h1>

            <p className="mt-1 text-xs tracking-widest text-white/40">
              AI AUDIO STUDIO FOR CREATORS
            </p>

          </div>

          <button className="rounded-xl border border-white/20 px-4 py-2 text-sm">
            Menu
          </button>

        </div>

      </header>


      {/* HERO */}

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-12">

        <div className="max-w-3xl">

          <div className="mb-4 inline-flex rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-xs font-bold tracking-widest text-green-400">
            CREATOR AUDIO STUDIO
          </div>

          <h2 className="text-4xl font-black leading-tight sm:text-6xl">

            Your words.

            <br />

            Your voice.

            <br />

            <span className="text-purple-400">
              Your creation.
            </span>

          </h2>

          <p className="mt-5 max-w-2xl text-white/50">

            Generate professional AI voiceovers
            using a growing library of voices.

          </p>

        </div>

      </section>


      {/* MAIN */}

      <section className="mx-auto max-w-7xl px-5 pb-16">

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">


          {/* TEXT EDITOR */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  Text to Voice
                </h3>

                <p className="mt-1 text-sm text-white/40">
                  Write your script and select
                  a voice.
                </p>

              </div>

              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
                TTS
              </div>

            </div>


            {/* TEXT */}

            <textarea
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              placeholder="Type or paste your script here..."
              className="min-h-[280px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-5 leading-7 text-white outline-none focus:border-purple-500"
            />


            {/* VOICE LIBRARY */}

            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">

                <label className="text-sm font-bold">
                  Voice Library
                </label>

                <span className="text-xs text-white/30">
                  {voices.length} voices
                </span>

              </div>


              {loadingVoices ? (

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/40">
                  Loading voices...
                </div>

              ) : voices.length === 0 ? (

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-300">
                  No voices available.
                </div>

              ) : (

                <div className="grid max-h-[430px] gap-3 overflow-y-auto pr-1">

                  {voices.map((voice) => (

                    <button
                      key={voice._id}
                      onClick={() =>
                        setSelectedVoice(
                          voice._id
                        )
                      }
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        selectedVoice ===
                        voice._id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/[0.02] hover:border-white/30"
                      }`}
                    >

                      {/* AVATAR */}

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-red-500/30 via-purple-500/30 to-green-500/30">

                        {voice.cover_image ? (

                          <img
                            src={
                              voice.cover_image
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <span className="text-lg">
                            🎙️
                          </span>

                        )}

                      </div>


                      {/* INFORMATION */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center justify-between gap-2">

                          <span className="truncate font-bold">

                            {voice.title ||
                              "Unnamed Voice"}

                          </span>

                          {selectedVoice ===
                            voice._id && (

                            <span className="text-green-400">
                              ✓
                            </span>

                          )}

                        </div>

                        <p className="mt-1 truncate text-xs text-white/40">

                          {voice.author
                            ?.nickname ||
                            "Fish Audio"}

                        </p>

                        {voice.languages &&
                          voice.languages
                            .length >
                            0 && (

                            <p className="mt-1 text-[10px] uppercase tracking-wider text-purple-300/60">

                              {voice.languages
                                .slice(
                                  0,
                                  3
                                )
                                .join(
                                  " • "
                                )}

                            </p>

                          )}

                      </div>

                    </button>

                  ))}

                </div>

              )}

            </div>


            {/* GENERATE */}

            <div className="mt-5 flex items-center justify-between gap-4">

              <span className="text-xs text-white/30">
                {text.length} characters
              </span>

              <button
                onClick={
                  generateVoice
                }
                disabled={
                  loading ||
                  loadingVoices
                }
                className="rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-green-500 px-6 py-3 text-sm font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "GENERATING..."
                  : "GENERATE VOICE"}

              </button>

            </div>


            {/* ERROR */}

            {error && (

              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

                {error}

              </div>

            )}


            {/* RESULT */}

            {audioUrl && (

              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-5">

                <p className="mb-3 text-sm font-bold text-green-400">
                  YOUR AUDIO IS READY
                </p>

                <audio
                  controls
                  src={audioUrl}
                  className="w-full"
                />

                <a
                  href={audioUrl}
                  download="g-chat-voice-max.mp3"
                  className="mt-4 block rounded-xl bg-green-500 px-5 py-3 text-center text-sm font-black text-black"
                >
                  DOWNLOAD MP3
                </a>

              </div>

            )}

          </div>


          {/* CREATOR TOOLS */}

          <aside className="space-y-4">

            <ToolCard
              title="🎤 Voice Cloner"
              description="Clone your own voice from an audio sample."
              color="red"
            />

            <ToolCard
              title="🎬 Video → Audio"
              description="Extract high-quality audio from videos."
              color="purple"
            />

            <ToolCard
              title="📝 Audio → Text"
              description="Transcribe spoken audio automatically."
              color="green"
            />

            <ToolCard
              title="🎙️ AI Voiceover"
              description="Build professional creator narration."
              color="red"
            />

            <ToolCard
              title="💬 Subtitle Generator"
              description="Create downloadable SRT subtitles."
              color="purple"
            />

          </aside>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/30">

        G-Chat Voice Max © 2026

      </footer>

    </main>
  );
}


function ToolCard({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: "red" | "purple" | "green";
}) {

  const colors = {
    red:
      "border-red-500/20 hover:border-red-500/50",

    purple:
      "border-purple-500/20 hover:border-purple-500/50",

    green:
      "border-green-500/20 hover:border-green-500/50",
  };

  return (

    <div
      className={`rounded-2xl border bg-white/[0.03] p-5 transition ${colors[color]}`}
    >

      <h3 className="font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/40">
        {description}
      </p>

      <button className="mt-4 text-xs font-bold text-white/60">
        COMING SOON →
      </button>

    </div>

  );
}