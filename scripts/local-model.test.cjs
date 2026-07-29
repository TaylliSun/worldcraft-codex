const assert = require("node:assert/strict");
const http = require("node:http");
const {
  explainConsistencyFinding,
  requestAiCompletion,
  requestAiCompletionStream,
  resolveLocalModelUrl,
  resolveModelUrl
} = require("../electron/local-model.cjs");

async function main() {
  assert.equal(
    resolveLocalModelUrl("http://127.0.0.1:11434/v1").pathname,
    "/v1/chat/completions"
  );
  assert.equal(resolveLocalModelUrl("https://example.com/v1"), null);
  assert.equal(resolveLocalModelUrl("http://user:pass@localhost:11434/v1"), null);
  assert.equal(
    resolveModelUrl("https://models.example.com/v1", "openai-compatible").pathname,
    "/v1/chat/completions"
  );
  assert.equal(resolveModelUrl("http://models.example.com/v1", "openai-compatible"), null);

  const disabled = await explainConsistencyFinding(
    { enabled: false, endpoint: "http://127.0.0.1:11434/v1", model: "local" },
    "prompt"
  );
  assert.equal(disabled.ok, false);
  assert.equal(disabled.error.includes("disabled"), true);

  let receivedPath = "";
  let receivedBody = null;
  let receivedAuthorization = "";
  const server = http.createServer((request, response) => {
    receivedPath = request.url;
    receivedAuthorization = request.headers.authorization || "";
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      receivedBody = JSON.parse(body);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          choices: [{ message: { content: "  请核对事件模板与时间线。  " } }]
        })
      );
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const result = await requestAiCompletion(
    {
      enabled: true,
      provider: "local",
      endpoint: `http://127.0.0.1:${address.port}/v1`,
      model: "test-model",
      temperature: 2
    },
    { prompt: "只解释当前证据", systemPrompt: "系统边界", maxTokens: 321 },
    "test-secret"
  );
  await new Promise((resolve) => server.close(resolve));

  assert.equal(result.ok, true);
  assert.equal(result.text, "请核对事件模板与时间线。");
  assert.equal(result.model, "test-model");
  assert.equal(receivedPath, "/v1/chat/completions");
  assert.equal(receivedBody.model, "test-model");
  assert.equal(receivedBody.temperature, 1);
  assert.equal(receivedBody.stream, false);
  assert.equal(receivedBody.max_tokens, 321);
  assert.equal(receivedBody.messages.length, 2);
  assert.equal(receivedBody.messages[0].content, "系统边界");
  assert.equal(receivedBody.messages[1].content, "只解释当前证据");
  assert.equal(receivedAuthorization, "Bearer test-secret");

  let streamingRequestBody = null;
  const streamServer = http.createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      streamingRequestBody = JSON.parse(body);
      const cancelScenario = streamingRequestBody.messages.at(-1).content === "cancel";
      response.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache"
      });
      response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: cancelScenario ? "Partial" : "First " } }] })}\n\n`);
      if (cancelScenario) {
        const timer = setTimeout(() => {
          if (!response.destroyed) response.end("data: [DONE]\n\n");
        }, 500);
        response.on("close", () => clearTimeout(timer));
        return;
      }
      response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "chapter" } }] })}\n\n`);
      response.end("data: [DONE]\n\n");
    });
  });
  await new Promise((resolve) => streamServer.listen(0, "127.0.0.1", resolve));
  const streamAddress = streamServer.address();
  const deltas = [];
  const streamed = await requestAiCompletionStream(
    {
      enabled: true,
      provider: "local",
      endpoint: `http://127.0.0.1:${streamAddress.port}/v1`,
      model: "stream-model",
      temperature: 0.4
    },
    { prompt: "write", systemPrompt: "system", maxTokens: 9000 },
    "",
    { onDelta: (delta) => deltas.push(delta) }
  );
  assert.equal(streamed.ok, true);
  assert.equal(streamed.text, "First chapter");
  assert.deepEqual(deltas, ["First ", "chapter"]);
  assert.equal(streamingRequestBody.stream, true);
  assert.equal(streamingRequestBody.max_tokens, 9000);

  const controller = new AbortController();
  const cancelled = await requestAiCompletionStream(
    {
      enabled: true,
      provider: "local",
      endpoint: `http://127.0.0.1:${streamAddress.port}/v1`,
      model: "stream-model"
    },
    { prompt: "cancel", maxTokens: 1000 },
    "",
    {
      signal: controller.signal,
      onDelta: () => controller.abort()
    }
  );
  await new Promise((resolve) => streamServer.close(resolve));
  assert.equal(cancelled.ok, false);
  assert.equal(cancelled.cancelled, true);
  assert.equal(cancelled.text, "Partial");

  console.log("AI model boundary checks passed: 29 assertions across 6 scenarios.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
