import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Subscriber } from "../models/Subscriber.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../services/email/index.js";
import { WELCOME_STEPS, siteUrl } from "../services/email/welcome-sequence.js";

const HOUR = 60 * 60 * 1000;
const BATCH = 50;

/** Scheduled time for the step at `index`, measured from signup time. */
function scheduledAt(signup: Date, index: number): Date | undefined {
  const step = WELCOME_STEPS[index];
  if (!step) return undefined;
  return new Date(signup.getTime() + step.delayHours * HOUR);
}

export async function subscribe(req: Request, res: Response) {
  const { email, source, name, leadMagnet } = req.body as {
    email: string;
    source?: string;
    name?: string;
    leadMagnet?: string;
  };
  const normEmail = email.toLowerCase().trim();

  const existing = await Subscriber.findOne({ email: normEmail });
  if (existing && !existing.unsubscribedAt) {
    // Already active — don't re-trigger the welcome series.
    return res
      .status(200)
      .json({ success: true, data: { id: existing._id, email: existing.email, already: true } });
  }

  const now = new Date();
  const nextStep = 1; // step 0 is sent immediately below
  const sub = await Subscriber.findOneAndUpdate(
    { email: normEmail },
    {
      $set: {
        email: normEmail,
        name: name?.trim() || existing?.name,
        source: source ?? "site",
        leadMagnet: leadMagnet ?? existing?.leadMagnet,
        unsubscribedAt: undefined,
        welcomeStep: nextStep,
        welcomeDone: !WELCOME_STEPS[nextStep],
        nextEmailAt: scheduledAt(now, nextStep),
        lastEmailedAt: now,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Send the immediate welcome (fire-and-forget — never block the response).
  const step0 = WELCOME_STEPS[0];
  if (step0) {
    const r = step0.render(
      { email: sub.email, name: sub.name ?? undefined, leadMagnet: sub.leadMagnet ?? undefined },
      siteUrl(),
    );
    void sendEmail({ to: sub.email, subject: r.subject, html: r.html });
  }

  res.status(201).json({ success: true, data: { id: sub._id, email: sub.email } });
}

/**
 * Cron-triggered: send any welcome-sequence emails that are now due. A scheduler
 * (Vercel Cron, GitHub Actions, cron-job.org…) POSTs here periodically with the
 * shared secret. Idempotent and safe to call often.
 */
export async function processWelcomeSequence(req: Request, res: Response) {
  const secret = (req.get("x-cron-secret") || req.query.secret || "").toString();
  if (!env.email.cronSecret || secret !== env.email.cronSecret) {
    throw ApiError.unauthorized("Invalid or missing cron secret");
  }

  const due = await Subscriber.find({
    welcomeDone: false,
    unsubscribedAt: null,
    nextEmailAt: { $lte: new Date() },
  }).limit(BATCH);

  let sent = 0;
  for (const sub of due) {
    const idx = sub.welcomeStep ?? 0;
    const step = WELCOME_STEPS[idx];
    if (!step) {
      sub.set({ welcomeDone: true, nextEmailAt: undefined });
      await sub.save();
      continue;
    }
    const r = step.render(
      { email: sub.email, name: sub.name ?? undefined, leadMagnet: sub.leadMagnet ?? undefined },
      siteUrl(),
    );
    const result = await sendEmail({ to: sub.email, subject: r.subject, html: r.html });
    if (result.ok) sent++;

    const nextIdx = idx + 1;
    const signup = (sub.get("createdAt") as Date) ?? new Date();
    if (WELCOME_STEPS[nextIdx]) {
      sub.set({ welcomeStep: nextIdx, nextEmailAt: scheduledAt(signup, nextIdx), lastEmailedAt: new Date() });
    } else {
      sub.set({ welcomeDone: true, nextEmailAt: undefined, lastEmailedAt: new Date() });
    }
    await sub.save();
  }

  res.json({ success: true, data: { due: due.length, sent } });
}

export async function unsubscribe(req: Request, res: Response) {
  const email = (req.body?.email ?? req.query.email ?? "").toString().toLowerCase().trim();
  if (!email) throw ApiError.badRequest("Email is required");
  await Subscriber.updateOne(
    { email },
    { $set: { unsubscribedAt: new Date(), welcomeDone: true }, $unset: { nextEmailAt: "" } },
  );
  // Always succeed — never reveal whether an address was on the list.
  res.json({ success: true });
}

export async function submitContact(req: Request, res: Response) {
  const msg = await ContactMessage.create(req.body);
  res.status(201).json({ success: true, data: { id: msg._id } });
}

export async function listSubscribers(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
  const [items, total, active] = await Promise.all([
    Subscriber.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Subscriber.countDocuments(),
    Subscriber.countDocuments({ unsubscribedAt: null }),
  ]);
  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, active },
  });
}

export async function listContactMessages(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
  const [items, total] = await Promise.all([
    ContactMessage.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ContactMessage.countDocuments(),
  ]);
  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
