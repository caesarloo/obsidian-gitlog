import { App, Plugin } from 'obsidian';
import { GitLogSettings, DEFAULT_SETTINGS, GitLogSettingTab } from './settings';
import { GitService } from './gitService';
import { CopilotService } from './copilotService';
import { LogGenerator } from './logGenerator';
import { CommandManager } from './ui/commands';

// Add global log function for better visibility
function log(message: string) {
  console.log(`[GitLog] ${message}`);
  // Also try to log to the console in a different way
  if (typeof window !== 'undefined' && window.console) {
    window.console.log(`[GitLog] ${message}`);
  }
}

// Log immediately when the module is loaded
log('Module loaded - Git Log Generator');

// Test log function
log('Testing log function...');

export default class GitLogPlugin extends Plugin {
  settings: GitLogSettings;
  gitService: GitService;
  copilotService: CopilotService;
  logGenerator: LogGenerator;
  commandManager: CommandManager;

  async onload() {
    log('=== Plugin loading started ===');
    
    // Test direct console.log as well
    console.log('Direct console.log test - Plugin loading started');
    
    log('1. Loading settings...');
    await this.loadSettings();
    log(`Settings loaded: ${JSON.stringify(this.settings)}`);

    log('2. Initializing GitService...');
    this.gitService = new GitService(this.app);
    log('GitService initialized');

    log('3. Initializing CopilotService...');
    this.copilotService = new CopilotService(this.app);
    log('CopilotService initialized');

    log('4. Checking Copilot availability during initialization...');
    const copilotAvailable = this.copilotService.isCopilotAvailable();
    log(`Copilot available during initialization: ${copilotAvailable}`);

    log('5. Initializing LogGenerator...');
    this.logGenerator = new LogGenerator(this.gitService, this.copilotService);
    log('LogGenerator initialized');

    log('6. Initializing CommandManager...');
    this.commandManager = new CommandManager(this.app, this, this.logGenerator, this.settings);
    log('CommandManager initialized');

    log('7. Registering commands...');
    this.commandManager.registerCommands();
    log('Commands registered');

    log('8. Registering settings tab...');
    this.addSettingTab(new GitLogSettingTab(this.app, this));
    log('Settings tab registered');

    // Log plugin loaded
    log('=== Plugin loaded successfully ===');
    console.log('Direct console.log test - Plugin loaded successfully');
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