import { App, Plugin } from 'obsidian';
import { GitLogSettings, DEFAULT_SETTINGS, GitLogSettingTab } from './settings';
import { GitService } from './gitService';
import { CopilotService } from './copilotService';
import { LogGenerator } from './logGenerator';
import { CommandManager } from './ui/commands';

export default class GitLogPlugin extends Plugin {
  settings: GitLogSettings;
  gitService: GitService;
  copilotService: CopilotService;
  logGenerator: LogGenerator;
  commandManager: CommandManager;

  async onload() {
    await this.loadSettings();

    // Initialize services
    this.gitService = new GitService(this.app);
    this.copilotService = new CopilotService(this.app);
    this.logGenerator = new LogGenerator(this.gitService, this.copilotService);
    this.commandManager = new CommandManager(this.app, this, this.logGenerator, this.settings);

    // Register commands
    this.commandManager.registerCommands();

    // Register settings tab
    this.addSettingTab(new GitLogSettingTab(this.app, this));

    // Log plugin loaded
    console.log('Git Log Generator plugin loaded');
  }

  async onunload() {
    // Log plugin unloaded
    console.log('Git Log Generator plugin unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Update command manager with new settings
    if (this.commandManager) {
      this.commandManager.updateSettings(this.settings);
    }
  }
}