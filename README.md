# Persona Summoner MCP Server

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

```json
{
  "mcpServers": {
    "persona-summoner": {
      "command": "node",
      "args": ["./dist/server.js"],
      "env": {}
    }
  }
}
```

## 可用工具

### `summon_persona`
召唤指定人格来处理任务
- `persona_name`: 人格名称（暴躁老哥、自省姐、粉丝妹）
- `query`: 需要处理的问题

### `list_personas`
列出所有可用的人格

### `get_persona`
获取指定人格的详细信息
- `persona_id`: 人格ID

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