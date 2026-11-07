import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { runAgent } from "./agent.js";
import { publishProject } from "./vercel.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

// Public base URL for preview links. Falls back to the current request host.
function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
}

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// SERVE GENERATED PROJECTS
// ==========================================

app.use(
  "/preview",
  express.static(path.join(__dirname, "projects"))
);

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("ManojAI backend is running 🚀");
});

// ==========================================
// GENERATE WEBSITE
// ==========================================

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Check prompt
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    console.log("\n==============================");
    console.log("New ManojAI Request");
    console.log("==============================");
    console.log("Prompt:", prompt);

    // ==========================================
    // CREATE UNIQUE PROJECT
    // ==========================================

    const projectId = `project-${Date.now()}`;

    const projectPath = path.join(
      __dirname,
      "projects",
      projectId
    );

    // Create project folder
    fs.mkdirSync(projectPath, {
      recursive: true,
    });

    console.log("Project ID:", projectId);
    console.log("Project Path:", projectPath);

    // ==========================================
    // RUN MANOJAI AGENT
    // ==========================================

    const result = await runAgent(
      prompt,
      projectPath
    );

    console.log("\nManojAI completed successfully.");

    // ==========================================
    // PREVIEW URL
    // ==========================================

    const previewUrl =
      `${getBaseUrl(req)}/preview/${projectId}/`;

    console.log("Preview URL:", previewUrl);

    // ==========================================
    // SEND RESPONSE TO FRONTEND
    // ==========================================

    res.json({
      success: true,
      result: result,
      projectId: projectId,
      previewUrl: previewUrl,
    });

  } catch (error) {
    console.error("\n==============================");
    console.error("MANOJAI ERROR");
    console.error("==============================");

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message || "Something went wrong",
    });
  }
});

// ==========================================
// GENERATE WEBSITE (STREAMING PROGRESS)
// ==========================================
//
// Server-Sent Events (SSE) version of /api/generate.
// Emits progress events while the agent works, then a final
// `done` (or `error`) event. The response body is a stream:
//
//   data: {"type":"progress","phase":"tool","message":"Writing index.html"}\n\n
//
app.post("/api/generate/stream", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: "Prompt is required",
    });
  }

  // ==========================================
  // CREATE UNIQUE PROJECT
  // ==========================================

  const projectId = `project-${Date.now()}`;

  const projectPath = path.join(
    __dirname,
    "projects",
    projectId
  );

  fs.mkdirSync(projectPath, {
    recursive: true,
  });

  // ==========================================
  // SSE HEADERS
  // ==========================================

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let closed = false;

  const send = (event) => {
    if (closed) return;

    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Keep proxies/clients from timing out during long generations
  const heartbeat = setInterval(() => {
    if (!closed) {
      res.write(": ping\n\n");
    }
  }, 15000);

  res.on("close", () => {
    closed = true;
    clearInterval(heartbeat);
  });

  console.log("\n==============================");
  console.log("New Buildora Streaming Request");
  console.log("==============================");
  console.log("Prompt:", prompt);
  console.log("Project ID:", projectId);

  try {
    send({
      type: "start",
      projectId,
      message: "Starting Buildora…",
    });

    const result = await runAgent(prompt, projectPath, {
      onProgress: (event) =>
        send({
          type: "progress",
          ...event,
        }),
      shouldAbort: () => closed,
    });

    send({
      type: "done",
      success: true,
      result: result,
      projectId: projectId,
      previewUrl: `${getBaseUrl(req)}/preview/${projectId}/`,
    });

  } catch (error) {
    console.error("\n==============================");
    console.error("BUILDORA STREAMING ERROR");
    console.error("==============================");
    console.error(error);

    send({
      type: "error",
      success: false,
      message: error.message || "Something went wrong",
    });

  } finally {
    clearInterval(heartbeat);

    if (!closed) {
      res.end();
    }
  }
});

// ==========================================
// PUBLISH WEBSITE TO VERCEL
// ==========================================

app.post("/api/publish", async (req, res) => {
  try {
    const { projectId } = req.body;

    // Only allow IDs generated by /api/generate (blocks path traversal)
    if (!projectId || !/^project-\d+$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid project ID",
      });
    }

    const projectPath = path.join(
      __dirname,
      "projects",
      projectId
    );

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    if (!fs.existsSync(path.join(projectPath, "index.html"))) {
      return res.status(400).json({
        success: false,
        error: "Project has no index.html to publish",
      });
    }

    console.log("\n==============================");
    console.log("Publishing to Vercel");
    console.log("==============================");
    console.log("Project ID:", projectId);

    const deployment = await publishProject(
      projectPath,
      projectId
    );

    console.log("Published URL:", deployment.url);

    res.json({
      success: true,
      url: deployment.url,
      deploymentId: deployment.deploymentId,
    });

  } catch (error) {
    console.error("\n==============================");
    console.error("VERCEL PUBLISH ERROR");
    console.error("==============================");

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to publish to Vercel",
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `\n🚀 ManojAI server running on http://localhost:${PORT}`
  );

  console.log(
    `📁 Generated projects: ${path.join(
      __dirname,
      "projects"
    )}`
  );
});