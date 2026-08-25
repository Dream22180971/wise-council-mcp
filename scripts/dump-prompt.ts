import { writeFileSync } from "node:fs";
import { triage, buildRoundtablePrompt } from "../src/moderator/index.js";

const r = triage("32 岁了，体制内稳定但一眼望到头，要不要裸辞去追自己想要的生活？很焦虑");
writeFileSync("prompt-full.txt", buildRoundtablePrompt("要不要裸辞", "有房贷", r), "utf8");
console.log("written, advisors:", r.advisors.map((a) => a.name).join("|"));
