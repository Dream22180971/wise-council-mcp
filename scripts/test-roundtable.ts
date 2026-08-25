import { triage, buildRoundtablePrompt } from "../src/moderator/index.js";

const cases = [
  "我的博客要不要加评论功能？会不会影响阅读体验？",
  "32 岁了，体制内稳定但一眼望到头，要不要裸辞去追自己想要的生活？很焦虑",
  "最近压力好大，觉得活着没什么意思，什么都不想要了",
  "这个项目该选 Next.js 还是 Astro？团队就三个人",
];


for (const q of cases) {
  const r = triage(q);
  console.log("══════════════════════════════");
  console.log("问题:", q);
  console.log("桌别:", r.desk === "day" ? "☀️ 白天的董事会" : "🌙 夜晚的董事会");
  console.log("分诊依据:", r.deskReason);
  console.log("点名:", r.advisors.map((a) => a.name).join("、"));
  if (r.safetyNote) console.log(r.safetyNote);
}

// 完整剧本冒烟测试：取第 2 题
const r = triage(cases[1]);
const prompt = buildRoundtablePrompt(cases[1], "有房贷，存款够撑一年", r);
console.log("\n══════ 完整圆桌剧本（前 40 行）════════");
console.log(prompt.split("\n").slice(0, 40).join("\n"));
