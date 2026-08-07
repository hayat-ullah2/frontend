"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { submitContact, type ContactInput } from "@/lib/inbound";

const TOPICS: { value: ContactInput["topic"]; label: string }[] = [
  { value: "general", label: "General inquiry" },
  { value: "pitch", label: "Pitch an article" },
  { value: "partnerships", label: "Partnerships" },
  { value: "press", label: "Press" },
  { value: "corrections", label: "Corrections" },
];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState<ContactInput["topic"]>("general");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 5) {
      setError("Please write a more substantial message.");
      return;
    }
    setSaving(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || undefined,
        topic,
        message: message.trim(),
      });
      setDone(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send message.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="lg:col-span-3 card p-8 sm:p-10 text-center">
        <p className="text-2xl font-semibold">Message sent ✨</p>
        <p className="mt-2 text-foreground-muted text-sm">
          We aim to respond within five business days. Thanks for reaching out.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="btn-ghost text-sm mt-6 inline-flex"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="lg:col-span-3 card p-6 sm:p-8 space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" placeholder="Ada Lovelace" value={name} onChange={setName} required />
        <Field
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
      </div>
      <Field label="Subject" placeholder="What's it about?" value={subject} onChange={setSubject} />
      <div>
        <label className="block text-xs text-foreground-subtle uppercase tracking-wider mb-2">
          Topic
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as ContactInput["topic"])}
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-foreground-subtle uppercase tracking-wider mb-2">
          Message
        </label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a bit more…"
          className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-subtle">
          By submitting you agree to our privacy policy.
        </p>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-foreground-subtle uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}
