// ────────────────────────────────────────────────────────────────────────────
// Modular AI provider abstraction.
//
// A single `AiProvider` interface with swappable implementations selected by the
// `AI_PROVIDER` env var. Adding a provider means implementing one method — the
// rest of the SEO system never changes. API keys are read from the environment
// and NEVER leave the server.
//
// If no provider is configured, `getAiProvider()` returns null and callers fall
// back to local heuristics (see seo.service.ts). The platform is fully usable
// with zero AI cost.
// ────────────────────────────────────────────────────────────────────────────

import { env } from "../../config/env.js";

export type AiChatOptions = {
  system?: string;
  /** Ask the model to return strict JSON. */
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
};

export interface AiProvider {
  readonly name: string;
  chat(prompt: string, opts?: AiChatOptions): Promise<string>;
}

class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  constructor(private apiKey: string, private model: string) {}
  async chat(prompt: string, opts: AiChatOptions = {}): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model || "gpt-4o-mini",
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 1200,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          ...(opts.system ? [{ role: "system", content: opts.system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  }
}

class ClaudeProvider implements AiProvider {
  readonly name = "claude";
  constructor(private apiKey: string, private model: string) {}
  async chat(prompt: string, opts: AiChatOptions = {}): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model || "claude-3-5-haiku-latest",
        max_tokens: opts.maxTokens ?? 1200,
        temperature: opts.temperature ?? 0.4,
        ...(opts.system ? { system: opts.system } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data.content?.map((c) => c.text ?? "").join("").trim() ?? "";
  }
}

class GeminiProvider implements AiProvider {
  readonly name = "gemini";
  constructor(private apiKey: string, private model: string) {}
  async chat(prompt: string, opts: AiChatOptions = {}): Promise<string> {
    const model = this.model || "gemini-1.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: opts.system
            ? { parts: [{ text: opts.system }] }
            : undefined,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: opts.temperature ?? 0.4,
            maxOutputTokens: opts.maxTokens ?? 1200,
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      },
    );
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return (
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ??
      ""
    );
  }
}

let cached: AiProvider | null | undefined;

/** Returns the configured provider, or null when AI is disabled/misconfigured. */
export function getAiProvider(): AiProvider | null {
  if (cached !== undefined) return cached;
  const { provider, apiKey, model } = env.ai;
  if (provider === "none" || !apiKey) {
    cached = null;
    return cached;
  }
  switch (provider) {
    case "openai":
      cached = new OpenAiProvider(apiKey, model);
      break;
    case "claude":
      cached = new ClaudeProvider(apiKey, model);
      break;
    case "gemini":
      cached = new GeminiProvider(apiKey, model);
      break;
    default:
      cached = null;
  }
  return cached;
}

export function isAiConfigured(): boolean {
  return getAiProvider() !== null;
}

/** Best-effort JSON parse from a model response (handles ```json fences). */
export function parseAiJson<T>(text: string): T | null {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
