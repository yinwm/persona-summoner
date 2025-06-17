#!/bin/bash

# 创建发布包脚本
echo "🚀 创建 Persona MCP Server 发布包..."

# 清理并构建
rm -rf releases
mkdir -p releases
npm run build

# 创建各平台的发布包
echo "📦 创建发布包..."

# 创建通用包（包含源码和依赖）
mkdir -p releases/persona-mcp-server-universal
cp -r dist releases/persona-mcp-server-universal/
cp -r node_modules releases/persona-mcp-server-universal/
cp package.json releases/persona-mcp-server-universal/

# 创建启动脚本
cat > releases/persona-mcp-server-universal/start.sh << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$DIR/dist/server.js"
EOF

cat > releases/persona-mcp-server-universal/start.bat << 'EOF'
@echo off
cd /d "%~dp0"
node dist\server.js
EOF

chmod +x releases/persona-mcp-server-universal/start.sh

# 打包
cd releases
tar -czf persona-mcp-server-universal.tar.gz persona-mcp-server-universal/
zip -r persona-mcp-server-universal.zip persona-mcp-server-universal/

echo "✅ 发布包创建完成！"
echo "📁 releases/persona-mcp-server-universal.tar.gz (Linux/macOS)"
echo "📁 releases/persona-mcp-server-universal.zip (Windows)"