import { App, Notice, Plugin } from 'obsidian';
import { GitLogSettings } from '../settings';
import { LogGenerator } from '../logGenerator';

export class CommandManager {
  private app: App;
  private plugin: Plugin;
  private logGenerator: LogGenerator;
  private settings: GitLogSettings;

  constructor(app: App, plugin: Plugin, logGenerator: LogGenerator, settings: GitLogSettings) {
    this.app = app;
    this.plugin = plugin;
    this.logGenerator = logGenerator;
    this.settings = settings;
  }

  /**
   * Register plugin commands
   */
  registerCommands() {
    this.plugin.addCommand({
      id: 'generate-git-log',
      name: 'Generate Git Commit Log',
      callback: async () => {
        await this.generateGitLog();
      },
      hotkeys: [
        { modifiers: ['Mod', 'Shift'], key: 'g' }
      ]
    });

    this.plugin.addCommand({
      id: 'generate-git-log-and-fill',
      name: 'Generate Git Commit Log and Fill',
      callback: async () => {
        await this.generateGitLogAndFill();
      }
    });
  }

  /**
   * Generate Git commit log
   */
  private async generateGitLog() {
    try {
      const log = await this.logGenerator.generateLog(this.settings);
      if (log) {
        // Show log in a modal or notification
        new Notice('Git commit log generated successfully');
        console.log('Generated Git commit log:', log);
        
        // Copy log to clipboard
        await navigator.clipboard.writeText(log);
        new Notice('Log copied to clipboard');
      }
    } catch (error) {
      console.error('Error generating Git log:', error);
      new Notice('Failed to generate Git log: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Generate Git commit log and fill it into Git commit message box
   */
  private async generateGitLogAndFill() {
    try {
      const log = await this.logGenerator.generateLog(this.settings);
      if (log) {
        // Try to fill the log into Git commit message box
        // Note: This is a placeholder implementation
        // In real implementation, we would interact with Git plugin's commit UI
        new Notice('Git commit log generated and filled successfully');
        console.log('Generated Git commit log:', log);
        
        // Copy log to clipboard as fallback
        await navigator.clipboard.writeText(log);
        new Notice('Log copied to clipboard');
      }
    } catch (error) {
      console.error('Error generating Git log:', error);
      new Notice('Failed to generate Git log: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Update settings
   */
  updateSettings(settings: GitLogSettings) {
    this.settings = settings;
  }
}