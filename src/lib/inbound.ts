import { api } from "./api";

export type SubscribeInput = {
  email: string;
  source?: string;
  name?: string;
  leadMagnet?: string;
};

export function subscribe(input: SubscribeInput) {
  return api<{ id: string; email: string; already?: boolean }>("/subscribers", {
    method: "POST",
    json: input,
  });
}

export function unsubscribe(email: string) {
  return api<{ success: true }>("/subscribers/unsubscribe", {
    method: "POST",
    json: { email },
  });
}

export type ContactInput = {
  name: string;
  email: string;
  subject?: string;
  topic?: "general" | "pitch" | "partnerships" | "press" | "corrections";
  message: string;
};

export function submitContact(input: ContactInput) {
  return api<{ id: string }>("/contact", { method: "POST", json: input });
}
