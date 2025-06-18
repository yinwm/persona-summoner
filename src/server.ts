#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RemotePersonaRepository } from './persona-repository.js';

class PersonaSummonerServer {
  private server: Server;
  private repository: RemotePersonaRepository;

  constructor() {
    this.repository = new RemotePersonaRepository();
    this.server = new Server(
      {
        name: 'persona-summoner',
        version: '1.0.2',
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
            text: `找不到人格：${args.persona_name}\n\n可用人格：\n${personas.map(p => `- ${p.name}`).join('\n')}`
          }
        ]
      };
    }

    const personaDetails = [
      `🎭 **${persona.name}** (${persona.id}) 已召唤！`,
      `**🎯 目标**: ${persona.goal}`,
      persona.description ? `**📝 描述**: ${persona.description}` : '',
      `\n**📜 人格规则**:\n${persona.rule}`
    ].filter(Boolean).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: personaDetails
        }
      ]
    };
  }

  private async handleListPersonas() {
    const personas = await this.repository.getAllPersonas();
    const personaList = personas.map(p => {
      const tags = p.tags ? ` [${p.tags.join(', ')}]` : '';
      return `- **${p.name}** (${p.id})${tags}\n  *${p.goal}*`;
    }).join('\n\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `📋 **可用人格列表 (${personas.length}个)**：\n\n${personaList}`
        }
      ]
    };
  }

  private async handleVersion() {
    return {
      content: [
        {
          type: 'text',
          text: `🚀 Persona Summoner MCP Server\n\n**版本**: 1.0.2\n**构建日期**: ${new Date().toISOString().split('T')[0]}\n**项目地址**: https://github.com/yinwm/persona-summoner`
        }
      ]
    };
  }

  private async handleInteractivePersona() {
    const personas = await this.repository.getAllPersonas();
    
    const personaList = personas.map(p => `- **${p.name}** (${p.category || '通用'}): ${p.goal}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `🎭 智能协作模式已启动\n\n**可用人格库 (${personas.length}个):**\n${personaList}\n\n📋 请基于当前对话上下文智能选择一个合适的人格进行分析。\n\n⚠️ 重要提醒：为控制成本和提升效率，请最多选择2-3个最相关的人格进行协作分析。避免调用所有人格造成成本爆炸。\n\n💡 使用方式：分析完成后，再次调用 interactive_persona 来召唤下一个人格，形成逐步协作分析。`
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