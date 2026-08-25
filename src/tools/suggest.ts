import { listAdvisorIds, getAdvisorById } from "../advisors/index.js";

export const suggestTool = {
  name: "suggest",
  description: "场景建议：根据具体场景和约束条件，给出可执行的方案建议。",
  inputSchema: {
    type: "object",
    properties: {
      scenario: {
        type: "string",
        description: "场景描述：要做什么、为什么做、给谁用",
      },
      constraints: {
        type: "string",
        description: "约束条件：时间、预算、技术栈、团队规模等",
      },
      advisors: {
        type: "array",
        items: {
          type: "string",
          enum: listAdvisorIds(),
        },
        description: `参与建议的专家（可选）。可选值：${listAdvisorIds().join(", ")}`,
      },
    },
    required: ["scenario"],
  },
};

export async function handleSuggest(args: {
  scenario: string;
  constraints?: string;
  advisors?: string[];
}): Promise<{ content: { type: "text"; text: string }[] }> {
  // 根据场景自动选择相关专家
  const selectedIds = args.advisors || selectAdvisorsForScenario(args.scenario);

  const selectedAdvisors = selectedIds
    .map((id) => getAdvisorById(id))
    .filter(Boolean);

  if (selectedAdvisors.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "没有找到有效的专家。请指定专家ID列表。",
        },
      ],
    };
  }

  const suggestions = selectedAdvisors.map((advisor) => {
    return `### 🎯 ${advisor!.name} (${advisor!.role} @ ${advisor!.company})

**核心理念：** ${advisor!.philosophy}

**专业视角：**
${advisor!.systemPrompt}

**场景分析任务：**
针对场景"${args.scenario}"${args.constraints ? `（约束条件：${args.constraints}）` : ""}，以${advisor!.name}的视角：

1. **问题诊断** - 这个场景的核心问题是什么？
2. **方案建议** - 你会怎么解决？给出2-3个具体方案
3. **实施步骤** - 你的方案需要哪些步骤？
4. **风险提示** - 这个方案的风险和注意事项
5. **资源需求** - 需要什么资源（人、钱、时间）

请给出具体、可执行的建议：`;
  });

  const result = `# 💼 场景建议报告

## 场景描述
${args.scenario}

${args.constraints ? `## 约束条件\n${args.constraints}\n` : ""}
## 参与专家
${selectedAdvisors.map((a) => `- **${a!.name}** (${a!.role} @ ${a!.company})`).join("\n")}

---

## 各专家建议

${suggestions.join("\n\n---\n\n")}

---

## 📋 综合建议

### 方案对比
| 方案 | 优点 | 缺点 | 适用场景 | 复杂度 |
|------|------|------|----------|--------|
| 方案1 | ... | ... | ... | ⭐⭐⭐ |
| 方案2 | ... | ... | ... | ⭐⭐ |
| 方案3 | ... | ... | ... | ⭐ |

### 推荐方案
综合考虑${args.constraints || "各方面因素"}，推荐方案X，原因：
1. ...
2. ...
3. ...

### 实施计划
**阶段一（第1周）：**
- [ ] 任务1
- [ ] 任务2

**阶段二（第2周）：**
- [ ] 任务3
- [ ] 任务4

**阶段三（第3周）：**
- [ ] 任务5
- [ ] 任务6

### 成功指标
- 指标1：...
- 指标2：...
- 指标3：...

### 风险与应对
| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 风险1 | 高 | 高 | ... |
| 风险2 | 中 | 中 | ... |`;

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}

// 根据场景自动选择专家
function selectAdvisorsForScenario(scenario: string): string[] {
  const text = scenario.toLowerCase();
  const selected: string[] = [];

  // 新项目
  if (
    text.includes("新项目") ||
    text.includes("从零开始") ||
    text.includes("创业")
  ) {
    selected.push("wernervogels", "wangjian", "mikecohn");
  }

  // 产品设计
  if (
    text.includes("产品") ||
    text.includes("app") ||
    text.includes("网站")
  ) {
    selected.push("zhangxiaolong", "yujun", "donnorman");
  }

  // 技术选型
  if (
    text.includes("技术选型") ||
    text.includes("框架") ||
    text.includes("架构")
  ) {
    selected.push("martinfowler", "unclebob");
  }

  // 性能问题
  if (
    text.includes("性能") ||
    text.includes("慢") ||
    text.includes("优化")
  ) {
    selected.push("brendangregg", "yangtao");
  }

  // 安全问题
  if (
    text.includes("安全") ||
    text.includes("漏洞") ||
    text.includes("隐私")
  ) {
    selected.push("bruceschneier", "wuhuanqing");
  }

  // 数据相关
  if (
    text.includes("数据") ||
    text.includes("分析") ||
    text.includes("报表")
  ) {
    selected.push("djpatil", "zhoujingren", "michaelstonebraker");
  }

  // 默认组合
  if (selected.length === 0) {
    selected.push("martinfowler", "zhangxiaolong", "unclebob", "donnorman");
  }

  return [...new Set(selected)].slice(0, 5);
}
