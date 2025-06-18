#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RemotePersonaRepository } from './persona-repository.js';
import { Command } from 'commander';
import fs from 'fs/promises';
import { Persona } from './types.js';

class PersonaSummonerServer {
  private server: Server;
  private repository: RemotePersonaRepository;

  constructor(localPersonas: Persona[] = []) {
    this.repository = new RemotePersonaRepository(localPersonas);
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

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

function validatePersona(persona: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // 必填字段检查
  const requiredFields = ['id', 'name', 'rule', 'goal', 'version'] as const;
  for (const field of requiredFields) {
    if (!(field in persona)) {
      errors.push({ field, message: `缺少必填字段: ${field}` });
      continue;
    }

    // 字段类型和值检查
    switch (field) {
      case 'id':
        if (typeof persona.id !== 'string' || persona.id.trim().length === 0) {
          errors.push({ field, message: 'id 必须是非空字符串' });
        } else if (!/^[a-z0-9-_]+$/.test(persona.id)) {
          errors.push({ field, message: 'id 只能包含小写字母、数字、下划线和连字符' });
        }
        break;
      case 'name':
        if (typeof persona.name !== 'string' || persona.name.trim().length === 0) {
          errors.push({ field, message: 'name 必须是非空字符串' });
        }
        break;
      case 'rule':
      case 'goal':
        if (typeof persona[field] !== 'string' || persona[field].trim().length === 0) {
          errors.push({ field, message: `${field} 必须是非空字符串` });
        }
        break;
      case 'version':
        if (typeof persona.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(persona.version)) {
          errors.push({ field, message: 'version 必须是有效的语义化版本号（如：1.0.0）' });
        }
        break;
    }
  }

  // 可选字段类型检查
  if ('description' in persona && (typeof persona.description !== 'string' || persona.description.trim().length === 0)) {
    errors.push({ field: 'description', message: 'description 如果提供，必须是非空字符串' });
  }

  if ('category' in persona && (typeof persona.category !== 'string' || persona.category.trim().length === 0)) {
    errors.push({ field: 'category', message: 'category 如果提供，必须是非空字符串' });
  }

  if ('tags' in persona) {
    if (!Array.isArray(persona.tags)) {
      errors.push({ field: 'tags', message: 'tags 必须是字符串数组' });
    } else if (!persona.tags.every((tag: unknown) => typeof tag === 'string' && tag.trim().length > 0)) {
      errors.push({ field: 'tags', message: 'tags 数组中的每个元素都必须是非空字符串' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

interface PersonaLoadResult {
  persona: any;
  success: boolean;
  errors?: ValidationError[];
  warnings?: string[];
}

function checkDuplicates(personas: Persona[]): { idMap: Map<string, PersonaLoadResult>, warnings: string[] } {
  const result = {
    idMap: new Map<string, PersonaLoadResult>(),
    warnings: [] as string[]
  };

  // 检查名称重复（作为警告）
  const nameMap = new Map<string, Persona>();
  
  personas.forEach((persona, index) => {
    const validationResult = validatePersona(persona);
    const loadResult: PersonaLoadResult = {
      persona,
      success: validationResult.isValid,
      errors: validationResult.errors
    };

    // 检查 ID 重复
    if (validationResult.isValid) {
      if (result.idMap.has(persona.id)) {
        // 如果 ID 重复，将当前和已存在的都标记为失败
        const existing = result.idMap.get(persona.id)!;
        existing.success = false;
        existing.errors = [{ field: 'id', message: `ID '${persona.id}' 与人格 '${persona.name}' 重复` }];
        loadResult.success = false;
        loadResult.errors = [{ field: 'id', message: `ID '${persona.id}' 与人格 '${existing.persona.name}' 重复` }];
      }
    }
    
    result.idMap.set(persona.id, loadResult);

    // 检查名称重复（作为警告）
    if (nameMap.has(persona.name)) {
      result.warnings.push(`警告：发现重复的人格名称: ${persona.name}（${persona.id} 与 ${nameMap.get(persona.name)?.id}）`);
    }
    nameMap.set(persona.name, persona);
  });

  return result;
}

async function loadLocalPersonas(filePath: string): Promise<Persona[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let data: any;

    try {
      data = JSON.parse(content);
    } catch (error) {
      throw new Error(`本地人格文件 JSON 格式错误: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (!Array.isArray(data)) {
      throw new Error('本地人格文件必须包含一个数组');
    }

    if (data.length === 0) {
      throw new Error('本地人格文件不能为空数组');
    }

    // 验证并收集加载结果
    const { idMap, warnings } = checkDuplicates(data);
    
    // 输出警告信息
    warnings.forEach(warning => console.warn(warning));

    // 统计加载结果
    let successCount = 0;
    let failureCount = 0;
    const loadedPersonas: Persona[] = [];

    console.log('\n本地人格加载结果:');
    for (const [id, result] of idMap.entries()) {
      if (result.success) {
        successCount++;
        loadedPersonas.push(result.persona);
        console.log(`✅ ${result.persona.name} (${id}): 加载成功`);
      } else {
        failureCount++;
        const errorMessages = result.errors!.map(e => `${e.field}: ${e.message}`).join(', ');
        console.log(`❌ ${result.persona.name} (${id}): 加载失败\n   原因: ${errorMessages}`);
      }
    }

    console.log(`\n加载统计: 成功 ${successCount} 个, 失败 ${failureCount} 个\n`);

    if (successCount === 0) {
      throw new Error('没有任何人格加载成功，服务启动失败。');
    }

    return loadedPersonas;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(`找不到指定的本地人格文件: ${filePath}`);
      }
      throw error;
    }
    throw new Error(`读取本地人格文件时发生未知错误: ${String(error)}`);
  }
}

async function main() {
  const program = new Command();

  program
    .name('persona-summoner')
    .description('人格召唤器 - MCP 服务')
    .version('1.0.2')
    .option('--personas <file>', '指定本地人格文件路径');

  program.parse();

  const options = program.opts();
  let localPersonas: Persona[] = [];

  if (options.personas) {
    try {
      console.error(`正在加载本地人格文件: ${options.personas}`);
      localPersonas = await loadLocalPersonas(options.personas);
      console.error(`成功加载 ${localPersonas.length} 个本地人格`);
    } catch (error) {
      console.error(`加载本地人格文件失败: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  const server = new PersonaSummonerServer(localPersonas);
  server.run().catch(console.error);
}

main().catch(console.error);