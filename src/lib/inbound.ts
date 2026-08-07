import { api } from "./api";

export function subscribe(email: string, source = "site") {
  return api<{ id: string; email: string }>("/subscribers", {
    method: "POST",
    json: { email, source },
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
