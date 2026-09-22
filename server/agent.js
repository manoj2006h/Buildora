
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import "dotenv/config";
import os from "os";


// ==========================================
// System Information
// ==========================================

const platform = os.platform();

const asyncExecute = promisify(exec);


// ==========================================
// Gemini AI
// ==========================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


// ==========================================
// Execute Terminal Command
// ==========================================

async function executeCommand({ command }, projectPath) {

    console.log(`\nExecuting: ${command}`);
    console.log(`Working directory: ${projectPath}\n`);

    try {

        const { stdout, stderr } = await asyncExecute(command, {
            cwd: projectPath,
        });

        if (stderr) {

            return `Command completed with stderr:

${stderr}

Output:

${stdout}`;
        }

        return `Success:

${stdout || "Command executed successfully."}`;

    } catch (error) {

        return `Command failed:

${error.message}`;
    }
}


// ==========================================
// Tool Declaration
// ==========================================

const executeCommandDeclaration = {

    name: "executeCommand",

    description:
        "Execute a single terminal/shell command inside the current project workspace. The command can create folders, create files, write files, edit files, delete files, inspect files, or run basic development commands. Do not install packages, libraries, frameworks, or dependencies.",

    parameters: {

        type: "OBJECT",

        properties: {

            command: {

                type: "STRING",

                description:
                    'A single terminal/shell command. Example: "touch index.html"',
            },
        },

        required: ["command"],
    },
};


// ==========================================
// Available Tools
// ==========================================

const availableTools = {

    executeCommand,
};


// ==========================================
// Main ManojAI Agent
// ==========================================

export async function runAgent(userProblem, projectPath) {

    // Each request gets its own history
    const History = [];


    // ==========================================
    // Initial User Request
    // ==========================================

    History.push({

        role: "user",

        parts: [
            {
                text: userProblem,
            },
        ],
    });


    // ==========================================
    // Agent Loop
    // ==========================================

    while (true) {

        try {

            const response = await ai.models.generateContent({

                // Use the model available in your Gemini setup
                model: "gemini-3.5-flash-lite",

                contents: History,

                config: {

                    // ==========================================
                    // SYSTEM INSTRUCTIONS
                    // ==========================================

                    systemInstruction: `

You are ManojAI, an expert AI website builder.

Your job is to create complete, modern, responsive websites based on
the user's request.

==================================================
STRICT TECHNOLOGY RULE
==================================================

You MUST use ONLY:

1. HTML
2. Tailwind CSS
3. Vanilla JavaScript

These are the ONLY technologies allowed.

==================================================
FORBIDDEN TECHNOLOGIES
==================================================

NEVER use:

- React
- ReactDOM
- Next.js
- Vue
- Angular
- Svelte
- Astro
- Nuxt
- Bootstrap
- Material UI
- Chakra UI
- Ant Design
- jQuery
- TypeScript
- JSX
- TSX
- Express
- Node.js frameworks
- Vite
- Webpack
- Parcel
- Rollup
- Any frontend framework
- Any JavaScript framework
- Any JavaScript library
- Any CSS framework other than Tailwind CSS
- Any component library
- Any UI library
- Any frontend build tool

Do NOT install npm packages.

Do NOT run:

npm install

npm i

npx

yarn

pnpm

bun install

Do NOT create node_modules.

Do NOT create package.json.

Do NOT create package-lock.json.

Do NOT create framework configuration files.

==================================================
TAILWIND CSS
==================================================

Tailwind CSS is allowed.

For websites, prefer using the Tailwind CDN.

Example:

<script src="https://cdn.tailwindcss.com"></script>

You can use Tailwind utility classes directly in HTML.

Example:

<div class="flex items-center justify-center min-h-screen bg-slate-950">
    <h1 class="text-4xl font-bold text-white">
        Hello
    </h1>
</div>

Do NOT install Tailwind through npm.

Do NOT create a Tailwind build pipeline.

Do NOT create tailwind.config.js.

Do NOT create postcss.config.js.

==================================================
VANILLA JAVASCRIPT
==================================================

All website functionality must use plain JavaScript.

Example:

<script>

const button = document.getElementById("button");

button.addEventListener("click", () => {

    console.log("Button clicked");

});

</script>

You may use:

- DOM APIs
- fetch()
- localStorage
- sessionStorage
- Web APIs
- JavaScript classes
- JavaScript functions
- ES modules when useful

But do NOT import external JavaScript libraries.

==================================================
PROJECT STRUCTURE
==================================================

The current workspace itself is the website project.

CURRENT PROJECT WORKSPACE:

${projectPath}

Everything you create MUST remain inside this directory.

A normal project should look like:

${projectPath}/

    index.html

    script.js

    assets/

Additional HTML, CSS, or JavaScript files may be created when necessary.

For example:

${projectPath}/

    index.html

    about.html

    contact.html

    script.js

    assets/

==================================================
HTML
==================================================

Every website MUST have:

index.html

The index.html file must be directly openable in a browser.

Do not create a separate application wrapper.

Do not create a React root.

Do not use JSX.

==================================================
CSS
==================================================

Use Tailwind CSS for styling.

Prefer Tailwind utility classes directly inside HTML.

If custom CSS is absolutely necessary, you may create:

style.css

However, do not use another CSS framework.

==================================================
JAVASCRIPT FILES
==================================================

For larger websites, place JavaScript inside:

script.js

For very small websites, inline JavaScript is also acceptable.

==================================================
CURRENT OPERATING SYSTEM
==================================================

The current operating system is:

${platform}

Use commands compatible with this operating system.

==================================================
TOOL
==================================================

You have access to:

executeCommand

The executeCommand tool allows you to:

- Create files
- Edit files
- Delete files
- Create folders
- Inspect files
- Run basic terminal commands

Use executeCommand whenever you need to modify the project.

==================================================
IMPORTANT TOOL RULES
==================================================

1. Never create files outside:

${projectPath}

2. Never install packages.

3. Never install frameworks.

4. Never use React.

5. Never use Vite.

6. Never use npm.

7. Never use another frontend library.

8. Never assume a command succeeded.

9. Always inspect command results.

10. If a command fails, analyse the error and fix it.

==================================================
WEBSITE DEVELOPMENT PROCESS
==================================================

Follow this process:

STEP 1:

Understand the user's requirements.

STEP 2:

Determine the required pages and functionality.

STEP 3:

Create the required HTML files.

STEP 4:

Create JavaScript files if functionality is required.

STEP 5:

Use Tailwind CSS for the UI.

STEP 6:

Connect JavaScript functionality to the HTML.

STEP 7:

Inspect the generated files.

STEP 8:

Fix any errors.

STEP 9:

Make sure index.html exists.

STEP 10:

Make sure the website can be opened directly in a browser.

STEP 11:

Only after the website is complete, provide a short summary.

==================================================
DESIGN RULES
==================================================

Create modern, professional and responsive websites.

The website should:

- Work on mobile
- Work on tablet
- Work on desktop
- Have good spacing
- Have accessible buttons
- Have readable typography
- Have responsive layouts
- Have hover states where appropriate
- Have useful interactions
- Avoid unnecessary complexity

When appropriate, use:

- Flexbox
- CSS Grid
- Tailwind responsive utilities
- Cards
- Modals
- Navigation bars
- Mobile menus
- Forms
- Animations
- Transitions
- Hover effects

All of these must be implemented using HTML, Tailwind CSS and vanilla
JavaScript only.

==================================================
IF USER REQUESTS REACT
==================================================

If the user asks you to create a React website:

DO NOT use React.

Instead, build the equivalent website using:

HTML + Tailwind CSS + Vanilla JavaScript.

Do not create:

.jsx

.tsx

vite.config.js

package.json

node_modules

or any React-specific files.

==================================================
IF USER REQUESTS A LIBRARY
==================================================

If the user requests a library such as:

React
Vue
Bootstrap
jQuery
Three.js
GSAP
Framer Motion
etc.

DO NOT install or use it.

Implement the requested functionality using vanilla JavaScript and
Tailwind CSS whenever possible.

==================================================
NO DEPENDENCIES
==================================================

The generated project should be dependency-free.

The preferred project is:

index.html
script.js
style.css
assets/

No npm installation should be necessary.

==================================================
IMPORTANT FINAL CHECK
==================================================

Before finishing, verify:

1. index.html exists.

2. The website uses only HTML.

3. Styling uses Tailwind CSS.

4. Functionality uses vanilla JavaScript.

5. No React exists.

6. No Vue exists.

7. No Angular exists.

8. No Vite exists.

9. No package.json exists.

10. No node_modules exists.

11. No external JavaScript libraries are used.

12. No other CSS frameworks are used.

13. All files are inside:

${projectPath}

==================================================
ABSOLUTE RULE
==================================================

Before using ANY technology ask yourself:

"Is this HTML, Tailwind CSS, or Vanilla JavaScript?"

If the answer is NO:

DO NOT USE IT.

NEVER use React.

NEVER use Vite.

NEVER use npm packages.

NEVER use frontend frameworks.

NEVER use JavaScript libraries.

NEVER use CSS frameworks other than Tailwind CSS.

The final website must be built ONLY with:

HTML + Tailwind CSS + Vanilla JavaScript.

CURRENT PROJECT WORKSPACE:

${projectPath}

Everything must remain inside this directory.

`,

                    // ==========================================
                    // Tools
                    // ==========================================

                    tools: [

                        {
                            functionDeclarations: [
                                executeCommandDeclaration,
                            ],
                        },

                    ],
                },
            });


            // ==========================================
            // AI Wants To Use A Tool
            // ==========================================

            if (
                response.functionCalls &&
                response.functionCalls.length > 0
            ) {

                // Preserve Gemini's function-call response
                History.push(
                    response.candidates[0].content
                );


                const functionResponses = [];


                // ==========================================
                // Execute Each Tool Call
                // ==========================================

                for (const functionCall of response.functionCalls) {

                    console.log("\nAI Tool Call:");
                    console.log(functionCall);


                    const { name, args } = functionCall;


                    const tool = availableTools[name];


                    // ==========================================
                    // Unknown Tool
                    // ==========================================

                    if (!tool) {

                        functionResponses.push({

                            functionResponse: {

                                name,

                                response: {

                                    result:
                                        `Tool "${name}" does not exist.`,

                                },

                            },

                        });

                        continue;
                    }


                    // ==========================================
                    // Execute Tool
                    // ==========================================

                    try {

                        const result = await tool(
                            args,
                            projectPath
                        );


                        console.log("\nTool Result:");
                        console.log(result);


                        functionResponses.push({

                            functionResponse: {

                                name,

                                response: {

                                    result,

                                },

                            },

                        });


                    } catch (error) {

                        const result =
                            `Tool execution error: ${error.message}`;


                        console.log(result);


                        functionResponses.push({

                            functionResponse: {

                                name,

                                response: {

                                    result,

                                },

                            },

                        });
                    }
                }


                // ==========================================
                // Send Tool Results Back To Gemini
                // ==========================================

                History.push({

                    role: "user",

                    parts: functionResponses,

                });


                // Continue the agent loop
                continue;
            }


            // ==========================================
            // AI Has Finished
            // ==========================================

            if (response.text) {

                console.log("\nAI:");
                console.log(response.text);


                History.push({

                    role: "model",

                    parts: [

                        {
                            text: response.text,
                        },

                    ],

                });


                return response.text;
            }


            // ==========================================
            // No Final Response
            // ==========================================

            return "ManojAI completed without a final response.";


        } catch (error) {

            console.error("\nGemini Error:");
            console.error(error.message);

            throw error;
        }
    }
}
