import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publishError, setPublishError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setResponse("");
      setPreviewUrl("");
      setProjectId("");
      setPublishedUrl("");
      setPublishError("");

      const res = await fetch("http://localhost:5001/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.result);

        // Use the unique project URL returned by backend
        setPreviewUrl(data.previewUrl);
        setProjectId(data.projectId);
      } else {
        setResponse(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setResponse("Failed to connect to ManojAI backend.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!projectId || publishing) return;

    try {
      setPublishing(true);
      setPublishedUrl("");
      setPublishError("");

      const res = await fetch("http://localhost:5001/api/publish", {
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
      setPublishError("Failed to connect to ManojAI backend.");
    } finally {
      setPublishing(false);
    }
  };

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