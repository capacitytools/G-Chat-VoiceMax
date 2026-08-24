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

  const [voices, setVoices] = useState<Voice[]>([]);

  const [myVoices, setMyVoices] = useState<MyVoice[]>([]);

  const [selectedVoice, setSelectedVoice] = useState("");

  const [loadingVoices, setLoadingVoices] = useState(true);

  const [loading, setLoading] = useState(false);

  const [cloning, setCloning] = useState(false);

  const [audioUrl, setAudioUrl] = useState("");

  const [error, setError] = useState("");

  const [showCloner, setShowCloner] = useState(false);

  const [voiceName, setVoiceName] = useState("");

  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  /*
   * LOAD SAVED VOICES
   */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gchat_my_voices");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setMyVoices(parsed);
        }
      }
    } catch (error) {
      console.error("Unable to load saved voices:", error);
    }
  }, []);

  /*
   * LOAD FISH AUDIO VOICES
   */

  useEffect(() => {
    loadVoices();
  }, []);

  async function loadVoices() {
    try {
      setLoadingVoices(true);
      setError("");

      const response = await fetch(
        "/api/voices?page_size=20&page_number=1"
      );

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to load voices (${response.status}).`
        );
      }

      const items = Array.isArray(data.items)
        ? data.items
        : [];

      setVoices(items);

      if (items.length > 0 && !selectedVoice) {
        setSelectedVoice(items[0]._id);
      }
    } catch (error) {
      console.error("VOICE LOAD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load voices."
      );
    } finally {
      setLoadingVoices(false);
    }
  }

  /*
   * SELECT AUDIO FILE
   */

  function handleVoiceFile(
    file: File | undefined
  ) {
    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("audio/")) {
      setError(
        "Please select an audio file."
      );

      return;
    }

    if (file.size === 0) {
      setError(
        "The selected audio file is empty."
      );

      return;
    }

    setVoiceFile(file);
  }

  /*
   * CLONE VOICE
   */

  async function cloneVoice() {
    if (!voiceFile) {
      setError(
        "Please select or record a voice sample first."
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
      const formData = new FormData();

      formData.append(
        "audio",
        voiceFile,
        voiceFile.name
      );

      formData.append(
        "title",
        voiceName.trim()
      );

      const response = await fetch(
        "/api/voices/clone",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          error:
            responseText ||
            "Server returned an invalid response.",
        };
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Voice cloning failed (${response.status}).`
        );
      }

      if (
        !data.voice ||
        !data.voice.id
      ) {
        throw new Error(
          "Fish Audio did not return a voice ID."
        );
      }

      const newVoice: MyVoice =
        data.voice;

      const updatedVoices = [
        newVoice,
        ...myVoices,
      ];

      setMyVoices(updatedVoices);

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

    } catch (error) {
      console.error(
        "VOICE CLONE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Voice cloning failed."
      );
    } finally {
      setCloning(false);
    }
  }

  /*
   * DELETE LOCAL VOICE
   */

  function deleteVoice(id: string) {
    const updatedVoices =
      myVoices.filter(
        (voice) =>
          voice.id !== id
      );

    setMyVoices(updatedVoices);

    localStorage.setItem(
      "gchat_my_voices",
      JSON.stringify(
        updatedVoices
      )
    );

    if (selectedVoice === id) {
      setSelectedVoice("");
    }
  }

  /*
   * GENERATE VOICE
   */

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
            text: text.trim(),
            reference_id:
              selectedVoice,
          }),
        }
      );

      if (!response.ok) {
        const responseText =
          await response.text();

        let data: any;

        try {
          data =
            JSON.parse(
              responseText
            );
        } catch {
          data = {};
        }

        throw new Error(
          data.error ||
            responseText ||
            `Voice generation failed (${response.status}).`
        );
      }

      const blob =
        await response.blob();

      if (blob.size === 0) {
        throw new Error(
          "Fish Audio returned an empty audio file."
        );
      }

      const url =
        URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (error) {
      console.error(
        "TTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Voice generation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * CLEAR ERROR
   */

  function clearError() {
    setError("");
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

          <button
            type="button"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm"
          >
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

          <p className="mt-5 max-w-2xl text-white/50">

            Turn text into realistic speech,
            clone voices and create professional
            audio for your content.

          </p>

        </div>

      </section>


      {/* GLOBAL ERROR */}

      {error && (

        <section className="mx-auto max-w-7xl px-5">

          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">

            <div>

              <p className="font-bold text-red-400">
                Something went wrong
              </p>

              <p className="mt-1 break-words text-sm text-red-200">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={clearError}
              className="text-lg text-red-300"
            >
              ×
            </button>

          </div>

        </section>

      )}


      {/* VOICE CLONER */}

      <section className="mx-auto max-w-7xl px-5 pb-6">

        <button
          type="button"
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

            <span className="text-2xl">

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

              Upload a clear voice recording.
              A clean recording produces better
              results.

            </p>


            {/* VOICE NAME */}

            <label className="mt-5 block">

              <span className="mb-2 block text-sm font-bold">
                Voice Name
              </span>

              <input
                value={voiceName}
                onChange={(e) =>
                  setVoiceName(
                    e.target.value
                  )
                }
                placeholder="Example: My Creator Voice"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/20 focus:border-purple-500"
              />

            </label>


            {/* AUDIO UPLOAD */}

            <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-center transition hover:border-purple-500">

              <div className="text-4xl">
                🎙️
              </div>

              <p className="mt-3 font-bold">

                {voiceFile
                  ? voiceFile.name
                  : "Select your voice recording"}

              </p>

              <p className="mt-2 text-xs text-white/30">

                Tap here to choose an audio file
                from your phone.

              </p>

              <p className="mt-2 text-xs text-purple-300/60">

                MP3 • WAV • M4A • WEBM

              </p>

              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {

                  handleVoiceFile(
                    e.target.files?.[0]
                  );

                }}
              />

            </label>


            {/* SELECTED FILE */}

            {voiceFile && (

              <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">

                <div className="flex items-center justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-xs text-green-400">
                      AUDIO READY
                    </p>

                    <p className="mt-1 truncate text-sm font-bold">
                      {voiceFile.name}
                    </p>

                    <p className="mt-1 text-xs text-white/30">

                      {(
                        voiceFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB

                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setVoiceFile(
                        null
                      )
                    }
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400"
                  >
                    REMOVE
                  </button>

                </div>

              </div>

            )}


            {/* CREATE BUTTON */}

            <button
              type="button"
              onClick={
                cloneVoice
              }
              disabled={
                cloning ||
                !voiceFile ||
                !voiceName.trim()
              }
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-green-500 px-5 py-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
            >

              {cloning
                ? "CREATING VOICE..."
                : "CREATE VOICE CLONE"}

            </button>


            {cloning && (

              <p className="mt-3 text-center text-xs text-white/40">

                Uploading your recording and
                creating your voice. Please wait...

              </p>

            )}

          </div>

        )}

      </section>


      {/* MAIN STUDIO */}

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
                  Write your script and choose
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
                setText(
                  e.target.value
                )
              }
              placeholder="Type or paste your script here..."
              className="min-h-[280px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-5 leading-7 text-white outline-none placeholder:text-white/20 focus:border-purple-500"
            />


            {/* MY VOICES */}

            {myVoices.length > 0 && (

              <div className="mt-6">

                <div className="mb-3 flex items-center justify-between">

                  <span className="font-bold">
                    My Voices
                  </span>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    {myVoices.length}{" "}
                    saved
                  </span>

                </div>


                <div className="grid gap-3">

                  {myVoices.map(
                    (voice) => (

                      <div
                        key={
                          voice.id
                        }
                        className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                          selectedVoice ===
                          voice.id
                            ? "border-green-500 bg-green-500/10"
                            : "border-white/10 bg-white/[0.02]"
                        }`}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedVoice(
                              voice.id
                            )
                          }
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/30 via-purple-500/30 to-green-500/30">

                            🎤

                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-bold">
                              {voice.title}
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              Your cloned voice
                            </p>

                          </div>

                        </button>


                        {selectedVoice ===
                          voice.id && (

                          <span className="text-green-400">
                            ✓
                          </span>

                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteVoice(
                              voice.id
                            )
                          }
                          className="rounded-lg px-2 py-2 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          DELETE
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


            {/* FISH VOICE LIBRARY */}

            <div className="mt-6">

              <div className="mb-3 flex items-center justify-between">

                <span className="font-bold">
                  Voice Library
                </span>

                <span className="text-xs text-white/30">
                  {voices.length} voices
                </span>

              </div>


              {loadingVoices ? (

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/40">
                  Loading voices...
                </div>

              ) : voices.length === 0 ? (

                <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/40">
                  No voices found.
                </div>

              ) : (

                <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">

                  {voices.map(
                    (voice) => (

                      <button
                        type="button"
                        key={
                          voice._id
                        }
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

                            <span>
                              🎙️
                            </span>

                          )}

                        </div>


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

                    )
                  )}

                </div>

              )}

            </div>


            {/* GENERATE */}

            <button
              type="button"
              onClick={
                generateVoice
              }
              disabled={
                loading ||
                loadingVoices ||
                !selectedVoice
              }
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-500 via-purple-600 to-green-500 px-6 py-4 text-sm font-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
            >

              {loading
                ? "GENERATING..."
                : "GENERATE VOICE"}

            </button>


            {/* AUDIO RESULT */}

            {audioUrl && (

              <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-5">

                <p className="mb-3 font-bold text-green-400">
                  ✓ YOUR AUDIO IS READY
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


          {/* CREATOR TOOLS */}

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


      {/* FOOTER */}

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/30">

        G-Chat Voice Max © 2026

      </footer>

    </main>
  );
}


/*
 * TOOL CARD
 */

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

      <button
        type="button"
        className="mt-4 text-xs font-bold text-white/60"
      >
        COMING SOON →
      </button>

    </div>

  );
}