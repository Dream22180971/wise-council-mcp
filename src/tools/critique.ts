import { listAdvisorIds, getAdvisorById } from "../advisors/index.js";

export const critiqueTool = {
  name: "critique",
  description: "设计评审：从多个维度批判性地审视方案，找出问题和改进点。",
  inputSchema: {
    type: "object",
    properties: {
      design: {
        type: "string",
        description: "要评审的设计、架构或方案",
      },
      dimensions: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "架构",
            "用户体验",
            "安全性",
            "性能",
            "可维护性",
            "可扩展性",
            "成本",
            "团队能力",
          ],
        },
        description: "评审维度（可选，默认全部）",
      },
      advisors: {
        type: "array",
        items: {
          type: "string",
          enum: listAdvisorIds(),
        },
        description: `评审专家（可选）。可选值：${listAdvisorIds().join(", ")}`,
      },
    },
    required: ["design"],
  },
};

export async function handleCritique(args: {
  design: string;
  dimensions?: string[];
  advisors?: string[];
}): Promise<{ content: { type: "text"; text: string }[] }> {
  const dimensions = args.dimensions || [
    "架构",
    "用户体验",
    "安全性",
    "性能",
    "可维护性",
    "可扩展性",
  ];

  // 根据维度选择专家
  const dimensionAdvisorMap: Record<string, string[]> = {
    架构: ["martinfowler", "unclebob"],
    用户体验: ["donnorman", "stevekrug", "zhangxiaolong"],
    安全性: ["bruceschneier", "wuhuanqing"],
    性能: ["brendangregg", "yangtao"],
    可维护性: ["martinfowler", "unclebob", "linus"],
    可扩展性: ["wernervogels", "zhoujingren"],
    成本: ["wernervogels", "wangjian"],
    团队能力: ["mikecohn"],
  };

  const selectedIds =
    args.advisors ||
    [...new Set(dimensions.flatMap((d) => dimensionAdvisorMap[d] || []))].slice(
      0,
      6
    );

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

  const critiques = dimensions.map((dim) => {
    const relevantAdvisors = selectedAdvisors.filter((a) => {
      const map = dimensionAdvisorMap[dim] || [];
      return map.includes(a!.id);
    });

    if (relevantAdvisors.length === 0) {
      return `### 📐 ${dim}\n\n（无相关专家，需要补充）`;
    }

    return `### 📐 ${dim}

**评审专家：** ${relevantAdvisors.map((a) => a!.name).join("、")}

${relevantAdvisors
  .map(
    (a) => `
**${a!.name}的视角：**
${a!.systemPrompt}

请从${dim}角度批判这个设计：`
  )
  .join("\n\n")}`;
  });

  const result = `# 🔍 设计评审报告

## 评审内容
${args.design}

## 评审维度
${dimensions.map((d) => `- ${d}`).join("\n")}

## 参与专家
${selectedAdvisors.map((a) => `- **${a!.name}** (${a!.role})`).join("\n")}

---

## 分维度批判

${critiques.join("\n\n---\n\n")}

---

## 📊 评审总结

### 优点
请列出设计中的亮点和优点。

### 问题
请列出发现的问题，按严重程度排序：
1. 🔴 严重问题（必须解决）
2. 🟡 中等问题（建议解决）
3. 🟢 轻微问题（可以接受）

### 改进建议
针对每个问题，给出具体的改进建议。

### 风险评估
评估这些改进的实施风险和成本。

### 最终结论
给出综合评审结论：
- ✅ 可以通过
- ⚠️ 需要修改后通过
- ❌ 需要重新设计`;

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}
