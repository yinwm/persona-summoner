# Persona MCP Server

一个用于召唤 AI 人格小队的 MCP (Model Context Protocol) 服务器。

## 功能特性

- 🎭 **多人格支持** - 暴躁老哥、自省姐、粉丝妹
- 🔧 **简单配置** - 一键安装使用
- 🚀 **实时召唤** - 随时切换不同人格
- 📝 **人格管理** - 支持查看和管理人格

## 快速开始

### 1. 配置 Claude/Cursor/Claude Code
将以下配置添加到你的 MCP 配置文件中：

```json
{
  "mcpServers": {
    "persona-mcp-server": {
      "command": "npx",
      "args": ["persona-mcp-server@latest"]
    }
  }
}
```

### 2. 重启应用
重启 Claude/Cursor/Claude Code 让配置生效。

### 3. 开始使用
现在你可以直接在对话中使用人格召唤功能了！

## 使用方法

支持两种使用模式：

### 模式1：单一人格模式
直接召唤指定人格进行分析：

```
让暴躁老哥分析我的代码问题
召唤自省姐深度思考这个架构设计
```

### 模式2：智能协作模式  
自动进行多人格逐步协作分析：

```
帮我安排人格分析这个SaaS产品想法
人格小队讨论一下技术选型问题
多角度分析这个商业模式
```

**协作模式工作流程：**
1. 你说："帮我安排人格分析这个项目想法"
2. MCP Client 会智能选择第一个合适的人格进行分析
3. 分析完成后，你可以继续说："再找下一个人格分析"
4. 重复直到所有相关人格完成协作分析

**💡 成本控制提醒：** 系统会建议最多选择2-3个最相关的人格，避免调用过多人格造成 token 消耗过大。

## 可用工具

### `summon_persona`
召唤指定人格来处理任务
- `persona_name`: 人格名称（暴躁老哥、自省姐、粉丝妹）

### `interactive_persona`
智能协作分析 - 根据当前对话上下文自动选择合适的人格进行逐步分析

### `list_personas`
列出所有可用的人格

### `version`
获取当前MCP服务版本信息

## 内置人格

### 🔥 暴躁老哥 (grumpy_bro)
- **特点**: 犀利批评，框架外思维
- **适用**: 需要严格审视、发现问题

### 🤔 自省姐 (reflection_sis)  
- **特点**: 深度思考，查漏补缺
- **适用**: 需要完整分析、逻辑验证

### ✨ 粉丝妹 (fan_girl)
- **特点**: 发现亮点，放大优势
- **适用**: 需要鼓励、挖掘创意

## 配置文件位置

不同应用的 MCP 配置文件位置：

- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **Cursor**: Settings → Extensions → MCP → Configure
- **Claude Code**: MCP 配置面板

## 本地开发

如果想要本地开发或自定义：

```bash
# 克隆项目
git clone https://github.com/yinwm/persona-summoner.git
cd persona-summoner

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 链接

- 📦 [NPM 包](https://www.npmjs.com/package/persona-mcp-server)
- 🔗 [GitHub 仓库](https://github.com/yinwm/persona-summoner)
- 📖 [MCP 协议文档](https://modelcontextprotocol.io/)