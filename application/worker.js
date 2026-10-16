// Terraform in placeholders ko frontend files se replace karta hai
const INDEX_HTML = __INDEX_HTML__;
const STYLE_CSS = __STYLE_CSS__;
const SCRIPT_JS = __SCRIPT_JS__;

const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["Pending", "In Progress", "Completed"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const text = (body, type) =>
  new Response(body, { headers: { "Content-Type": type + "; charset=utf-8" } });

async function nextTaskId(env) {
  const current = parseInt((await env.TASKS_KV.get("meta:counter")) || "100", 10);
  const next = current + 1;
  await env.TASKS_KV.put("meta:counter", String(next));
  return "T" + next;
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ---------- Frontend ----------
    if (method === "GET" && path === "/") return text(INDEX_HTML, "text/html");
    if (method === "GET" && path === "/style.css") return text(STYLE_CSS, "text/css");
    if (method === "GET" && path === "/script.js") return text(SCRIPT_JS, "application/javascript");

    // ---------- /api/tasks ----------
    if (path === "/api/tasks") {
      if (method === "GET") {
        const list = await env.TASKS_KV.list({ prefix: "task:" });
        const tasks = await Promise.all(
          list.keys.map((k) => env.TASKS_KV.get(k.name, "json"))
        );
        tasks.sort((a, b) => a.createdDate.localeCompare(b.createdDate));
        return json(tasks);
      }

      if (method === "POST") {
        const data = await readBody(request);
        if (!data || !data.title || !data.title.trim()) {
          return json({ error: "title is required" }, 400);
        }
        const priority = data.priority || "Medium";
        const status = data.status || "Pending";
        if (!PRIORITIES.includes(priority)) return json({ error: "invalid priority" }, 400);
        if (!STATUSES.includes(status)) return json({ error: "invalid status" }, 400);

        const id = await nextTaskId(env);
        const task = {
          id,
          title: data.title.trim(),
          priority,
          status,
          createdDate: new Date().toISOString(),
        };
        await env.TASKS_KV.put("task:" + id, JSON.stringify(task));
        return json(task, 201);
      }

      return json({ error: "method not allowed" }, 405);
    }

    // ---------- /api/tasks/:id ----------
    const match = path.match(/^\/api\/tasks\/([A-Za-z0-9_-]+)$/);
    if (match) {
      const id = match[1];
      const key = "task:" + id;
      const existing = await env.TASKS_KV.get(key, "json");
      if (!existing) return json({ error: "task not found" }, 404);

      if (method === "GET") return json(existing);

      if (method === "PUT") {
        const data = await readBody(request);
        if (!data) return json({ error: "invalid JSON" }, 400);
        if (data.priority && !PRIORITIES.includes(data.priority)) return json({ error: "invalid priority" }, 400);
        if (data.status && !STATUSES.includes(data.status)) return json({ error: "invalid status" }, 400);

        const updated = {
          ...existing,
          title: data.title ? data.title.trim() : existing.title,
          priority: data.priority || existing.priority,
          status: data.status || existing.status,
        };
        await env.TASKS_KV.put(key, JSON.stringify(updated));
        return json(updated);
      }

      if (method === "DELETE") {
        await env.TASKS_KV.delete(key);
        return json({ message: "task deleted", id });
      }

      return json({ error: "method not allowed" }, 405);
    }

    return json({ error: "not found" }, 404);
  },
};