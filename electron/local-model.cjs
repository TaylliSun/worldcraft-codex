const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const MAX_PROMPT_CHARS = 64000;
const MAX_RESPONSE_CHARS = 240000;

function normalizeProvider(value) {
  return value === "openai-compatible" ? "openai-compatible" : "local";
}

function resolveModelUrl(endpoint, provider = "local") {
  try {
    const url = new URL(String(endpoint ?? "").trim());
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    const isLoopback = LOOPBACK_HOSTS.has(url.hostname);
    if (normalizeProvider(provider) === "local" && !isLoopback) return null;
    if (!isLoopback && url.protocol !== "https:") return null;
    const basePath = url.pathname.replace(/\/+$/, "");
    url.pathname = basePath.endsWith("/chat/completions")
      ? basePath
      : `${basePath}/chat/completions`.replace(/\/+/g, "/");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function responseText(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }
  return "";
}

function responseDeltaText(payload) {
  const content = payload?.choices?.[0]?.delta?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("");
  }
  return "";
}

function aiRequestBoundary(settings, request, apiKey = "") {
  if (!settings?.enabled) return { error: "AI access is disabled." };
  const provider = normalizeProvider(settings.provider);
  const url = resolveModelUrl(settings.endpoint, provider);
  if (!url) {
    return {
      error:
        provider === "local"
          ? "Local AI requires a loopback OpenAI-compatible endpoint."
          : "Third-party AI requires an HTTPS OpenAI-compatible endpoint."
    };
  }
  const model = String(settings.model ?? "").trim().slice(0, 200);
  if (!model) return { error: "An AI model name is required." };
  const prompt = String(request?.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  if (!prompt) return { error: "The AI prompt is empty." };
  const systemPrompt = String(request?.systemPrompt ?? "").trim().slice(0, 8000);
  const temperature = Math.max(0, Math.min(1, Number(settings.temperature) || 0));
  const maxTokens = Math.max(128, Math.min(16384, Number(request?.maxTokens) || 1200));
  const headers = { "content-type": "application/json" };
  const credential = String(apiKey ?? "").trim();
  if (credential) headers.authorization = `Bearer ${credential}`;
  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });
  return { provider, url, model, temperature, maxTokens, headers, messages };
}

async function requestAiCompletion(settings, request, apiKey = "") {
  const boundary = aiRequestBoundary(settings, request, apiKey);
  if (boundary.error) return { ok: false, error: boundary.error };
  const { provider, url, model, temperature, maxTokens, headers, messages } = boundary;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        stream: false,
        messages
      }),
      redirect: "error",
      signal: controller.signal
    });
    if (!response.ok) return { ok: false, error: `AI service returned HTTP ${response.status}.` };
    const raw = await response.text();
    if (raw.length > MAX_RESPONSE_CHARS) {
      return { ok: false, error: "AI response exceeded the local safety limit." };
    }
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { ok: false, error: "AI service returned invalid JSON." };
    }
    const text = responseText(payload);
    if (!text) return { ok: false, error: "AI response did not contain message content." };
    return { ok: true, text, model, provider };
  } catch (error) {
    return {
      ok: false,
      error:
        error?.name === "AbortError"
          ? "AI request timed out."
          : "Could not connect to the AI service."
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function requestAiCompletionStream(
  settings,
  request,
  apiKey = "",
  { signal, onDelta } = {}
) {
  const boundary = aiRequestBoundary(settings, request, apiKey);
  if (boundary.error) return { ok: false, error: boundary.error };
  const { provider, url, model, temperature, maxTokens, headers, messages } = boundary;
  const controller = new AbortController();
  let cancelled = Boolean(signal?.aborted);
  let timedOut = false;
  const cancel = () => {
    cancelled = true;
    controller.abort();
  };
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 300000);
  let output = "";

  function append(delta) {
    if (!delta) return;
    if (output.length + delta.length > MAX_RESPONSE_CHARS) {
      controller.abort();
      throw new Error("AI_RESPONSE_LIMIT");
    }
    output += delta;
    if (typeof onDelta === "function") onDelta(delta, output);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        stream: true,
        messages
      }),
      redirect: "error",
      signal: controller.signal
    });
    if (!response.ok) return { ok: false, error: `AI service returned HTTP ${response.status}.` };

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
      const raw = await response.text();
      if (raw.length > MAX_RESPONSE_CHARS) {
        return { ok: false, error: "AI response exceeded the local safety limit." };
      }
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return { ok: false, error: "AI service returned invalid JSON." };
      }
      append(responseText(payload));
    } else {
      if (!response.body) return { ok: false, error: "AI stream did not contain a response body." };
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      const consumeLine = (rawLine) => {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) return;
        const data = line.slice(5).trim();
        if (!data) return;
        if (data === "[DONE]") {
          finished = true;
          return;
        }
        try {
          append(responseDeltaText(JSON.parse(data)));
        } catch (error) {
          if (error?.message === "AI_RESPONSE_LIMIT") throw error;
        }
      };
      while (!finished) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        let newline = buffer.indexOf("\n");
        while (newline >= 0) {
          const line = buffer.slice(0, newline).replace(/\r$/, "");
          buffer = buffer.slice(newline + 1);
          consumeLine(line);
          if (finished) break;
          newline = buffer.indexOf("\n");
        }
        if (done) {
          if (buffer.trim()) consumeLine(buffer);
          break;
        }
      }
    }

    const text = output.trim();
    if (!text) return { ok: false, error: "AI response did not contain message content." };
    return { ok: true, text, model, provider };
  } catch (error) {
    if (error?.message === "AI_RESPONSE_LIMIT") {
      return { ok: false, text: output, error: "AI response exceeded the local safety limit." };
    }
    if (cancelled) {
      return { ok: false, cancelled: true, text: output, model, provider, error: "AI request cancelled." };
    }
    return {
      ok: false,
      text: output,
      error: timedOut ? "AI request timed out." : "Could not connect to the AI service."
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener?.("abort", cancel);
  }
}

async function explainConsistencyFinding(settings, prompt, apiKey = "") {
  return requestAiCompletion(
    settings,
    {
      prompt,
      systemPrompt: "你是严谨的游戏叙事一致性审阅助手。只依据用户提供的证据回答。",
      maxTokens: 1000
    },
    apiKey
  );
}

module.exports = {
  LOOPBACK_HOSTS,
  explainConsistencyFinding,
  normalizeProvider,
  requestAiCompletion,
  requestAiCompletionStream,
  resolveLocalModelUrl: (endpoint) => resolveModelUrl(endpoint, "local"),
  resolveModelUrl,
  responseDeltaText,
  responseText
};
