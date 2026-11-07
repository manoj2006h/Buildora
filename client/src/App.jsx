import { useEffect, useRef, useState } from "react";

// Backend URL. Override with VITE_API_URL when the API is on another origin.
const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:5001";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publishError, setPublishError] = useState("");
  const [progress, setProgress] = useState([]);
  const [elapsed, setElapsed] = useState(0);

  const abortRef = useRef(null);
  const progressIdRef = useRef(0);

  // Tick the elapsed timer while a generation is running
  useEffect(() => {
    if (!loading) return undefined;

    const timer = setInterval(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  const pushProgress = (message, { active = true, ok = true } = {}) => {
    progressIdRef.current += 1;

    const id = progressIdRef.current;

    setProgress((prev) => [
      ...prev.map((item) => ({ ...item, active: false })),
      { id, message, active, ok },
    ]);
  };

  const finishActiveStep = (ok, message) => {
    setProgress((prev) => {
      const next = [...prev];

      for (let i = next.length - 1; i >= 0; i -= 1) {
        if (next[i].active) {
          next[i] = {
            ...next[i],
            active: false,
            ok,
            message: message || next[i].message,
          };
          break;
        }
      }

      return next;
    });
  };

  const handleProgressEvent = (event) => {
    if (event.type === "start") {
      pushProgress(event.message || "Starting Buildora…");
      return;
    }

    if (event.type === "progress") {
      if (event.phase === "tool" && event.status === "start") {
        pushProgress(event.message);
      } else if (event.phase === "tool" && event.status === "done") {
        finishActiveStep(
          event.ok !== false,
          event.ok === false ? event.message : undefined
        );
      } else if (event.phase === "final") {
        pushProgress(event.message || "Finalising the website…");
      } else if (event.phase === "limit" || event.phase === "cancelled") {
        pushProgress(event.message);
      }

      return;
    }

    if (event.type === "error") {
      setResponse(event.message || "Something went wrong.");
      setProgress((prev) => prev.map((item) => ({ ...item, active: false })));
      return;
    }

    if (event.type === "done") {
      setResponse(event.result || "");
      setPreviewUrl(event.previewUrl || "");
      setProjectId(event.projectId || "");
      setProgress((prev) => prev.map((item) => ({ ...item, active: false })));
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    const controller = new AbortController();

    abortRef.current = controller;

    try {
      setLoading(true);
      setElapsed(0);
      setResponse("");
      setPreviewUrl("");
      setProjectId("");
      setPublishedUrl("");
      setPublishError("");
      setProgress([]);
      progressIdRef.current = 0;

      const res = await fetch(`${API_BASE}/api/generate/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        throw new Error(
          data.error || `Request failed (${res.status})`
        );
      }

      if (!res.body) {
        throw new Error("Streaming is not supported by this browser.");
      }

      // Read the SSE stream chunk by chunk
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");

        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLine = chunk
            .split("\n")
            .find((line) => line.startsWith("data:"));

          if (!dataLine) continue;

          const raw = dataLine.slice(5).trim();

          if (!raw) continue;

          try {
            handleProgressEvent(JSON.parse(raw));
          } catch (error) {
            console.error("Invalid progress event:", raw, error);
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setResponse("Generation cancelled.");
        pushProgress("Generation cancelled.", { active: false, ok: false });
      } else {
        console.error(error);
        setResponse(
          error.message || "Failed to connect to Buildora backend."
        );
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  const handlePublish = async () => {
    if (!projectId || publishing) return;

    try {
      setPublishing(true);
      setPublishedUrl("");
      setPublishError("");

      const res = await fetch(`${API_BASE}/api/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPublishedUrl(data.url);
      } else {
        setPublishError(data.error || "Failed to publish to Vercel.");
      }
    } catch (error) {
      console.error(error);
      setPublishError("Failed to connect to Buildora backend.");
    } finally {
      setPublishing(false);
    }
  };

  const showProgress = loading || progress.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>

          <h1 className="text-xl font-bold">
            Buildora by Manoj H
          </h1>
        </div>

        <div className="text-sm text-slate-400">
          AI Website Builder
        </div>
      </nav>

      {/* Main */}
      <main className="flex flex-col items-center px-6 py-16">

        {/* Hero */}
        <div className="text-center max-w-3xl">

          <p className="text-blue-400 font-medium mb-4">
            Build websites with AI
          </p>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            Turn your ideas into
            <span className="text-blue-500"> websites.</span>
          </h2>

          <p className="mt-6 text-slate-400 text-lg">
            Describe what you want to build and ManojAI will create it for you.
          </p>

        </div>

        {/* Prompt Box */}
        <div className="w-full max-w-3xl mt-12">

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl">

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) handleGenerate();
                }
              }}
              placeholder="Describe the website you want to build..."
              className="w-full h-32 bg-transparent outline-none resize-none text-white placeholder:text-slate-500"
            />

            <div className="flex items-center justify-between mt-3">

              <p className="text-xs text-slate-500">
                Describe your idea in natural language
              </p>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition font-medium"
              >
                {loading ? "Generating..." : "Generate 🚀"}
              </button>

            </div>

          </div>

          {/* Build Progress */}
          {showProgress && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800">

              <div className="flex items-center justify-between mb-3">

                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      loading
                        ? "bg-blue-500 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  ></span>

                  <span>
                    {loading ? "Building your website..." : "Build complete"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {elapsed}s
                  </span>

                  {loading && (
                    <button
                      onClick={handleCancel}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>

              <ol className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {progress.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">

                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        item.active
                          ? "border-blue-500 text-blue-400"
                          : item.ok === false
                            ? "border-red-600 text-red-400"
                            : "border-emerald-600 text-emerald-400"
                      }`}
                    >
                      {item.active ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                      ) : item.ok === false ? (
                        "!"
                      ) : (
                        "✓"
                      )}
                    </span>

                    <span
                      className={
                        item.active ? "text-slate-200" : "text-slate-400"
                      }
                    >
                      {item.message}
                    </span>

                  </li>
                ))}
              </ol>

            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              {response}
            </div>
          )}

        </div>

        {/* Example Prompts */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">

          <button
            onClick={() =>
              setPrompt(
                "Create a modern portfolio website for a computer science student"
              )
            }
            className="px-4 py-2 rounded-full border border-slate-800 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition"
          >
            💼 Portfolio
          </button>

          <button
            onClick={() =>
              setPrompt(
                "Create a modern landing page for a startup"
              )
            }
            className="px-4 py-2 rounded-full border border-slate-800 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition"
          >
            🚀 Startup
          </button>

          <button
            onClick={() =>
              setPrompt(
                "Create a restaurant website with menu and contact section"
              )
            }
            className="px-4 py-2 rounded-full border border-slate-800 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition"
          >
            🍔 Restaurant
          </button>

        </div>

        {/* Live Preview */}
        {previewUrl && (
          <div className="w-full max-w-6xl mt-16">

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">

              <h2 className="text-2xl font-semibold">
                Live Preview
              </h2>

              <div className="flex items-center gap-4">

                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Open in new tab ↗
                </a>

                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold"
                >
                  {publishing ? "Publishing..." : "Publish to Vercel 🚀"}
                </button>

              </div>

            </div>

            {/* Publish Result */}
            {publishedUrl && (
              <div className="mb-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">

                <span className="text-sm text-slate-400">
                  Live on Vercel:
                </span>

                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 break-all"
                >
                  {publishedUrl}
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(publishedUrl)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition"
                >
                  Copy link
                </button>

              </div>
            )}

            {publishError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-900 text-red-300 text-sm">
                {publishError}
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">

              <iframe
                src={previewUrl}
                title="Generated Website"
                className="w-full h-[700px]"
              />

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default App;
