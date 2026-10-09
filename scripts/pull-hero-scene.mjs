// Saves the hero's published Unicorn Studio scene into public/, so the site
// serves its own copy instead of fetching it from Unicorn on every visit.
// Run after republishing the scene in Unicorn Studio:  npm run scene:pull
import { writeFile } from "node:fs/promises";

const PROJECT_ID = "P9NQwwDyqpdo8M1mJg53";
const url = `https://storage.googleapis.com/unicornstudio-production/embeds/${PROJECT_ID}?v=${Date.now()}`;

const response = await fetch(url);
if (!response.ok) throw new Error(`Couldn't fetch the scene: ${response.status}`);
const scene = await response.json();
if (scene.options?.freePlan) {
  throw new Error("This publish is from the free plan, so it carries the watermark. Not saving it.");
}
await writeFile(new URL("../public/hero-scene.json", import.meta.url), JSON.stringify(scene));
console.log(`Saved ${scene.options?.name ?? PROJECT_ID} (last published ${response.headers.get("last-modified")}).`);
