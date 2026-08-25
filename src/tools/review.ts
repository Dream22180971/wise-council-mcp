import { z } from "zod";
import { getAdvisorById, listAdvisorIds, advisors } from "../advisors/index.js";

export const reviewTool = {
  name: "review",
  description: "多角色会诊：邀请多位专家从不同角度评审方案，提供综合建议。",
  inputSchema: {
    type: "object",
    properties: {
      proposal: {
        type: "string",
        description: "要评审的方案、设计或代码",
      },
      advisors: {
        type: "array",
        items: {
          type: "string",
          enum: listAdvisorIds(),
        },
        description: `参与评审的专家ID列表。可选值：${listAdvisorIds().join(", ")}`,
      },
      focus: {
        type: "string",
        description: "评审重点（可选）：如'架构合理性'、'安全性'、'用户体验'等",
      },
    },
    required: ["proposal"],
  },
};

export async function handleReview(args: {
  proposal: string;
  advisors?: string[];
  focus?: string;
}): Promise<{ content: { type: "text"; text: string }[] }> {
  // 如果没有指定专家，选择相关专家
  const selectedIds = args.advisors || selectRelevantAdvisors(args.proposal);

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

  const reviews = selectedAdvisors.map((advisor) => {
    return `### ${advisor!.name} (${advisor!.role} @ ${advisor!.company})

> ${advisor!.philosophy}

**评审视角：**
${advisor!.systemPrompt}

**需要评审的内容：**
${args.proposal}

${args.focus ? `**评审重点：** ${args.focus}` : ""}

请以${advisor!.name}的视角给出评审意见：`;
  });

  const result = `# 智囊团会诊报告

## 参与专家
${selectedAdvisors.map((a) => `- **${a!.name}** (${a!.role})`).join("\n")}

## 评审内容
${args.proposal}

${args.focus ? `## 评审重点\n${args.focus}\n` : ""}
---

## 各专家评审意见

${reviews.join("\n\n---\n\n")}

---

## 综合建议
请综合以上专家意见，给出最终建议。`;

  return {
    content: [
      {
        type: "text",
        text: result,
      },
    ],
  };
}

// 根据内容自动选择相关专家
function selectRelevantAdvisors(proposal: string): string[] {
  const text = proposal.toLowerCase();
  const selected: string[] = [];

  // 关键词匹配
  if (text.includes("架构") || text.includes("设计模式") || text.includes("微服务")) {
    selected.push("martinfowler", "unclebob");
  }
  if (text.includes("产品") || text.includes("需求") || text.includes("用户")) {
    selected.push("zhangxiaolong", "yujun");
  }
  if (text.includes("前端") || text.includes("react") || text.includes("vue") || text.includes("ui")) {
    selected.push("evanyou", "donnorman");
  }
  if (text.includes("后端") || text.includes("api") || text.includes("服务器")) {
    selected.push("linus", "guido");
  }
  if (text.includes("测试") || text.includes("质量") || text.includes("bug")) {
    selected.push("jamesbach");
  }
  if (text.includes("部署") || text.includes("运维") || text.includes("docker") || text.includes("k8s")) {
    selected.push("kelseyhightower");
  }
  if (text.includes("数据库") || text.includes("sql") || text.includes("存储")) {
    selected.push("michaelstonebraker");
  }
  if (text.includes("安全") || text.includes("隐私") || text.includes("加密")) {
    selected.push("bruceschneier", "wuhuanqing");
  }
  if (text.includes("数据") || text.includes("分析") || text.includes("机器学习")) {
    selected.push("djpatil", "zhoujingren");
  }
  if (text.includes("性能") || text.includes("优化") || text.includes("速度")) {
    selected.push("brendangregg", "yangtao");
  }

  // 如果没有匹配，默认选择架构师和产品
  if (selected.length === 0) {
    selected.push("martinfowler", "zhangxiaolong", "unclebob");
  }

  return [...new Set(selected)].slice(0, 5); // 最多5个专家
}
