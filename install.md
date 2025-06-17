# Persona Summoner 安装指南

## 🚀 一键安装（小白版）

### 通用安装方式（推荐）
1. 下载 `persona-summoner-universal.zip` (Windows) 或 `persona-summoner-universal.tar.gz` (macOS/Linux)
2. 解压到任意文件夹
3. 在 Trae AI 配置中添加：

**Windows 用户：**
```json
{
  "mcpServers": {
    "persona-summoner": {
      "command": "C:\\path\\to\\persona-summoner-universal\\start.bat"
    }
  }
}
```

**macOS/Linux 用户：**  
```json
{
  "mcpServers": {
    "persona-summoner": {
      "command": "/path/to/persona-summoner-universal/start.sh"
    }
  }
}
```

> **注意**：需要电脑上安装 Node.js (https://nodejs.org)，但这是很多开发者都有的基础环境。

## ✨ 使用方法

重启 Trae AI 后，你就可以：
- **召唤暴躁老哥**：严格审视和犀利批评
- **召唤自省姐**：深度思考和查漏补缺  
- **召唤粉丝妹**：发现亮点和放大优势

## 🎭 可用人格

| 人格 | 特点 | 适用场景 |
|------|------|----------|
| 暴躁老哥 | 犀利批评，框架外思维 | 代码审核，方案质疑 |
| 自省姐 | 深度思考，逻辑完整 | 分析问题，补充遗漏 |
| 粉丝妹 | 挖掘亮点，放大优势 | 创意鼓励，优势发现 |

**完全不需要安装 Node.js！** 🎉