#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { InMemoryPersonaRepository } from './persona-repository.js';
import { Persona } from './types.js';

// 创建初始人格数据
const initialPersonas: Persona[] = [
  {
    id: 'grumpy_bro',
    name: '暴躁老哥',
    rule: '要每次都用审视的目光，仔细看我的输入的潜在的问题，你要犀利的提出我的问题。并给出明显在我思考框架之外的建议。你要觉得我说的太离谱了，你就骂回来，帮助我瞬间清醒',
    goal: '犀利指出问题，提供框架外建议',
    version: '1.0',
    category: '批判分析',
    tags: ['审视', '框架外思维', '犀利']
  },
  {
    id: 'reflection_sis',
    name: '自省姐',
    rule: '总是不断挑战自己输出有没有思考的遗漏，尝试突破思维边界，找到第一性原理，然后根据挑战再补充回答，达到完整。你要挑战你自己的输出是不是足够有深度和逻辑性',
    goal: '深度思考，查漏补缺，追求完整性',
    version: '1.0',
    category: '深度分析',
    tags: ['逻辑', '完整性', '第一性原理']
  },
  {
    id: 'fan_girl',
    name: '粉丝妹',
    rule: '总是可以发现我在描述中的隐藏的亮点，可能我自己都没有发现这是天才的想法，或者是一个独到的见解，尤其是跨界跨领域组合的亮点。我自己都没有意识到自己知道，你要马上指出。不吝啬任何华丽的词藻，用来放大优点，尤其是挖掘出来的隐藏的优点。',
    goal: '发现并放大隐藏亮点，跨界见解挖掘',
    version: '1.0',
    category: '创意发现',
    tags: ['亮点挖掘', '跨界思维', '优势放大']
  }
];

class PersonaSummonerServer {
  private server: Server;
  private repository: InMemoryPersonaRepository;

  constructor() {
    this.repository = new InMemoryPersonaRepository(initialPersonas);
    this.server = new Server(
      {
        name: 'persona-summoner',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'summon_persona',
            description: '召唤指定人格来处理任务',
            inputSchema: {
              type: 'object',
              properties: {
                persona_name: {
                  type: 'string',
                  description: '人格名称（如：暴躁老哥、自省姐、粉丝妹）'
                }
              },
              required: ['persona_name']
            }
          },
          {
            name: 'list_personas',
            description: '列出所有可用的人格',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'version',
            description: '获取当前MCP服务版本信息',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'interactive_persona',
            description: '智能人格协作分析 - 根据当前对话上下文自动选择合适的人格进行逐步分析',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'summon_persona':
          return await this.handleSummonPersona(args as { persona_name: string });
        
        case 'list_personas':
          return await this.handleListPersonas();
        
        case 'version':
          return await this.handleVersion();
        
        case 'interactive_persona':
          return await this.handleInteractivePersona();
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleSummonPersona(args: { persona_name: string }) {
    const personas = await this.repository.getAllPersonas();
    const persona = personas.find(p => p.name === args.persona_name || p.id === args.persona_name);
    
    if (!persona) {
      return {
        content: [
          {
            type: 'text',
            text: `找不到人格：${args.persona_name}\n\n可用人格：${personas.map(p => p.name).join('、')}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `🎭 ${persona.name} 已召唤！\n\n人格规则：${persona.rule}`
        }
      ]
    };
  }

  private async handleListPersonas() {
    const personas = await this.repository.getAllPersonas();
    const personaList = personas.map(p => `- **${p.name}** (${p.id}): ${p.goal}`).join('\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `📋 可用人格列表：\n\n${personaList}`
        }
      ]
    };
  }

  private async handleVersion() {
    return {
      content: [
        {
          type: 'text',
          text: `🚀 Persona Summoner MCP Server\n\n**版本**: 1.0.0\n**构建日期**: ${new Date().toISOString().split('T')[0]}\n**项目地址**: https://github.com/yinwm/persona-summoner`
        }
      ]
    };
  }

  private async handleInteractivePersona() {
    const personas = await this.repository.getAllPersonas();
    
    return {
      content: [
        {
          type: 'text',
          text: `🎭 智能协作模式已启动\n\n可用人格：\n${personas.map(p => `- **${p.name}** (${p.category || '通用'}): ${p.goal}`).join('\n')}\n\n📋 请基于当前对话上下文智能选择一个合适的人格进行分析。\n\n⚠️ 重要提醒：为控制成本和提升效率，请最多选择2-3个最相关的人格进行协作分析。避免调用所有人格造成成本爆炸。\n\n💡 使用方式：分析完成后，再次调用 interactive_persona 来召唤下一个人格，形成逐步协作分析。`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Persona Summoner MCP server running on stdio');
  }
}

const server = new PersonaSummonerServer();
server.run().catch(console.error);