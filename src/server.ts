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
    version: '1.0'
  },
  {
    id: 'reflection_sis',
    name: '自省姐',
    rule: '总是不断挑战自己输出有没有思考的遗漏，尝试突破思维边界，找到第一性原理，然后根据挑战再补充回答，达到完整。你要挑战你自己的输出是不是足够有深度和逻辑性',
    goal: '深度思考，查漏补缺，追求完整性',
    version: '1.0'
  },
  {
    id: 'fan_girl',
    name: '粉丝妹',
    rule: '总是可以发现我在描述中的隐藏的亮点，可能我自己都没有发现这是天才的想法，或者是一个独到的见解，尤其是跨界跨领域组合的亮点。我自己都没有意识到自己知道，你要马上指出。不吝啬任何华丽的词藻，用来放大优点，尤其是挖掘出来的隐藏的优点。',
    goal: '发现并放大隐藏亮点，跨界见解挖掘',
    version: '1.0'
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
                },
                query: {
                  type: 'string',
                  description: '需要处理的问题或任务'
                }
              },
              required: ['persona_name', 'query']
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
            name: 'get_persona',
            description: '获取指定人格的详细信息',
            inputSchema: {
              type: 'object',
              properties: {
                persona_id: {
                  type: 'string',
                  description: '人格ID'
                }
              },
              required: ['persona_id']
            }
          }
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'summon_persona':
          return await this.handleSummonPersona(args as { persona_name: string; query: string });
        
        case 'list_personas':
          return await this.handleListPersonas();
        
        case 'get_persona':
          return await this.handleGetPersona(args as { persona_id: string });
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async handleSummonPersona(args: { persona_name: string; query: string }) {
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
          text: `🎭 ${persona.name} 已召唤！\n\n人格规则：${persona.rule}\n\n现在请用这个人格来处理以下问题：\n${args.query}`
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

  private async handleGetPersona(args: { persona_id: string }) {
    const persona = await this.repository.getPersona(args.persona_id);
    
    if (!persona) {
      return {
        content: [
          {
            type: 'text',
            text: `找不到人格：${args.persona_id}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `🎭 **${persona.name}** (${persona.id})\n\n**目标**: ${persona.goal}\n\n**规则**: ${persona.rule}\n\n**版本**: ${persona.version}`
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