# 智囊团 MCP Server

> 20位顶级专家的方法论思维，随时为你所用

## 简介

智囊团 MCP Server 是一个基于 Claude MCP 协议的专家咨询系统，集成了国内外20位顶级技术领袖的思维方式和方法论。

## 参与专家

### 产品
- **张小龙** - 腾讯，微信产品经理，"产品之神"
- **俞军** - 百度→滴滴，用户价值公式

### 项目管理
- **Mike Cohn** - Mountain Goat Software，敏捷项目管理

### 架构
- **Martin Fowler** - ThoughtWorks，企业架构
- **Uncle Bob (Robert C. Martin)** - 独立，整洁架构

### 设计
- **Don Norman** - Apple→UCSD，UX之父
- **Steve Krug** - 独立，《Don't Make Me Think》

### 前端
- **Evan You (尤雨溪)** - Google→独立，Vue.js

### 后端
- **Linus Torvalds** - Linux Foundation，Linux/Git
- **Guido van Rossum** - Microsoft→Dropbox，Python

### 测试
- **James Bach** - 独立，探索性测试

### DevOps
- **Kelsey Hightower** - Google，Kubernetes

### 数据库
- **Michael Stonebraker** - MIT，图灵奖

### CTO
- **Werner Vogels** - Amazon，云计算架构
- **王坚** - 阿里巴巴，阿里云

### 安全
- **Bruce Schneier** - 独立，安全教父
- **吴翰清** - 阿里→绿盟，安全架构

### 数据
- **DJ Patil** - LinkedIn→白宫，首席数据科学家
- **周靖人** - 阿里巴巴，大数据架构

### 性能
- **Brendan Gregg** - Netflix→Sun，性能分析
- **杨涛** - 蚂蚁集团，Node.js性能

### 技术文档
- **阮一峰** - 独立，技术科普

## 工具

### 1. consult - 单角色咨询
向单个专家咨询问题，获取其专业视角的建议。

### 2. review - 多角色会诊
邀请多位专家从不同角度评审方案，提供综合建议。

### 3. brainstorm - 头脑风暴
多位专家从不同角度发散思考，产生创新想法。

### 4. critique - 设计评审
从多个维度批判性地审视方案，找出问题和改进点。

### 5. suggest - 场景建议
根据具体场景和约束条件，给出可执行的方案建议。

## 安装

```bash
cd wise-council-mcp
npm install
npm run build
```

## 配置 Claude Code

在 `~/.claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "wise-council": {
      "command": "node",
      "args": ["D:\\MyCodingProject\\wise-council-mcp\\dist\\index.js"]
    }
  }
}
```

## 使用示例

### 单角色咨询
```
请用consult工具咨询张小龙，关于如何设计一个社交产品的核心功能
```

### 多角色会诊
```
请用review工具评审我的微服务架构设计方案
```

### 头脑风暴
```
请用brainstorm工具，围绕"如何提升用户留存率"进行头脑风暴
```

### 设计评审
```
请用critique工具，从架构、安全性、性能三个维度评审我的系统设计
```

### 场景建议
```
请用suggest工具，我需要在3个月内上线一个MVP产品，团队5人，预算有限
```

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动
npm start
```

## License

MIT
