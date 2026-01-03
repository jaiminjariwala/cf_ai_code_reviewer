export class SessionManager {
  state: DurableObjectState;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Get conversation history
    if (url.pathname === "/history") {
      const history = (await this.state.storage.get("history")) || [];
      return new Response(JSON.stringify(history), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add message to history
    if (url.pathname === "/add" && request.method === "POST") {
      const { message } = (await request.json()) as any;
      const history: any = (await this.state.storage.get("history")) || [];
      history.push(message);
      await this.state.storage.put("history", history);
      return new Response(JSON.stringify({ success: true }));
    }

    // Get user preferences
    if (url.pathname === "/preferences") {
      const prefs = (await this.state.storage.get("preferences")) || {
        language: "javascript",
        style: "concise",
      };
      return new Response(JSON.stringify(prefs));
    }

    // Update preferences
    if (url.pathname === "/preferences/update" && request.method === "POST") {
      const prefs = await request.json();
      await this.state.storage.put("preferences", prefs);
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response("Not found", { status: 404 });
  }
}
