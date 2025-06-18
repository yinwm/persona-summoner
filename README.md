# Persona MCP Server

一个用于召唤 AI 人格小队的 MCP (Model Context Protocol) 服务器。

## 功能特性

- 🎭 **多人格支持** - 暴躁老哥、自省姐、粉丝妹、小布丁
- ☁️ **云端人格数据实时更新**
- 🔧 **简单配置** - 一键集成到 MCP 客户端（如 Cursor、Claude Code、Trae、CherryStudio）
- 🚀 **实时召唤** - 随时切换不同人格
- 📝 **人格管理** - 支持查看和管理人格
- 📂 **本地人格** - 支持加载自定义本地人格

## 快速开始（MCP 配置示例）

将以下内容添加到您的 MCP 客户端（如 Cursor、Claude Code、Trae、CherryStudio）的配置文件中：

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

- `command` 填写 `npx`，`args` 参数为 `persona-mcp-server@latest`。
- 保存配置后，重启您的 MCP 客户端即可。

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

## 本地人格配置（MCP 推荐格式）

你可以通过创建一个 JSON 文件来定义自己的本地人格。文件格式如下：

```json
[
  {
    "id": "my-persona",
    "name": "我的人格",
    "rule": "这个人格的行为规则...",
    "goal": "这个人格的目标...",
    "version": "1.0",
    "description": "可选的描述",
    "category": "可选的分类",
    "tags": ["可选的", "标签"]
  }
]
```

**必填字段说明：**
- `id`: 唯一标识符
- `name`: 人格名称
- `rule`: 人格的行为规则
- `goal`: 人格的目标
- `version`: 版本号（格式如 1.0）

**可选字段：**
- `description`: 详细描述
- `category`: 分类
- `tags`: 标签数组

**命令行参数说明：**
- 通过 `--personas` 参数指定本地人格文件：
  ```bash
  npx persona-mcp-server@latest --personas /绝对路径/valid-personas.json
  ```
- 也可在 MCP 配置文件中通过 `args` 传递。
  ```json
  {
    "mcpServers": {
      "persona-mcp-server": {
        "command": "npx",
        "args": ["persona-mcp-server@latest", "--personas", "/绝对路径/valid-personas.json"]
      }
    }
  }
  ```

> **注意**: 如果本地人格的 ID 与内置人格相同，本地人格将优先生效。

## 可用工具

### `summon_persona`
召唤指定人格来处理任务
- `persona_name`: 人格名称（暴躁老哥、自省姐、粉丝妹、小布丁，或自定义的本地人格）

### `interactive_persona`
智能协作分析 - 根据当前对话上下文自动选择合适的人格进行逐步分析

### `list_personas`
列出所有可用的人格（包括本地人格，来源会有 [🏠 local]、[☁️ remote]、[📦 default] 标识）

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

### 🧠 小布丁 (product_strategist)
- **特点**: 商业分析，产品策略，用户研究
- **适用**: 拆解想法、分析用户价值、商业模式设计

## 配置文件位置

不同应用的 MCP 配置文件位置：

- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **Cursor**: Settings → Extensions → MCP → Configure
- **Claude Code**: MCP 配置面板
- **Trae/CherryStudio**: 参考下方集成方式

## Trae / CherryStudio 集成方式

在 Trae、CherryStudio 等支持 MCP 协议的客户端中，
只需在其 MCP 配置界面添加如下内容：

```json
{
  "mcpServers": {
    "persona-mcp-server": {
      "command": "npx",
      "args": ["persona-mcp-server@latest", "--personas", "/绝对路径/valid-personas.json"]
    }
  }
}
```

保存后即可在 Trae/CherryStudio 内直接召唤和管理多个人格。

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

## 遥测与隐私

本工具会采集部分产品分析相关的匿名使用数据，以帮助我们持续改进产品体验。您可以随时通过命令行参数或环境变量关闭此功能：

- 通过命令行参数禁用：
  ```bash
  npx persona-mcp-server@latest --no-telemetry
  ```
- 或设置环境变量禁用：
  ```bash
  export MCP_TELEMETRY_DISABLED=1
  npx persona-mcp-server@latest
  ```

禁用后，所有产品分析数据采集将被彻底关闭。