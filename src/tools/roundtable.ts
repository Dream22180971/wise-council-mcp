import { z } from "zod";
import { triage, buildRoundtablePrompt, type Desk } from "../moderator/index.js";

export const roundtableTool = {
  name: "roundtable",
  description:
    "召开圆桌会议：司仪自动分诊（白天桌=事业/技术决策，夜晚桌=人生探讨），点名 3-5 位相关顾问按发言契约轮流发言，最后输出统一格式的会议纪要。用户无需手动挑选专家。",
  inputSchema: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "要提交董事会讨论的问题（事业、技术、产品或人生议题均可）",
      },
      context: {
        type: "string",
        description: "背景补充（可选）：你的处境、已尝试的方案、限制条件等",
      },
      desk: {
        type: "string",
        enum: ["day", "night"],
        description:
          "手动指定桌别（可选）：day=白天的董事会（事业之桌），night=夜晚的董事会（人生之桌）。不填则由司仪自动分诊",
      },
    },
    required: ["question"],
  },
};

export async function handleRoundtable(args: {
  question: string;
  context?: string;
  desk?: string;
}): Promise<{ content: { type: "text"; text: string }[] }> {
  const forceDesk: Desk | undefined =
    args.desk === "day" ? "day" : args.desk === "night" ? "night" : undefined;

  const result = triage(args.question, forceDesk);
  const prompt = buildRoundtablePrompt(args.question, args.context, result);

  return {
    content: [
      {
        type: "text",
        text: prompt,
      },
    ],
  };
}
