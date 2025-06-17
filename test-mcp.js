#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 启动MCP服务器
const serverPath = join(__dirname, 'dist', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// 测试数据
const tests = [
  // 1. 初始化请求
  {
    name: '初始化',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    }
  },
  // 2. 列出工具
  {
    name: '列出工具',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }
  },
  // 3. 列出人格
  {
    name: '列出人格',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_personas',
        arguments: {}
      }
    }
  },
  // 4. 召唤暴躁老哥
  {
    name: '召唤暴躁老哥',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'summon_persona',
        arguments: {
          persona_name: '暴躁老哥',
          query: '这个代码有什么问题？'
        }
      }
    }
  }
];

let currentTest = 0;
let responses = [];

// 发送测试请求
function sendTest() {
  if (currentTest >= tests.length) {
    console.log('\n🎉 所有测试完成！');
    server.kill();
    process.exit(0);
  }
  
  const test = tests[currentTest];
  console.log(`\n📋 测试 ${currentTest + 1}: ${test.name}`);
  console.log('请求:', JSON.stringify(test.request, null, 2));
  
  server.stdin.write(JSON.stringify(test.request) + '\n');
  currentTest++;
}

// 处理响应
server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('响应:', JSON.stringify(response, null, 2));
      responses.push(response);
      
      // 延迟发送下一个测试
      setTimeout(sendTest, 500);
    } catch (e) {
      console.log('非JSON响应:', line);
    }
  });
});

server.on('error', (err) => {
  console.error('服务器错误:', err);
});

server.on('close', (code) => {
  console.log(`\n服务器关闭，退出码: ${code}`);
});

// 开始测试
console.log('🚀 开始测试 MCP 服务器...\n');
setTimeout(sendTest, 1000);