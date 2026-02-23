import { App, Notice } from 'obsidian';

export class CopilotService {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Check if Copilot plugin is available
   */
  isCopilotAvailable(): boolean {
    const copilotPlugin = (this.app as any).plugins.getPlugin('obsidian-copilot');
    return !!copilotPlugin;
  }

  /**
   * Generate commit log using Copilot AI
   */
  async generateCommitLog(changes: Array<{ filePath: string; changeType: string; diff: string }>, language: 'zh' | 'en', strategy: 'detailed' | 'simple'): Promise<string> {
    try {
      const copilotPlugin = (this.app as any).plugins.getPlugin('obsidian-copilot');
      if (!copilotPlugin) {
        throw new Error('Copilot plugin is not installed or enabled');
      }

      // Prepare prompt for Copilot
      const prompt = this.buildPrompt(changes, language, strategy);

      // Call Copilot API
      // Note: This is a placeholder implementation
      // In real implementation, we would use the actual Copilot plugin API
      const generatedLog = await this.mockCopilotResponse(prompt, language);

      return generatedLog;
    } catch (error) {
      console.error('Error generating commit log:', error);
      new Notice('Failed to generate commit log: ' + (error instanceof Error ? error.message : String(error)));
      return '';
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
  private async mockCopilotResponse(prompt: string, language: 'zh' | 'en'): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock response based on language
    if (language === 'zh') {
      return `[修改] 更新示例笔记\n\n详细描述：\n- 更新了example.md文件的内容\n- 添加了新的行\n\n影响范围：notes/example.md`;
    } else {
      return `[Modify] Update example note\n\nDetailed description:\n- Updated content in example.md file\n- Added a new line\n\nAffected files: notes/example.md`;
    }
  }
}