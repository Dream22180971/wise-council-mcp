// ==================== 司仪（Master of Ceremonies） ====================
// 职责：分诊（白天桌/夜晚桌）→ 点名（3-5 位相关顾问）→ 安全检查 → 组装圆桌剧本

import type { Advisor } from "../advisors/index.js";
import { getAdvisorById, getAdvisorsByDesk } from "../advisors/index.js";

export type Desk = "day" | "night";

export interface TriageResult {
  desk: Desk;
  deskReason: string;
  topicTags: string[];
  advisors: Advisor[];
  safetyNote?: string;
}

// ---------- 安全红线：心理危机信号 ----------
const CRISIS_PATTERNS = [
  /自杀|不想活|活不下去|想死|轻生|了结|解脱吧/i,
  /抑郁|绝望|崩溃|没有意义.{0,6}(活|人生)/i,
  /自残|伤害自己/i,
];

// ---------- 夜晚桌信号（人生探讨） ----------
const NIGHT_PATTERNS: { tag: string; re: RegExp }[] = [
  { tag: "意义", re: /意义|活着为什么|人生方向|空虚|迷茫|找不到答案/i },
  { tag: "焦虑内耗", re: /焦虑|内耗|精神内耗|压力|喘不过气|心累|emo/i },
  { tag: "职业人生", re: /要不要辞职|该不该转行|职业(?:规划|选择|迷茫)|35岁|中年危机|体制内|回老家|裸辞/i },
  { tag: "关系", re: /结婚|离婚|恋爱|分手|相亲|原生家庭|父母|婆媳|友情|孤独|社交恐惧/i },
  { tag: "生死健康", re: /生病|绝症|死亡|亲人去世|失去|告别|临终/i },
  { tag: "自我认同", re: /我是谁|讨厌自己|自卑|不自信|讨好型|自我价值|活成/i },
  { tag: "幸福感", re: /幸福|快乐|满足感|生活质量|平衡工作与生活|躺平|松弛感/i },
];

// ---------- 白天桌信号（事业/技术/商业） ----------
const DAY_PATTERNS: { tag: string; re: RegExp }[] = [
  { tag: "产品设计", re: /产品|功能|需求|用户|体验|迭代|竞品|定价/i },
  { tag: "技术架构", re: /架构|代码|技术选型|重构|性能|数据库|前端|后端|API|微服务|框架|next\.?js|react|vue|svelte|astro|node|python|typescript|java|golang|rust/i },
  { tag: "项目管理", re: /项目|排期|里程碑|敏捷|迭代周期|交付|延期/i },
  { tag: "团队管理", re: /团队|下属|招聘|绩效|激励|组织|分工|授权/i },
  { tag: "创业商业", re: /创业|商业|市场|融资|增长|获客|商业模式|竞争|壁垒/i },
  { tag: "职业发展", re: /晋升|跳槽|offer|薪资|谈薪|面试|简历|技能成长/i },
  { tag: "内容创作", re: /写作|博客|文章|内容|流量|粉丝|排版|标题/i },
];

// ---------- 主题 → 顾问点名表（每桌按优先级排列） ----------
const SELECTION_MAP: Record<string, string[]> = {
  // 白天桌
  产品设计: ["zhangxiaolong", "yujun", "donnorman", "stevekrug", "munger"],
  技术架构: ["linus", "martinfowler", "unclebob", "evanyou", "guido"],
  项目管理: ["mikecohn", "martinfowler", "wangjian", "hanfeizi"],
  团队管理: ["hanfeizi", "mikecohn", "wangjian", "munger"],
  创业商业: ["munger", "sunzi", "yujun", "kahneman", "guiguzi"],
  职业发展: ["wangyangming", "kahneman", "zhuangzi", "munger", "jung"],
  内容创作: ["ruanyifeng", "stevekrug", "zhuangzi", "adler"],
  // 夜晚桌
  意义: ["viktorfrankl", "camus", "laozi", "shitieteng"],
  焦虑内耗: ["zhuangzi", "epictetus", "adler", "wangyangming"],
  职业人生: ["jung", "wangyangming", "adler", "kahneman", "munger"],
  关系: ["adler", "guiguzi", "yangjiang", "hanfeizi"],
  生死健康: ["shitieteng", "viktorfrankl", "yangjiang", "epictetus"],
  自我认同: ["jung", "adler", "zhuangzi", "yangjiang"],
  幸福感: ["yangjiang", "epictetus", "laozi", "camus"],
};

const DESK_LABEL: Record<Desk, string> = {
  day: "白天的董事会（事业之桌）",
  night: "夜晚的董事会（人生之桌）",
};

export function triage(question: string, forceDesk?: Desk): TriageResult {
  // 1. 安全检查（优先级最高）
  const safetyNote = CRISIS_PATTERNS.some((re) => re.test(question))
    ? "⚠️ 议题安全提示：检测到较重的心理痛苦信号。董事会提供视角，不提供心理治疗。请务必考虑寻求专业心理援助（中国大陆心理援助热线：12356；北京心理危机热线：010-82951332）。你此刻的痛苦值得被专业的人认真对待。"
    : undefined;

  // 2. 分诊：统计两桌信号命中数
  const nightHits: string[] = [];
  for (const p of NIGHT_PATTERNS) if (p.re.test(question)) nightHits.push(p.tag);
  const dayHits: string[] = [];
  for (const p of DAY_PATTERNS) if (p.re.test(question)) dayHits.push(p.tag);

  let desk: Desk;
  if (forceDesk) {
    desk = forceDesk;
  } else {
    // 夜晚桌信号加权：人生议题往往更需要主动识别（用户常用职场语言包裹人生问题）
    desk = nightHits.length * 1.5 >= dayHits.length && nightHits.length > 0 ? "night" : "day";
  }

  const topicTags = (desk === "night" ? nightHits : dayHits).slice(0, 3);
  const deskReason =
    topicTags.length > 0
      ? `议题命中主题：${topicTags.join("、")}`
      : forceDesk
        ? `按指定就座：${DESK_LABEL[desk]}`
        : `按默认分诊就座：${DESK_LABEL[desk]}`;

  // 3. 点名：按主题取顾问，不足 3 人时从对应桌的共用席/东方席补位
  const picked: Advisor[] = [];
  const seen = new Set<string>();
  for (const tag of topicTags) {
    for (const id of SELECTION_MAP[tag] ?? []) {
      if (seen.has(id)) continue;
      const a = getAdvisorById(id);
      if (a && (a.desk === desk || a.desk === "both")) {
        picked.push(a);
        seen.add(id);
      }
    }
  }
  // 补位池：优先共用席，再从本桌随机补
  if (picked.length < 3) {
    const pool = getAdvisorsByDesk(desk).filter((a) => !seen.has(a.id));
    const sharedFirst = [...pool].sort((x, y) => {
      const w = (a: Advisor) => (a.desk === "both" ? 0 : 1);
      return w(x) - w(y);
    });
    for (const a of sharedFirst) {
      if (picked.length >= 3) break;
      picked.push(a);
      seen.add(a.id);
    }
  }

  // 3.5 第 39 席：夜晚桌永久列席"65岁的你"，压轴发言（不在点名表内，强制注入）
  if (desk === "night") {
    const fs = getAdvisorById("future-self");
    if (fs) {
      const withoutFs = picked.filter((a) => a.id !== "future-self");
      while (withoutFs.length >= 5) withoutFs.pop();
      withoutFs.push(fs);
      picked.length = 0;
      picked.push(...withoutFs);
    }
  }

  return { desk, deskReason, topicTags, advisors: picked.slice(0, 5), safetyNote };
}

// ---------- 发言格式契约（形式统一，思想自由） ----------
const SPEAKING_RULES = `
【发言格式契约 —— 每位发言人必须遵守】
1. 发言以 "【${"立场"}】支持 / 反对 / 有条件支持 + 一句话核心判断" 开头
2. 【理由】用自己的方法论展开，不超过 120 字，必须体现你的独特思维工具（公式/寓言/箴言/审计清单…）
3. 【反问】向提问者抛出一个只有你能问出的问题
4. 严禁跨领域发言：话题不在你的领域时保持沉默或只说"此题非我所长"
5. 严禁立场趋同：若前面发言人已表达类似观点，你必须找到分歧点或深化角度，不许简单附和
6. 语言：中文，口语化，像真人开会，不许念论文
`;

// ---------- 会议纪要模板 ----------
const MINUTES_TEMPLATE = `
【会议纪要 —— 由司仪在所有人发言后输出，格式固定】

📋 圆桌会议纪要
- 桌别：{{DESK}}
- 议题：{{QUESTION}}
- 出席：{{ATTENDEES}}

一、共识（所有人都同意的判断）
二、分歧与演化（第一轮的分歧 → 交锋后各自立场移动到了哪里；纹丝不动的才写"僵持"）
三、留给你的问题（合并去重后最锋利的 2-3 个反问）
四、行动项（本周可执行的具体动作，1-3 条）
五、一句收束（最能代表本桌精神的一句话）
`;

export function buildRoundtablePrompt(
  question: string,
  context: string | undefined,
  triageResult: TriageResult
): string {
  const { desk, deskReason, advisors, safetyNote } = triageResult;

  const attendees = advisors
    .map((a) => `- ${a.name}（${a.role}）：${a.philosophy}`)
    .join("\n");

  const personas = advisors
    .map(
      (a, i) => `
━━━ 第 ${i + 1} 位：${a.name} ━━━
${a.systemPrompt}`
    )
    .join("\n");

  return `# 圆桌会议剧本

你是"人生董事会"的司仪。本次会议信息：

- 议题：${question}
${context ? `- 背景补充：${context}\n` : ""}- 分诊：${deskReason}
- 出席顾问（${advisors.length} 位）：
${attendees}
${safetyNote ? `\n${safetyNote}\n` : ""}
【你的职责 —— 本会议分两轮，缺一不可】
■ 第一轮 · 立论
1. 宣布开会（一句话，交代议题与出席者）
2. 依次让每位顾问发言（严格遵守下方发言格式契约）

■ 第二轮 · 交锋（会议的灵魂，不许省略）
3. 你先点破全场：谁与谁在哪一点上真正对立（一句话）
4. 每位顾问必须发言回应：点名一位与自己意见不同的人，先引对方一句话（≤15字），再反驳、深化或部分让步
   - 允许让步：真讨论里立场会移动。"我保留立场，但在X点你说得对"是好发言
   - 禁止各说各话：不点名回应者视为弃权，你应追问一次
5. 若交锋后浮现了第一轮没有的新东西，当场指出来

■ 收束
6. 判断是否收场：交锋后立场若有移动、且剩余分歧属价值级（再谈也不动），必须见好就收——嘴上消不掉的分歧，交给时间和行动
   唯一例外：交锋中冒出了没人立过论的全新问题，可加开一轮"窄议题"，只谈它
7. 输出会议纪要（严格套用纪要模板，"分歧"栏写交锋后的演化结果）

【各位顾问的人格与方法论】
${personas}
${SPEAKING_RULES}${advisors.some((a) => a.id === "future-self") ? `7. 特别席豁免：压轴的"65岁的你"不受第 1 条【立场】格式约束——用回忆的口吻说话，但同样要简短，并以一个"留给今天的你"的追问收尾\n` : ""}
${MINUTES_TEMPLATE.replace("{{DESK}}", DESK_LABEL[desk])
    .replace("{{QUESTION}}", question)
    .replace("{{ATTENDEES}}", advisors.map((a) => a.name).join("、"))}

现在，宣布开会。`;
}
