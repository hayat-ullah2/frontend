import { api } from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "writer" | "reader";
};

type AuthResponse = { token: string; user: AuthUser };

export function signup(input: { name: string; email: string; password: string }) {
  return api<AuthResponse>("/auth/signup", { method: "POST", json: input });
}

export function login(input: { email: string; password: string }) {
  return api<AuthResponse>("/auth/login", { method: "POST", json: input });
}

export function logout() {
  return api<{ success: true }>("/auth/logout", { method: "POST" });
}

export function me() {
  return api<AuthUser>("/auth/me");
}

export type ProfileSocials = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

export type ProfileUpdate = {
  name?: string;
  bio?: string;
  title?: string;
  avatar?: string;
  avatarPublicId?: string;
  socials?: ProfileSocials;
};

export function updateMe(input: ProfileUpdate) {
  return api<AuthUser & { bio?: string; avatar?: string; title?: string; socials?: ProfileSocials }>(
    "/users/me",
    { method: "PATCH", json: input },
  );
}
