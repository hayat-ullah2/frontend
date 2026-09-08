// Audit follow-up — rewrite the remaining fabricated first-party "we tested"
// claims to honest research-based phrasing. Run with `--apply` to write;
// default is a dry run that only reports matches. Idempotent: re-running after
// apply is a no-op because the source phrases are gone.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const APPLY = process.argv.includes("--apply");

// Each edit is [regex, replacement]. Regexes use \s+ between words so they
// survive the Word-exported line breaks inside the stored HTML.
const EDITS: Record<string, Array<[RegExp, string]>> = {
  "free-ai-tools-for-small-business": [
    [
      /We\s+tested\s+each\s+platform\s+for\s+at\s+least\s+thirty\s+days\.\s+Our\s+evaluation\s+team\s+included\s+real\s+small\s+business\s+owners\./,
      "We evaluated each platform against its live product pages, official documentation and pricing, cross-checked with verified user reviews. Our assessment focused on the needs of real small business owners.",
    ],
    [
      /We\s+measured\s+actual\s+time\s+saved\s+in\s+our\s+test\s+projects\./,
      "We weighed the time each tool can realistically save, based on its documented features and user-reported workflows.",
    ],
    [
      /Only\s+tools\s+that\s+passed\s+this\s+test\s+made\s+the\s+list\./,
      "Only tools that met these criteria made the list.",
    ],
  ],
  "ideogram-v4-vs-nano-banana-2": [
    [
      /How\s+We\s+Tested\s+Ideogram\s+V4\s+and\s+Nano\s+Banana\s+2/,
      "How to Compare Ideogram V4 and Nano Banana 2 on Text",
    ],
  ],
};

async function run() {
  await connectDB();
  let changed = 0;
  for (const [slug, edits] of Object.entries(EDITS)) {
    const p = await Post.findOne({ slug });
    if (!p) { console.log(`skip ${slug} (not found)`); continue; }
    let content = p.content || "";
    let localChanges = 0;
    for (const [re, repl] of edits) {
      if (re.test(content)) {
        content = content.replace(re, repl);
        localChanges++;
        console.log(`  ✏️  ${slug}: matched /${re.source.slice(0, 45)}…/`);
      } else {
        console.log(`  ⚠️  ${slug}: NO MATCH for /${re.source.slice(0, 45)}…/`);
      }
    }
    if (localChanges && APPLY) {
      p.content = content;
      await p.save();
      changed += localChanges;
      console.log(`  ✅ saved ${slug} (${localChanges} edit(s))`);
    }
  }
  console.log(APPLY ? `\n✅ Applied ${changed} edit(s).` : `\n(dry run — pass --apply to write)`);
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
