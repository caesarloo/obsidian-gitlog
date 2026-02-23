import { GitService, GitChange } from './gitService';
import { CopilotService } from './copilotService';
import { GitLogSettings } from './settings';

export class LogGenerator {
  private gitService: GitService;
  private copilotService: CopilotService;

  constructor(gitService: GitService, copilotService: CopilotService) {
    this.gitService = gitService;
    this.copilotService = copilotService;
  }

  /**
   * Generate commit log based on Git changes
   */
  async generateLog(settings: GitLogSettings): Promise<string> {
    try {
      // Check if Git repository exists
      const isGitRepo = await this.gitService.isGitRepository();
      if (!isGitRepo) {
        throw new Error('Current vault is not a Git repository');
      }

      // Check if Copilot is available
      if (!this.copilotService.isCopilotAvailable()) {
        throw new Error('Copilot plugin is not available');
      }

      // Get Git changes
      const changes = await this.gitService.getGitChanges();
      if (changes.length === 0) {
        throw new Error('No Git changes found');
      }

      // Prepare changes for Copilot
      const formattedChanges = changes.map(change => ({
        filePath: change.filePath,
        changeType: change.changeType,
        diff: this.gitService.parseGitDiff(change.diff)
      }));

      // Generate log using Copilot
      const log = await this.copilotService.generateCommitLog(
        formattedChanges,
        settings.language,
        settings.strategy
      );

      return log;
    } catch (error) {
      console.error('Error generating log:', error);
      throw error;
    }
  }

  /**
   * Apply template to generated log
   */
  applyTemplate(log: string, template: 'default' | 'simple' | 'detailed'): string {
    // This is a placeholder implementation
    // In production, we would apply different templates
    return log;
  }
}