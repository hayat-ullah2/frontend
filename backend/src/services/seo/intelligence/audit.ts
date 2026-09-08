// Library-wide site audit — real internal data.
//
// Runs over the analysis the engine already produces for every post and rolls
// it up into a prioritized, actionable audit: aggregate health, the worst
// offenders, and counts per issue type. No external calls.

import type { SeoAnalysis } from "../../../utils/seo/engine.js";
import { type SeoPostLike } from "./shared.js";

export type AuditItem = { post: SeoPostLike; analysis: SeoAnalysis };

export type AuditIssueGroup = {
  id: string;
  category: string;
  severity: "error" | "warning";
  message: string;
  count: number;
  examples: { title: string; slug: string }[];
};

export type SiteAudit = {
  totalPosts: number;
  avgScore: number;
  scoring80Plus: number;
  scoringBelow60: number;
  errorCount: number;
  warningCount: number;
  issueGroups: AuditIssueGroup[];
  worstPosts: { title: string; slug: string; score: number; status?: string; topIssue?: string }[];
};

export function auditLibrary(items: AuditItem[]): SiteAudit {
  const total = items.length;
  const scores = items.map((i) => i.analysis.score);
  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;

  const groups = new Map<string, AuditIssueGroup>();
  let errorCount = 0;
  let warningCount = 0;

  for (const { post, analysis } of items) {
    for (const issue of analysis.issues) {
      if (issue.severity === "good") continue;
      if (issue.severity === "error") errorCount++;
      else warningCount++;
      const g = groups.get(issue.id) ?? {
        id: issue.id,
        category: issue.category,
        severity: issue.severity as "error" | "warning",
        message: issue.message.replace(/[""].*?[""]/g, "…").replace(/\d+/g, "N"),
        count: 0,
        examples: [],
      };
      g.count++;
      if (g.examples.length < 5) g.examples.push({ title: post.title, slug: post.slug });
      groups.set(issue.id, g);
    }
  }

  const issueGroups = [...groups.values()].sort(
    (a, b) =>
      (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1) || b.count - a.count,
  );

  const worstPosts = [...items]
    .sort((a, b) => a.analysis.score - b.analysis.score)
    .slice(0, 10)
    .map(({ post, analysis }) => ({
      title: post.title,
      slug: post.slug,
      score: analysis.score,
      status: post.status,
      topIssue: analysis.issues.find((i) => i.severity === "error")?.message
        ?? analysis.issues.find((i) => i.severity === "warning")?.message,
    }));

  return {
    totalPosts: total,
    avgScore: avg,
    scoring80Plus: scores.filter((s) => s >= 80).length,
    scoringBelow60: scores.filter((s) => s < 60).length,
    errorCount,
    warningCount,
    issueGroups,
    worstPosts,
  };
}
