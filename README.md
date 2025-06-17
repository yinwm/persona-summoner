# Persona MCP Server

一个用于召唤不同 AI 人格的 MCP (Model Context Protocol) 服务器。

## 功能特性

- 🎭 **多人格支持** - 暴躁老哥、自省姐、粉丝妹
- 🔧 **简单配置** - 一键安装使用
- 🚀 **实时召唤** - 随时切换不同人格
- 📝 **人格管理** - 支持查看和管理人格

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 构建项目
```bash
npm run build
```

### 3. 配置 Claude/Cursor
将以下配置添加到你的 MCP 配置文件中：

**方式1：使用npx（推荐）**
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

**方式2：本地编译**
```json
{
  "mcpServers": {
    "persona-mcp-server": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": {}
    }
  }
}
```

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
人格团队讨论一下技术选型问题
多角度分析这个商业模式
```

**协作模式工作流程：**
1. 调用 `interactive_persona()` 启动协作模式
2. 系统根据上下文智能选择第一个人格进行分析
3. 分析完成后，再次调用 `interactive_persona()` 自动召唤下一个合适的人格
4. 重复直到所有相关人格完成协作分析

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

## 开发

```bash
# 开发模式运行
npm run dev

# 构建
npm run build

# 生产运行
npm start
```