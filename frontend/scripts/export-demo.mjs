#!/usr/bin/env node
// Exports the current backend data into frontend/public/demo/ so the
// GitHub Pages build can serve a static, read-only version of the gallery.
//
// Prereq: backend is running locally (default http://localhost:5000).
// Run:    npm run export-demo [-- --api http://host:port]

import { mkdir, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, "..");
const repoRoot = resolve(frontendRoot, "..");

const args = process.argv.slice(2);
const apiFlagIdx = args.indexOf("--api");
const API = apiFlagIdx >= 0 ? args[apiFlagIdx + 1] : process.env.API_URL ?? "http://localhost:5000";
const backendImagesDir = resolve(repoRoot, "backend/wwwroot/images");
const demoDir = resolve(frontendRoot, "public/demo");
const demoImagesDir = join(demoDir, "images");

async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function main() {
  console.log(`Exporting demo data from ${API} …`);

  // Pull all cards (paginate until drained).
  const pageSize = 100;
  let page = 1;
  const allCards = [];
  let total = Infinity;
  while ((page - 1) * pageSize < total) {
    const res = await fetchJson(`/api/cards?page=${page}&pageSize=${pageSize}`);
    total = res.total;
    allCards.push(...res.cards);
    page++;
    if (res.cards.length === 0) break;
  }

  const [tags, tagTypes] = await Promise.all([
    fetchJson("/api/tags"),
    fetchJson("/api/tag-types"),
  ]);

  // Fetch each card's detail to include updatedAt (matches CardDetail shape).
  const cardDetails = await Promise.all(
    allCards.map((c) => fetchJson(`/api/cards/${c.id}`))
  );

  // Reset demo dir.
  if (existsSync(demoDir)) await rm(demoDir, { recursive: true });
  await mkdir(demoImagesDir, { recursive: true });

  await writeFile(join(demoDir, "cards.json"), JSON.stringify(cardDetails));
  await writeFile(join(demoDir, "tags.json"), JSON.stringify(tags));
  await writeFile(join(demoDir, "tag-types.json"), JSON.stringify(tagTypes));

  // Copy images referenced by any card.
  const referenced = new Set(cardDetails.map((c) => c.imageFileName));
  if (!existsSync(backendImagesDir)) {
    console.warn(`! backend images dir not found: ${backendImagesDir}`);
  } else {
    const files = await readdir(backendImagesDir);
    let copied = 0;
    for (const f of files) {
      if (!referenced.has(f)) continue;
      await copyFile(join(backendImagesDir, f), join(demoImagesDir, f));
      copied++;
    }
    console.log(`  ${copied} images copied → public/demo/images/`);
  }

  console.log(`  ${cardDetails.length} cards, ${tags.length} tags, ${tagTypes.length} tag types`);
  console.log("Done. Commit frontend/public/demo/ to publish.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
