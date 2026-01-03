import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  AI: any;
  SESSIONS: DurableObjectNamespace;
  ASSETS: Fetcher;
};

interface HistoryMessage {
  role: string;
  content: string;
  timestamp: string;
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors());

// Serve static files from assets
app.get("/", async (c) => {
  return c.env.ASSETS.fetch(new Request("https://example.com/index.html"));
});

app.get("/styles.css", async (c) => {
  return c.env.ASSETS.fetch(new Request("https://example.com/styles.css"));
});

app.get("/main.js", async (c) => {
  return c.env.ASSETS.fetch(new Request("https://example.com/main.js"));
});

app.get("/favicon.ico", (c) => c.notFound());

// API Routes
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to clean CSS from AI response
function cleanCSSFromResponse(text: string): string {
  // Remove all CSS color codes
  text = text.replace(/#[0-9a-fA-F]{3,8}/g, '');
  
  // Remove font-weight declarations
  text = text.replace(/font-weight:\s*\d+;?/gi, '');
  
  // Remove color declarations
  text = text.replace(/color:\s*[^;]+;?/gi, '');
  
  // Remove inline style attributes from span tags
  text = text.replace(/<span[^>]*style="[^"]*"[^>]*>/gi, '');
  text = text.replace(/<\/span>/gi, '');
  
  // Remove CSS selectors and rules
  text = text.replace(/[#.]\w+\s*\{[^}]*\}/g, '');
  
  // Remove standalone semicolons
  text = text.replace(/;\s*"/g, '"');
  text = text.replace(/;\s*>/g, '>');
  
  return text;
}

app.post("/api/review", async (c) => {
  try {
    const { content, sessionId } = await c.req.json();
    
    const id = c.env.SESSIONS.idFromName(sessionId);
    const stub = c.env.SESSIONS.get(id);
    
    const historyResponse = await stub.fetch("https://fake-host/history");
    const history = (await historyResponse.json()) as HistoryMessage[];
    
    const contextHistory = history.slice(-3).map((h) => h.content).join("\n");
    
    const systemPrompt = `You are a code reviewer. Be concise and clear.

RULES:
- Keep responses SHORT (max 300 words)
- Output format:

ANALYSIS:
Brief explanation

ISSUES:
1. Issue
2. Issue

IMPROVEMENTS:
1. Suggestion
2. Suggestion

- For code: Use clean markdown \`\`\`python without any styling
- Just plain code, no decorations

Previous context: ${contextHistory}`;
    
    const response = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content }
      ],
      max_tokens: 1024,
      temperature: 0.7
    });
    
    let reviewText = response.response || "No response from AI";
    
    // Clean CSS from the response
    reviewText = cleanCSSFromResponse(reviewText);
    
    // Save to history
    await stub.fetch("https://fake-host/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          role: "user",
          content,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    await stub.fetch("https://fake-host/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          role: "assistant",
          content: reviewText,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    return c.json({ review: reviewText, sessionId });
  } catch (error: any) {
    console.error("Error in review endpoint:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/api/history/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const id = c.env.SESSIONS.idFromName(sessionId);
  const stub = c.env.SESSIONS.get(id);
  
  const response = await stub.fetch("https://fake-host/history");
  const history = await response.json();
  
  return c.json({ history });
});

export default app;
export { SessionManager } from "./durableObject";
