"use client";

import { useState } from "react";

const voices = [
  {
    id: "default",
    name: "G-Chat Natural",
    description: "Natural creator narration",
  },
  {
    id: "male",
    name: "G-Chat Deep",
    description: "Deep male-style narration",
  },
  {
    id: "female",
    name: "G-Chat Smooth",
    description: "Smooth female-style narration",
  },
];

export default function Home() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("default");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  async function generateVoice() {
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.error || "Voice generation failed."
        );
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

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

            Turn your words into{" "}

            <span className="text-purple-400">
              realistic AI voice.
            </span>

          </h2>

          <p className="mt-5 max-w-2xl text-white/50">
            Create professional voiceovers, narration,
            social media audio, podcasts and creator
            content with G-Chat Voice Max.
          </p>

        </div>

      </section>


      {/* TOOL */}
      <section className="mx-auto max-w-7xl px-5 pb-16">

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">


          {/* EDITOR */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  Text to Voice
                </h3>

                <p className="mt-1 text-sm text-white/40">
                  Write your script and choose a voice.
                </p>

              </div>

              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
                TTS
              </div>

            </div>


            {/* TEXT */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your script here..."
              className="min-h-[280px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-5 leading-7 text-white outline-none focus:border-purple-500"
            />


            {/* VOICE SELECTOR */}
            <div className="mt-5">

              <label className="mb-3 block text-sm font-bold">
                Choose Voice
              </label>

              <div className="grid gap-3 sm:grid-cols-3">

                {voices.map((item) => (

                  <button
                    key={item.id}
                    onClick={() => setVoice(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      voice === item.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/30"
                    }`}
                  >

                    <div className="mb-2 flex items-center justify-between">

                      <span className="font-bold">
                        {item.name}
                      </span>

                      {voice === item.id && (
                        <span className="text-green-400">
                          ✓
                        </span>
                      )}

                    </div>

                    <p className="text-xs text-white/40">
                      {item.description}
                    </p>

                  </button>

                ))}

              </div>

            </div>


            {/* GENERATE */}
            <div className="mt-5 flex items-center justify-between">

              <span className="text-xs text-white/30">
                {text.length} characters
              </span>

              <button
                onClick={generateVoice}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-green-500 px-6 py-3 text-sm font-black transition hover:scale-[1.02] disabled:opacity-50"
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


            {/* AUDIO RESULT */}
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


          {/* TOOLS */}
          <aside className="space-y-4">

            <ToolCard
              title="Voice Cloner"
              description="Create a reusable AI voice from an audio sample."
              color="red"
            />

            <ToolCard
              title="Video → Audio"
              description="Extract MP3 from your videos."
              color="purple"
            />

            <ToolCard
              title="Audio → Text"
              description="Turn spoken audio into text."
              color="green"
            />

            <ToolCard
              title="AI Voiceover"
              description="Create professional creator narration."
              color="red"
            />

            <ToolCard
              title="Subtitle Generator"
              description="Generate downloadable SRT subtitles."
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
    red: "border-red-500/20 hover:border-red-500/50",
    purple: "border-purple-500/20 hover:border-purple-500/50",
    green: "border-green-500/20 hover:border-green-500/50",
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