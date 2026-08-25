import { z } from "zod";
import { getAdvisorById, listAdvisorIds } from "../advisors/index.js";

export const consultTool = {
  name: "consult",
  description: "向智囊团中的单个专家咨询问题。选择一位专家，获取其专业视角的建议。",
  inputSchema: {
    type: "object",
    properties: {
      advisor: {
        type: "string",
        description: `专家ID，可选值：${listAdvisorIds().join(", ")}`,
        enum: listAdvisorIds(),
      },
      question: {
        type: "string",
        description: "要咨询的问题或需要分析的方案",
      },
      context: {
        type: "string",
        description: "项目上下文（可选）：项目类型、技术栈、团队规模等",
      },
    },
    required: ["advisor", "question"],
  },
};

export async function handleConsult(args: {
  advisor: string;
  question: string;
  context?: string;
}): Promise<{ content: { type: "text"; text: string }[] }> {
  const advisor = getAdvisorById(args.advisor);

  if (!advisor) {
    return {
      content: [
        {
          type: "text",
          text: `未找到专家：${args.advisor}。可用专家：${listAdvisorIds().join(", ")}`,
        },
      ],
    };
  }

  const systemPrompt = `${advisor.systemPrompt}

当前咨询信息：
- 专家：${advisor.name} (${advisor.nameEn})
- 角色：${advisor.role}
- 公司：${advisor.company}
- 专长：${advisor.expertise.join("、")}
- 核心理念：${advisor.philosophy}

${args.context ? `项目上下文：${args.context}` : ""}

请以${advisor.name}的视角和风格回答以下问题：
${args.question}`;

  return {
    content: [
      {
        type: "text",
        text: `## ${advisor.name} (${advisor.role} @ ${advisor.company})

> ${advisor.philosophy}

---

${systemPrompt}`,
      },
    ],
  };
}
