import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { runAgent } from "./agent.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5001;

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
      `http://localhost:${PORT}/preview/${projectId}/`;

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