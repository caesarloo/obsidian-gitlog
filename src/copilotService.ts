import { App, Notice } from 'obsidian';

const DEBUG_LOG = false;

function debugLog(...args: unknown[]) {
  if (!DEBUG_LOG) {
    return;
  }
  console.log(...args);
}

// Add log function for consistency
function log(message: string) {
  if (!DEBUG_LOG) {
    return;
  }
  console.log(`[GitLog-Copilot] ${message}`);
  const globalConsole = (globalThis as { console?: { log: (...args: unknown[]) => void } }).console;
  if (globalConsole) {
    globalConsole.log(`[GitLog-Copilot] ${message}`);
  }
}

// Log immediately when the module is loaded
log('CopilotService module loaded');

export class CopilotService {
  private app: App;

  constructor(app: App) {
    this.app = app;
    log('CopilotService instance created');
  }

  /**
   * Check if Copilot plugin is available
   */
  isCopilotAvailable(): boolean {
    log('=== Checking Copilot plugin availability ===');
    debugLog('Direct console.log - Checking Copilot plugin availability');
    
    // Try multiple possible plugin IDs, prioritize lowercase 'copilot' based on console output
    const possibleIds = ['copilot', 'Copilot', 'obsidian-copilot'];
    
    // Print all installed plugins for debugging
    log(`Checking plugins with IDs: ${JSON.stringify(possibleIds)}`);
    debugLog('Direct console.log - Checking plugins with IDs:', possibleIds);
    
    try {
      // Check if plugins object exists
      const pluginsObj = (this.app as any).plugins;
      log(`Plugins object exists: ${!!pluginsObj}`);
      debugLog('Direct console.log - Plugins object exists:', !!pluginsObj);
      
      if (pluginsObj) {
        // Try different ways to get installed plugins
        const allPlugins = Object.keys(pluginsObj.plugins || pluginsObj.enabledPlugins || {});
        log(`All installed plugins: ${JSON.stringify(allPlugins)}`);
        debugLog('Direct console.log - All installed plugins:', allPlugins);
        
        // Try different methods to get plugin
        for (const id of possibleIds) {
          log(`Checking for plugin with ID: ${id}`);
          debugLog('Direct console.log - Checking for plugin with ID:', id);
          
          // Try getPlugin method
          const copilotPlugin1 = pluginsObj.getPlugin ? pluginsObj.getPlugin(id) : null;
          log(`  Using getPlugin(): ${!!copilotPlugin1}`);
          debugLog('Direct console.log - Using getPlugin():', !!copilotPlugin1);
          
          // Try direct access
          const copilotPlugin2 = pluginsObj.plugins ? pluginsObj.plugins[id] : null;
          log(`  Direct access to plugins['${id}']: ${!!copilotPlugin2}`);
          debugLog('Direct console.log - Direct access to plugins[', id, ']:', !!copilotPlugin2);
          
          if (copilotPlugin1 || copilotPlugin2) {
            log(`Found Copilot plugin with ID: ${id}`);
            debugLog('Direct console.log - Found Copilot plugin with ID:', id);
            return true;
          }
        }
      } else {
        log('Plugins object is null or undefined');
        debugLog('Direct console.log - Plugins object is null or undefined');
      }
    } catch (error) {
      log(`Error checking Copilot plugin: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Direct console.error - Error checking Copilot plugin:', error);
    }
    
    log('=== Copilot plugin not found ===');
    debugLog('Direct console.log - Copilot plugin not found');
    return false;
  }

  /**
   * Generate commit log using Copilot AI
   */
  async generateCommitLog(changes: Array<{ filePath: string; changeType: string; diff: string }>, language: 'zh' | 'en', strategy: 'detailed' | 'simple'): Promise<string> {
    try {
      // Try multiple possible plugin IDs, prioritize lowercase 'copilot' based on console output
      const possibleIds = ['copilot', 'Copilot', 'obsidian-copilot'];
      let copilotPlugin = null;
      
      for (const id of possibleIds) {
        copilotPlugin = (this.app as any).plugins.getPlugin(id);
        if (copilotPlugin) {
          debugLog(`Found Copilot plugin with ID: ${id}`);
          break;
        }
      }
      
      if (!copilotPlugin) {
        throw new Error('Copilot plugin is not installed or enabled');
      }

      // Prepare comprehensive prompt for Copilot to generate summary
      const summaryPrompt = this.buildSummaryPrompt(changes, language, strategy);
      debugLog('Generated summary prompt for Copilot:', summaryPrompt);

      // Try to use actual Copilot API to generate comprehensive summary
      try {
        // Check if copilotPlugin has a chat or generate method
        if (copilotPlugin.chat || copilotPlugin.generate || copilotPlugin.complete) {
          debugLog('Using actual Copilot API for summary generation');
          let response;
          
          if (copilotPlugin.chat) {
            response = await copilotPlugin.chat(summaryPrompt);
          } else if (copilotPlugin.generate) {
            response = await copilotPlugin.generate(summaryPrompt);
          } else if (copilotPlugin.complete) {
            response = await copilotPlugin.complete(summaryPrompt);
          }
          
          debugLog('Copilot API response:', response);
          if (response && typeof response === 'string' && response.trim()) {
            return response.trim();
          }
        } 
        // Check if copilotPlugin has other API methods
        else {
          debugLog('Copilot plugin API methods:', Object.keys(copilotPlugin));
        }
      } catch (apiError) {
        console.warn('Error using Copilot API, falling back to enhanced mock response:', apiError);
      }

      // Fallback to enhanced mock response with comprehensive summary
      debugLog('Using enhanced mock response with comprehensive summary');
      const generatedLog = await this.generateComprehensiveSummary(changes, language, strategy);
      debugLog('Generated comprehensive summary:', generatedLog);

      return generatedLog;
    } catch (error) {
      console.error('Error generating commit log:', error);
      new Notice('Failed to generate commit log: ' + (error instanceof Error ? error.message : String(error)));
      return '';
    }
  }

  /**
   * Build comprehensive summary prompt for Copilot
   */
  private buildSummaryPrompt(changes: Array<{ filePath: string; changeType: string; diff: string }>, language: 'zh' | 'en', strategy: 'detailed' | 'simple'): string {
    const fileChanges = changes.map(change => {
      const diffSummary = this.extractDiffSummary(change.diff, language);
      return `File: ${change.filePath}
Type: ${change.changeType}
${diffSummary ? `Changes: ${diffSummary}` : ''}`;
    }).join('\n\n');

    const languagePrompt = language === 'zh' ? '中文' : 'English';
    const strategyPrompt = strategy === 'detailed' ? '详细' : '简洁';

    if (language === 'zh') {
      return `请根据以下Git文件变更，生成一个${strategyPrompt}的${languagePrompt}提交日志总结：

${fileChanges}

要求：
1. 不要简单列出修改了哪些文件，而是总结出整体的变更内容和目的
2. 分析变更的类型和影响，提供有意义的摘要
3. 遵循Git提交规范，使用清晰的格式
4. ${strategy === 'detailed' ? '提供详细的变更说明，包括主要修改的内容' : '保持简洁明了，突出重点变更'}
5. 使用专业、客观的语言`;
    } else {
      return `Please generate a ${strategyPrompt} ${languagePrompt} commit log summary based on the following Git file changes:

${fileChanges}

Requirements:
1. Don't simply list which files were modified, but summarize the overall changes and purpose
2. Analyze the types and impact of changes, providing meaningful insights
3. Follow Git commit conventions with clear formatting
4. ${strategy === 'detailed' ? 'Provide detailed change descriptions, including main modified content' : 'Keep it concise and highlight key changes'}
5. Use professional, objective language`;
    }
  }

  /**
   * Generate comprehensive summary based on changes
   */
  private async generateComprehensiveSummary(changes: Array<{ filePath: string; changeType: string; diff: string }>, language: 'zh' | 'en', strategy: 'detailed' | 'simple'): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Group changes by type
    const addedFiles = changes.filter(change => change.changeType === 'added');
    const modifiedFiles = changes.filter(change => change.changeType === 'modified');
    const deletedFiles = changes.filter(change => change.changeType === 'deleted');
    const changeDescriptions = changes.map(change => this.describeChange(change, language));
    const uniqueThemes = Array.from(new Set(changeDescriptions.map(item => item.theme)));
    
    // Build summary
    const totalChanges = changes.length;
    
    // Generate comprehensive description
    let description = '';
    
    if (language === 'zh') {
      if (totalChanges === 1) {
        description = changeDescriptions[0].detail;
      } else {
        const operationSummary = this.buildOperationSummary(addedFiles.length, modifiedFiles.length, deletedFiles.length, language);
        const themePreview = uniqueThemes.slice(0, 3).join('、');
        description = `本次变更涉及 ${totalChanges} 个文件，${operationSummary}`;
        if (themePreview) {
          description += `，主要内容包括：${themePreview}${uniqueThemes.length > 3 ? ' 等' : ''}`;
        }

        if (strategy === 'detailed') {
          const keyItems = changeDescriptions.slice(0, 6).map(item => `- ${item.detail}`);
          if (changeDescriptions.length > 6) {
            keyItems.push(`- 其余 ${changeDescriptions.length - 6} 个文件已一并更新`);
          }
          description += `\n${keyItems.join('\n')}`;
        }
      }
      
      // Build final log
      const affectedFiles = changes.map(change => change.filePath).join('\n- ');
      const header = totalChanges === 1
        ? `[修改] ${changeDescriptions[0].theme}`
        : this.buildHeaderByThemes(uniqueThemes, totalChanges, language);
      
      return `${header}

详细描述：
${description}

影响范围：
- ${affectedFiles}`;
    } else {
      if (totalChanges === 1) {
        description = changeDescriptions[0].detail;
      } else {
        const operationSummary = this.buildOperationSummary(addedFiles.length, modifiedFiles.length, deletedFiles.length, language);
        const themePreview = uniqueThemes.slice(0, 3).join(', ');
        description = `This change touches ${totalChanges} files (${operationSummary})`;
        if (themePreview) {
          description += `, mainly about ${themePreview}${uniqueThemes.length > 3 ? ', and more' : ''}`;
        }

        if (strategy === 'detailed') {
          const keyItems = changeDescriptions.slice(0, 6).map(item => `- ${item.detail}`);
          if (changeDescriptions.length > 6) {
            keyItems.push(`- ${changeDescriptions.length - 6} more files are included in this update`);
          }
          description += `\n${keyItems.join('\n')}`;
        }
      }
      
      // Build final log
      const affectedFiles = changes.map(change => change.filePath).join('\n- ');
      const header = totalChanges === 1
        ? `[Modify] ${changeDescriptions[0].theme}`
        : this.buildHeaderByThemes(uniqueThemes, totalChanges, language);
      
      return `${header}

Detailed description:
${description}

Affected files:
- ${affectedFiles}`;
    }
  }

  private buildHeaderByThemes(themes: string[], totalChanges: number, language: 'zh' | 'en'): string {
    const preview = themes.slice(0, 2);
    if (language === 'zh') {
      if (preview.length === 0) {
        return `[修改] 更新 ${totalChanges} 个文件`;
      }
      return `[修改] ${preview.join('、')}${themes.length > 2 ? ' 等内容更新' : ''}`;
    }

    if (preview.length === 0) {
      return `[Modify] Update ${totalChanges} files`;
    }
    return `[Modify] ${preview.join(' & ')}${themes.length > 2 ? ' and related updates' : ''}`;
  }

  private buildOperationSummary(addedCount: number, modifiedCount: number, deletedCount: number, language: 'zh' | 'en'): string {
    if (language === 'zh') {
      const parts = [];
      if (modifiedCount > 0) parts.push(`修改 ${modifiedCount} 个`);
      if (addedCount > 0) parts.push(`新增 ${addedCount} 个`);
      if (deletedCount > 0) parts.push(`删除 ${deletedCount} 个`);
      return parts.length > 0 ? parts.join('，') : '无可识别的变更类型';
    }

    const parts = [];
    if (modifiedCount > 0) parts.push(`${modifiedCount} modified`);
    if (addedCount > 0) parts.push(`${addedCount} added`);
    if (deletedCount > 0) parts.push(`${deletedCount} deleted`);
    return parts.length > 0 ? parts.join(', ') : 'no recognized change type';
  }

  private describeChange(change: { filePath: string; changeType: string; diff: string }, language: 'zh' | 'en'): { theme: string; detail: string } {
    const theme = this.inferThemeFromFile(change.filePath, language);
    const diffSummary = this.extractDiffSummary(change.diff, language);

    if (language === 'zh') {
      const action = change.changeType === 'added' ? '新增' : change.changeType === 'deleted' ? '删除' : '更新';
      const detail = diffSummary
        ? `${action} ${change.filePath}（${theme}，${diffSummary}）`
        : `${action} ${change.filePath}（${theme}）`;
      return { theme, detail };
    }

    const action = change.changeType === 'added' ? 'Add' : change.changeType === 'deleted' ? 'Delete' : 'Update';
    const detail = diffSummary
      ? `${action} ${change.filePath} (${theme}, ${diffSummary})`
      : `${action} ${change.filePath} (${theme})`;
    return { theme, detail };
  }

  private inferThemeFromFile(filePath: string, language: 'zh' | 'en'): string {
    const normalizedPath = filePath.replace(/\\\\/g, '/').toLowerCase();
    const fileName = normalizedPath.split('/').pop() || normalizedPath;
    const extension = this.getFileExtension(fileName);

    const keywordThemeMap = language === 'zh'
      ? [
          { keywords: ['日报', '周报', '日志', 'log'], theme: '工作日志更新' },
          { keywords: ['发票', '报销', 'invoice'], theme: '发票报销明细更新' },
          { keywords: ['评优', '表彰', '公示', 'award'], theme: '评优公示材料同步' },
          { keywords: ['需求', '评审', 'review'], theme: '需求与评审文档调整' },
          { keywords: ['settings', 'config', '配置'], theme: '配置项调整' }
        ]
      : [
          { keywords: ['log', 'journal', 'daily'], theme: 'work log update' },
          { keywords: ['invoice', 'expense', 'reimbursement'], theme: 'invoice data update' },
          { keywords: ['award', 'announcement', 'publicity'], theme: 'announcement material sync' },
          { keywords: ['requirement', 'review'], theme: 'requirement/review document update' },
          { keywords: ['settings', 'config'], theme: 'configuration update' }
        ];

    for (const item of keywordThemeMap) {
      if (item.keywords.some(keyword => normalizedPath.includes(keyword))) {
        return item.theme;
      }
    }

    if (language === 'zh') {
      switch (extension) {
        case 'md':
          return '文档内容更新';
        case 'pdf':
          return '文档附件同步';
        case 'xlsx':
        case 'xls':
        case 'csv':
          return '表格数据更新';
        case 'json':
        case 'yaml':
        case 'yml':
          return '结构化配置更新';
        default:
          return '文件内容更新';
      }
    }

    switch (extension) {
      case 'md':
        return 'document content update';
      case 'pdf':
        return 'document attachment sync';
      case 'xlsx':
      case 'xls':
      case 'csv':
        return 'spreadsheet data update';
      case 'json':
      case 'yaml':
      case 'yml':
        return 'structured config update';
      default:
        return 'file content update';
    }
  }

  private getFileExtension(fileName: string): string {
    const match = fileName.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Extract summary from Git diff
   */
  private extractDiffSummary(diff: string, language: 'zh' | 'en'): string {
    if (!diff) return '';
    
    // Extract meaningful content from diff
    const lines = diff.split('\n');
    const addedContent = [];
    const removedContent = [];
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        // Extract meaningful content (remove the '+' and trim)
        const content = line.substring(1).trim();
        if (content && content.length > 0 && content.length < 50) { // Only include short, meaningful lines
          addedContent.push(content);
        }
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        // Extract meaningful content (remove the '-' and trim)
        const content = line.substring(1).trim();
        if (content && content.length > 0 && content.length < 50) { // Only include short, meaningful lines
          removedContent.push(content);
        }
      }
    }
    
    if (addedContent.length === 0 && removedContent.length === 0) {
      return '';
    }
    
    if (language === 'zh') {
      let summary = '';
      
      // Add content changes if available
      if (addedContent.length > 0) {
        const sampleContent = addedContent.slice(0, 2).join('; '); // Take first 2 added lines as sample
        summary += `(新增: ${sampleContent}${addedContent.length > 2 ? '...' : ''}`;
      }
      
      if (removedContent.length > 0) {
        const sampleContent = removedContent.slice(0, 2).join('; '); // Take first 2 removed lines as sample
        summary += addedContent.length > 0 ? `, 删除: ${sampleContent}${removedContent.length > 2 ? '...' : ''}` : `(删除: ${sampleContent}${removedContent.length > 2 ? '...' : ''}`;
      }
      
      if (summary) {
        summary += ')';
      }
      return summary;
    } else {
      let summary = '';
      
      // Add content changes if available
      if (addedContent.length > 0) {
        const sampleContent = addedContent.slice(0, 2).join('; '); // Take first 2 added lines as sample
        summary += `(add: ${sampleContent}${addedContent.length > 2 ? '...' : ''}`;
      }
      
      if (removedContent.length > 0) {
        const sampleContent = removedContent.slice(0, 2).join('; '); // Take first 2 removed lines as sample
        summary += addedContent.length > 0 ? `, remove: ${sampleContent}${removedContent.length > 2 ? '...' : ''}` : `(remove: ${sampleContent}${removedContent.length > 2 ? '...' : ''}`;
      }
      
      if (summary) {
        summary += ')';
      }
      return summary;
    }
  }
}