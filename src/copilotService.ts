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
  if (typeof window !== 'undefined' && window.console) {
    window.console.log(`[GitLog-Copilot] ${message}`);
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
    
    // Build summary
    const totalChanges = changes.length;
    
    // Generate comprehensive description
    let description = '';
    
    if (language === 'zh') {
      if (totalChanges === 1) {
        const change = changes[0];
        switch (change.changeType) {
          case 'added':
            description = `新增文件 ${change.filePath}`;
            break;
          case 'modified':
            const diffSummary = this.extractDiffSummary(change.diff, language);
            description = `修改文件 ${change.filePath} ${diffSummary}`;
            break;
          case 'deleted':
            description = `删除文件 ${change.filePath}`;
            break;
        }
      } else {
        // Generate comprehensive summary
        if (modifiedFiles.length > 0) {
          description += `更新了 ${modifiedFiles.length} 个文件`;
          if (addedFiles.length > 0) {
            description += `，新增了 ${addedFiles.length} 个文件`;
          }
          if (deletedFiles.length > 0) {
            description += `，删除了 ${deletedFiles.length} 个文件`;
          }
          
          // Add specific changes for key files
          if (strategy === 'detailed') {
            const keyFiles = modifiedFiles.slice(0, 3); // Focus on first 3 modified files
            for (const file of keyFiles) {
              const diffSummary = this.extractDiffSummary(file.diff, language);
              if (diffSummary) {
                description += `\n- ${file.filePath} ${diffSummary}`;
              }
            }
            if (modifiedFiles.length > 3) {
              description += `\n- 等 ${modifiedFiles.length - 3} 个其他文件`;
            }
          }
        } else if (addedFiles.length > 0) {
          description = `新增了 ${addedFiles.length} 个文件`;
        } else if (deletedFiles.length > 0) {
          description = `删除了 ${deletedFiles.length} 个文件`;
        }
      }
      
      // Build final log
      const affectedFiles = changes.map(change => change.filePath).join('\n- ');
      
      return `[修改] ${totalChanges === 1 ? description : `批量更新 ${totalChanges} 个文件`}

详细描述：
${description}

影响范围：
- ${affectedFiles}`;
    } else {
      if (totalChanges === 1) {
        const change = changes[0];
        switch (change.changeType) {
          case 'added':
            description = `Add file ${change.filePath}`;
            break;
          case 'modified':
            const diffSummary = this.extractDiffSummary(change.diff, language);
            description = `Update file ${change.filePath} ${diffSummary}`;
            break;
          case 'deleted':
            description = `Delete file ${change.filePath}`;
            break;
        }
      } else {
        // Generate comprehensive summary
        if (modifiedFiles.length > 0) {
          description += `Updated ${modifiedFiles.length} files`;
          if (addedFiles.length > 0) {
            description += `, added ${addedFiles.length} files`;
          }
          if (deletedFiles.length > 0) {
            description += `, deleted ${deletedFiles.length} files`;
          }
          
          // Add specific changes for key files
          if (strategy === 'detailed') {
            const keyFiles = modifiedFiles.slice(0, 3); // Focus on first 3 modified files
            for (const file of keyFiles) {
              const diffSummary = this.extractDiffSummary(file.diff, language);
              if (diffSummary) {
                description += `\n- ${file.filePath} ${diffSummary}`;
              }
            }
            if (modifiedFiles.length > 3) {
              description += `\n- and ${modifiedFiles.length - 3} other files`;
            }
          }
        } else if (addedFiles.length > 0) {
          description = `Added ${addedFiles.length} files`;
        } else if (deletedFiles.length > 0) {
          description = `Deleted ${deletedFiles.length} files`;
        }
      }
      
      // Build final log
      const affectedFiles = changes.map(change => change.filePath).join('\n- ');
      
      return `[Modify] ${totalChanges === 1 ? description : `Update ${totalChanges} files`}

Detailed description:
${description}

Affected files:
- ${affectedFiles}`;
    }
  }

  /**
   * Build prompt for Copilot
   */
  private buildPrompt(changes: Array<{ filePath: string; changeType: string; diff: string }>, language: 'zh' | 'en', strategy: 'detailed' | 'simple'): string {
    const fileChanges = changes.map(change => {
      return `File: ${change.filePath}\nType: ${change.changeType}\nDiff: ${change.diff}\n`;
    }).join('\n');

    const languagePrompt = language === 'zh' ? '中文' : 'English';
    const strategyPrompt = strategy === 'detailed' ? '详细' : '简洁';

    return `请根据以下Git文件变更，生成一个${strategyPrompt}的${languagePrompt}提交日志：\n\n${fileChanges}\n\n要求：\n1. 日志应该清晰地描述变更内容\n2. 遵循Git提交规范\n3. 使用${languagePrompt}撰写\n4. ${strategy === 'detailed' ? '提供详细的变更说明' : '保持简洁明了'}`;
  }

  /**
   * Mock Copilot response for demonstration
   */
  private async mockCopilotResponse(prompt: string, language: 'zh' | 'en', changes?: Array<{ filePath: string; changeType: string; diff: string }>): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate response based on actual changes if available
    if (changes && changes.length > 0) {
      debugLog('Generating mock response based on actual changes');
      
      // Group changes by type
      const addedFiles = changes.filter(change => change.changeType === 'added');
      const modifiedFiles = changes.filter(change => change.changeType === 'modified');
      const deletedFiles = changes.filter(change => change.changeType === 'deleted');
      
      // Build summary
      const totalChanges = changes.length;
      const affectedFiles = changes.map(change => change.filePath).join('\n- ');
      
      // Generate detailed descriptions for each file
      const detailedDescriptions = [];
      
      for (const change of changes) {
        let fileDescription = '';
        
        switch (change.changeType) {
          case 'added':
            fileDescription = language === 'zh' ? `新增文件 ${change.filePath}` : `Add file ${change.filePath}`;
            break;
          case 'deleted':
            fileDescription = language === 'zh' ? `删除文件 ${change.filePath}` : `Delete file ${change.filePath}`;
            break;
          case 'modified':
            const diffSummary = this.extractDiffSummary(change.diff, language);
            fileDescription = language === 'zh' 
              ? `修改文件 ${change.filePath} ${diffSummary}` 
              : `Modify file ${change.filePath} ${diffSummary}`;
            break;
        }
        
        detailedDescriptions.push(`- ${fileDescription}`);
      }
      
      if (language === 'zh') {
        let message = '';
        
        if (totalChanges === 1) {
          const change = changes[0];
          switch (change.changeType) {
            case 'added':
              message = `[新增] 添加文件 ${change.filePath}`;
              break;
            case 'modified':
              message = `[修改] 更新文件 ${change.filePath}`;
              break;
            case 'deleted':
              message = `[删除] 删除文件 ${change.filePath}`;
              break;
          }
        } else {
          message = `[修改] 批量更新 ${totalChanges} 个文件`;
        }
        
        return `${message}

详细描述：
${detailedDescriptions.join('\n')}

影响范围：
- ${affectedFiles}`;
      } else {
        let message = '';
        
        if (totalChanges === 1) {
          const change = changes[0];
          switch (change.changeType) {
            case 'added':
              message = `[Add] Add file ${change.filePath}`;
              break;
            case 'modified':
              message = `[Modify] Update file ${change.filePath}`;
              break;
            case 'deleted':
              message = `[Delete] Delete file ${change.filePath}`;
              break;
          }
        } else {
          message = `[Modify] Update ${totalChanges} files`;
        }
        
        return `${message}

Detailed description:
${detailedDescriptions.join('\n')}

Affected files:
- ${affectedFiles}`;
      }
    }
    
    // Fallback to default mock response if no changes
    debugLog('Generating default mock response');
    if (language === 'zh') {
      return `[修改] 更新示例笔记

详细描述：
- 更新了example.md文件的内容
- 添加了新的行

影响范围：notes/example.md`;
    } else {
      return `[Modify] Update example note

Detailed description:
- Updated content in example.md file
- Added a new line

Affected files: notes/example.md`;
    }
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