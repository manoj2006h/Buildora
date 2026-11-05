import fs from "fs";
import path from "path";

const VERCEL_API = "https://api.vercel.com";

// ==========================================
// Helpers
// ==========================================

function getToken() {
  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    throw new Error(
      "VERCEL_TOKEN is not set. Add it to server/.env and restart the server."
    );
  }

  return token;
}

function getTeamQuery() {
  const query = new URLSearchParams();

  if (process.env.VERCEL_TEAM_ID) {
    query.set("teamId", process.env.VERCEL_TEAM_ID);
  }

  return query.toString();
}

// Read every file in the project folder and encode it for the Vercel API.
function collectFiles(dir, baseDir = dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Skip hidden files and dependencies
    if (entry.name.startsWith(".") || entry.name === "node_modules") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativePath = path
        .relative(baseDir, fullPath)
        .split(path.sep)
        .join("/");

      files.push({
        file: relativePath,
        data: fs.readFileSync(fullPath).toString("base64"),
        encoding: "base64",
      });
    }
  }

  return files;
}

// Vercel enables Deployment Protection by default on new projects, which
// redirects visitors to a Vercel login. Turn it off so the link is public.
async function disableDeploymentProtection(name, token) {
  const teamQuery = getTeamQuery();
  const suffix = teamQuery ? `?${teamQuery}` : "";

  const res = await fetch(
    `${VERCEL_API}/v9/projects/${encodeURIComponent(name)}${suffix}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ssoProtection: null,
        passwordProtection: null,
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));

    console.warn(
      "Could not disable Vercel deployment protection:",
      data?.error?.message || res.status
    );
  }
}

// ==========================================
// Wait until the deployment is live
// ==========================================

async function waitForDeployment(id, token, timeoutMs = 120000) {
  const startedAt = Date.now();
  const teamQuery = getTeamQuery();
  const suffix = teamQuery ? `?${teamQuery}` : "";

  while (Date.now() - startedAt < timeoutMs) {
    const res = await fetch(`${VERCEL_API}/v13/deployments/${id}${suffix}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data?.error?.message ||
          data?.message ||
          `Vercel API error (${res.status})`
      );
    }

    if (data.readyState === "READY") {
      return data;
    }

    if (data.readyState === "ERROR" || data.readyState === "CANCELED") {
      throw new Error(
        data.errorMessage ||
          `Vercel deployment ${data.readyState.toLowerCase()}.`
      );
    }

    // QUEUED / BUILDING / INITIALIZING
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(
    "Vercel deployment timed out. Check your Vercel dashboard for details."
  );
}

// ==========================================
// Publish a generated project to Vercel
// ==========================================

export async function publishProject(projectPath, projectId) {
  const token = getToken();

  const files = collectFiles(projectPath);

  if (files.length === 0) {
    throw new Error("Project has no files to deploy.");
  }

  // Stable project name per Buildora project.
  // The deployment URL itself is unique on every publish.
  const name = `buildora-${projectId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  const teamQuery = getTeamQuery();
  const suffix = teamQuery ? `?${teamQuery}` : "";

  const res = await fetch(`${VERCEL_API}/v13/deployments${suffix}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      files,
      target: "production",
      projectSettings: {
        framework: null,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        `Vercel API error (${res.status})`
    );
  }

  // Make sure the published site is publicly reachable
  await disableDeploymentProtection(name, token);

  const deployment = await waitForDeployment(data.id, token);

  return {
    url: `https://${deployment.url}`,
    deploymentId: deployment.id,
  };
}
