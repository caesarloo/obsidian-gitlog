import { App, Notice } from 'obsidian';

export interface GitChange {
  filePath: string;
  changeType: 'added' | 'modified' | 'deleted';
  diff: string;
}

export class GitService {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Get Git changes from the repository
   */
  async getGitChanges(): Promise<GitChange[]> {
    try {
      // Check if Git plugin is available
      const gitPlugin = (this.app as any).plugins.getPlugin('obsidian-git');
      if (!gitPlugin) {
        throw new Error('Git plugin is not installed or enabled');
      }

      // Get changes using Git plugin API
      // Note: This is a placeholder implementation
      // In real implementation, we would use the actual Git plugin API
      const changes: GitChange[] = [];

      // For demo purposes, we'll return mock data
      // In production, we would use gitPlugin.getChanges() or similar
      changes.push({
        filePath: 'notes/example.md',
        changeType: 'modified',
        diff: '--- a/notes/example.md\n+++ b/notes/example.md\n@@ -1,3 +1,5 @@\n # Example Note\n\n-This is an example note.\n+This is an updated example note.\n+\n+Added a new line.'
      });

      return changes;
    } catch (error) {
      console.error('Error getting Git changes:', error);
      new Notice('Failed to get Git changes: ' + (error instanceof Error ? error.message : String(error)));
      return [];
    }
  }

  /**
   * Parse Git diff to extract meaningful information
   */
  parseGitDiff(diff: string): string {
    // Simple diff parsing for demonstration
    // In production, we would use a more robust diff parser
    const lines = diff.split('\n');
    const meaningfulLines = lines.filter(line => 
      line.startsWith('+') && !line.startsWith('+++') || 
      line.startsWith('-') && !line.startsWith('---')
    );
    return meaningfulLines.join('\n');
  }

  /**
   * Check if the current vault is a Git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      const gitPlugin = (this.app as any).plugins.getPlugin('obsidian-git');
      if (!gitPlugin) {
        return false;
      }

      // Check if repository exists
      // Note: This is a placeholder implementation
      return true;
    } catch (error) {
      console.error('Error checking Git repository:', error);
      return false;
    }
  }
}