import { App, PluginSettingTab, Setting } from 'obsidian';
import GitLogPlugin from './main';

export interface GitLogSettings {
  language: 'zh' | 'en';
  template: 'default' | 'simple' | 'detailed';
  strategy: 'detailed' | 'simple';
  historyCount: number;
  shortcut: string;
}

export const DEFAULT_SETTINGS: GitLogSettings = {
  language: 'zh',
  template: 'default',
  strategy: 'detailed',
  historyCount: 10,
  shortcut: 'mod+shift+g'
};

export class GitLogSettingTab extends PluginSettingTab {
  plugin: GitLogPlugin;

  constructor(app: App, plugin: GitLogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Git Log Generator Settings' });

    // Language setting
    new Setting(containerEl)
      .setName('Language')
      .setDesc('Select the language for generated commit logs')
      .addDropdown(dropdown => dropdown
        .addOption('zh', 'Chinese')
        .addOption('en', 'English')
        .setValue(this.plugin.settings.language)
        .onChange(async (value) => {
          this.plugin.settings.language = value as 'zh' | 'en';
          await this.plugin.saveSettings();
        })
      );

    // Template setting
    new Setting(containerEl)
      .setName('Log Template')
      .setDesc('Select the template for commit logs')
      .addDropdown(dropdown => dropdown
        .addOption('default', 'Default')
        .addOption('simple', 'Simple')
        .addOption('detailed', 'Detailed')
        .setValue(this.plugin.settings.template)
        .onChange(async (value) => {
          this.plugin.settings.template = value as 'default' | 'simple' | 'detailed';
          await this.plugin.saveSettings();
        })
      );

    // Strategy setting
    new Setting(containerEl)
      .setName('Generation Strategy')
      .setDesc('Select the strategy for log generation')
      .addDropdown(dropdown => dropdown
        .addOption('detailed', 'Detailed')
        .addOption('simple', 'Simple')
        .setValue(this.plugin.settings.strategy)
        .onChange(async (value) => {
          this.plugin.settings.strategy = value as 'detailed' | 'simple';
          await this.plugin.saveSettings();
        })
      );

    // History count setting
    new Setting(containerEl)
      .setName('History Count')
      .setDesc('Number of recent logs to save')
      .addSlider(slider => slider
        .setMin(1)
        .setMax(50)
        .setValue(this.plugin.settings.historyCount)
        .onChange(async (value) => {
          this.plugin.settings.historyCount = value;
          await this.plugin.saveSettings();
        })
      );

    // Shortcut setting
    new Setting(containerEl)
      .setName('Keyboard Shortcut')
      .setDesc('Set a keyboard shortcut for generating logs')
      .addText(text => text
        .setValue(this.plugin.settings.shortcut)
        .onChange(async (value) => {
          this.plugin.settings.shortcut = value;
          await this.plugin.saveSettings();
        })
      );
  }
}