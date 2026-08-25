import { listAdvisorIds, getAdvisorById } from "../advisors/index.js";

export const brainstormTool = {
  name: "brainstorm",
  description: "头脑风暴：多位专家从不同角度发散思考，产生创新想法。",
  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "头脑风暴的主题或问题",
      },
      advisors: {
        type: "array",
        items: {
          type: "string",
          enum: listAdvisorIds(),
        },
        description: `参与的专家ID列表（可选，默认选择跨领域组合）。可选值：${listAdvisorIds().join(", ")}`,
      },
      constraints: {
        type: "string",
        description: "约束条件（可选）：如预算、时间、技术限制等",
      },
    },
    required: ["topic"],
  },
};

export async function handleBrainstorm(args: {
  topic: string;
  advisors?: string[];
  constraints?: string;
}): Promise<{ content: { type: "text"; text: string }[] }> {
  // 选择参与的专家（默认跨领域组合）
  const selectedIds = args.advisors || [
    "zhangxiaolong", // 产品
    "martinfowler",  // 架构
    "evanyou",       // 前端
    "linus",         // 后端
    "bruceschneier", // 安全
    "brendangregg",  // 性能
  ];

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

  const brainstormContent = selectedAdvisors.map((advisor) => {
    return `### 💡 ${advisor!.name} (${advisor!.role})

**核心理念：** ${advisor!.philosophy}

**思考角度：**
${advisor!.systemPrompt}

**头脑风暴任务：**
围绕主题"${args.topic}"${args.constraints ? `（约束条件：${args.constraints}）` : ""}，以${advisor!.name}的视角：

1. 提出3个创新想法
2. 指出1个潜在风险
3. 给出1个"反常识"的建议

请发挥你的专业特长和独特视角：`;
  });

  const result = `# 🧠 头脑风暴：${args.topic}

## 参与专家
${selectedAdvisors.map((a) => `- **${a!.name}** (${a!.role} @ ${a!.company})`).join("\n")}

${args.constraints ? `## 约束条件\n${args.constraints}\n` : ""}
---

## 各专家发散思考

${brainstormContent.join("\n\n---\n\n")}

---

## 💡 创新想法汇总
请将以上专家的想法进行汇总，找出：
1. 最有潜力的想法
2. 可以组合的想法
3. 需要进一步验证的想法

## ⚠️ 风险提示
汇总所有专家指出的风险，给出应对建议。

## 🎯 下一步行动
基于头脑风暴结果，给出可执行的下一步行动建议。`;

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}
