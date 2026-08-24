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

type MyVoice = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
};

export default function Home() {
  const [text, setText] = useState("");

  const [voices, setVoices] =
    useState<Voice[]>([]);

  const [myVoices, setMyVoices] =
    useState<MyVoice[]>([]);

  const [selectedVoice, setSelectedVoice] =
    useState("");

  const [loadingVoices, setLoadingVoices] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [cloning, setCloning] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const [showCloner, setShowCloner] =
    useState(false);

  const [voiceName, setVoiceName] =
    useState("");

  const [voiceFile, setVoiceFile] =
    useState<File | null>(null);


  /* LOAD SAVED CLONED VOICES */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "gchat_my_voices"
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        setMyVoices(parsed);
      }
    } catch {
      console.log(
        "Unable to load saved voices."
      );
    }
  }, []);


  /* LOAD FISH VOICES */

  useEffect(() => {
    loadVoices();
  }, []);


  async function loadVoices() {
    try {
      setLoadingVoices(true);

      const response =
        await fetch(
          "/api/voices?page_size=20&page_number=1"
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load voices."
        );
      }

      const data =
        await response.json();

      const items =
        Array.isArray(data.items)
          ? data.items
          : [];

      setVoices(items);

      if (
        items.length > 0 &&
        !selectedVoice
      ) {
        setSelectedVoice(
          items[0]._id
        );
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


  /* CLONE VOICE */

  async function cloneVoice() {

    if (!voiceFile) {

      setError(
        "Please select a voice recording."
      );

      return;
    }

    if (!voiceName.trim()) {

      setError(
        "Please enter a name for the voice."
      );

      return;
    }

    setCloning(true);
    setError("");

    try {

      const formData =
        new FormData();

      formData.append(
        "audio",
        voiceFile
      );

      formData.append(
        "title",
        voiceName
      );

      const response =
        await fetch(
          "/api/voices/clone",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
            "Voice cloning failed."
        );

      }

      const newVoice =
        data.voice;

      const updatedVoices = [
        newVoice,
        ...myVoices,
      ];

      setMyVoices(
        updatedVoices
      );

      localStorage.setItem(
        "gchat_my_voices",
        JSON.stringify(
          updatedVoices
        )
      );

      setSelectedVoice(
        newVoice.id
      );

      setVoiceFile(null);
      setVoiceName("");

      setShowCloner(false);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Voice cloning failed."
      );

    } finally {

      setCloning(false);

    }
  }


  /* DELETE LOCAL VOICE */

  function deleteVoice(id: string) {

    const updated =
      myVoices.filter(
        (voice) =>
          voice.id !== id
      );

    setMyVoices(updated);

    localStorage.setItem(
      "gchat_my_voices",
      JSON.stringify(
        updated
      )
    );

    if (
      selectedVoice === id
    ) {
      setSelectedVoice("");
    }
  }


  /* GENERATE SPEECH */

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

      const response =
        await fetch(
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
        URL.createObjectURL(
          blob
        );

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

            Create voices.

            <br />

            Create stories.

            <br />

            <span className="text-purple-400">
              Create anything.
            </span>

          </h2>

        </div>

      </section>


      {/* CLONER */}

      <section className="mx-auto max-w-7xl px-5 pb-6">

        <button
          onClick={() =>
            setShowCloner(
              !showCloner
            )
          }
          className="w-full rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-green-500/10 p-5 text-left transition hover:border-red-500/60"
        >

          <div className="flex items-center justify-between">

            <div>

              <h3 className="text-lg font-black">
                🎤 Clone Your Voice
              </h3>

              <p className="mt-1 text-sm text-white/40">
                Create a reusable AI voice from
                your recording.
              </p>

            </div>

            <span className="text-xl">
              {showCloner
                ? "−"
                : "+"}
            </span>

          </div>

        </button>


        {showCloner && (

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <h3 className="text-xl font-bold">
              Create Voice Clone
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Upload a clear recording of the
              voice you want to clone.
            </p>


            {/* NAME */}

            <input
              value={voiceName}
              onChange={(e) =>
                setVoiceName(
                  e.target.value
                )
              }
              placeholder="Voice name"
              className="mt-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-purple-500"
            />


            {/* FILE */}

            <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center transition hover:border-purple-500">

              <div className="text-3xl">
                🎙️
              </div>

              <p className="mt-3 font-bold">
                {voiceFile
                  ? voiceFile.name
                  : "Upload voice recording"}
              </p>

              <p className="mt-2 text-xs text-white/30">
                MP3, WAV, M4A or other supported
                audio formats
              </p>

              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {

                  const file =
                    e.target.files?.[0];

                  if (file) {
                    setVoiceFile(
                      file
                    );
                  }

                }}
              />

            </label>


            {/* CREATE */}

            <button
              onClick={
                cloneVoice
              }
              disabled={
                cloning
              }
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-green-500 px-5 py-4 text-sm font-black disabled:opacity-50"
            >

              {cloning
                ? "CREATING VOICE..."
                : "CREATE VOICE CLONE"}

            </button>

          </div>

        )}

      </section>


      {/* MAIN */}

      <section className="mx-auto max-w-7xl px-5 pb-16">

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">


          {/* EDITOR */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <h3 className="text-xl font-bold">
              Text to Voice
            </h3>

            <textarea
              value={text}
              onChange={(e) =>
                setText(
                  e.target.value
                )
              }
              placeholder="Type or paste your script here..."
              className="mt-5 min-h-[260px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-5 leading-7 text-white outline-none focus:border-purple-500"
            />


            {/* MY VOICES */}

            {myVoices.length > 0 && (

              <div className="mt-6">

                <div className="mb-3 flex justify-between">

                  <span className="font-bold">
                    My Voices
                  </span>

                  <span className="text-xs text-green-400">
                    {myVoices.length}
                  </span>

                </div>

                <div className="grid gap-3">

                  {myVoices.map(
                    (voice) => (

                      <div
                        key={
                          voice.id
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 ${
                          selectedVoice ===
                          voice.id
                            ? "border-green-500 bg-green-500/10"
                            : "border-white/10"
                        }`}
                      >

                        <button
                          onClick={() =>
                            setSelectedVoice(
                              voice.id
                            )
                          }
                          className="flex flex-1 items-center gap-3 text-left"
                        >

                          <span className="text-xl">
                            🎤
                          </span>

                          <span>

                            <span className="block font-bold">
                              {voice.title}
                            </span>

                            <span className="text-xs text-white/30">
                              Your cloned voice
                            </span>

                          </span>

                        </button>


                        <button
                          onClick={() =>
                            deleteVoice(
                              voice.id
                            )
                          }
                          className="px-2 text-xs text-red-400"
                        >
                          DELETE
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {/* GENERATE */}

            <button
              onClick={
                generateVoice
              }
              disabled={
                loading ||
                loadingVoices
              }
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-green-500 px-6 py-4 text-sm font-black disabled:opacity-50"
            >

              {loading
                ? "GENERATING..."
                : "GENERATE VOICE"}

            </button>


            {/* ERROR */}

            {error && (

              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>

            )}


            {/* AUDIO */}

            {audioUrl && (

              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-5">

                <p className="mb-3 font-bold text-green-400">
                  YOUR AUDIO IS READY
                </p>

                <audio
                  controls
                  src={
                    audioUrl
                  }
                  className="w-full"
                />

                <a
                  href={
                    audioUrl
                  }
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
              title="🎤 Voice Cloner"
              description="Clone and reuse your own voice."
              color="red"
            />

            <ToolCard
              title="🎬 Video → Audio"
              description="Extract audio from videos."
              color="purple"
            />

            <ToolCard
              title="📝 Audio → Text"
              description="Transcribe spoken audio."
              color="green"
            />

            <ToolCard
              title="🎙️ AI Voiceover"
              description="Create professional narration."
              color="red"
            />

            <ToolCard
              title="💬 Subtitle Generator"
              description="Generate SRT subtitles."
              color="purple"
            />

          </aside>

        </div>

      </section>


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