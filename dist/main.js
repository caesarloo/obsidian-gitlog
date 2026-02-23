"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const obsidian = require("obsidian");
const DEFAULT_SETTINGS = {
  language: "zh",
  template: "default",
  strategy: "detailed",
  historyCount: 10,
  shortcut: "mod+shift+g"
};
class GitLogSettingTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    __publicField(this, "plugin");
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Git Log Generator Settings" });
    new obsidian.Setting(containerEl).setName("Language").setDesc("Select the language for generated commit logs").addDropdown(
      (dropdown) => dropdown.addOption("zh", "Chinese").addOption("en", "English").setValue(this.plugin.settings.language).onChange(async (value) => {
        this.plugin.settings.language = value;
        await this.plugin.saveSettings();
      })
    );
    new obsidian.Setting(containerEl).setName("Log Template").setDesc("Select the template for commit logs").addDropdown(
      (dropdown) => dropdown.addOption("default", "Default").addOption("simple", "Simple").addOption("detailed", "Detailed").setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value;
        await this.plugin.saveSettings();
      })
    );
    new obsidian.Setting(containerEl).setName("Generation Strategy").setDesc("Select the strategy for log generation").addDropdown(
      (dropdown) => dropdown.addOption("detailed", "Detailed").addOption("simple", "Simple").setValue(this.plugin.settings.strategy).onChange(async (value) => {
        this.plugin.settings.strategy = value;
        await this.plugin.saveSettings();
      })
    );
    new obsidian.Setting(containerEl).setName("History Count").setDesc("Number of recent logs to save").addSlider(
      (slider) => slider.setMin(1).setMax(50).setValue(this.plugin.settings.historyCount).onChange(async (value) => {
        this.plugin.settings.historyCount = value;
        await this.plugin.saveSettings();
      })
    );
    new obsidian.Setting(containerEl).setName("Keyboard Shortcut").setDesc("Set a keyboard shortcut for generating logs").addText(
      (text) => text.setValue(this.plugin.settings.shortcut).onChange(async (value) => {
        this.plugin.settings.shortcut = value;
        await this.plugin.saveSettings();
      })
    );
  }
}
class GitService {
  constructor(app) {
    __publicField(this, "app");
    this.app = app;
  }
  /**
   * Get Git changes from the repository
   */
  async getGitChanges() {
    try {
      const gitPlugin = this.app.plugins.getPlugin("obsidian-git");
      if (!gitPlugin) {
        throw new Error("Git plugin is not installed or enabled");
      }
      const changes = [];
      changes.push({
        filePath: "notes/example.md",
        changeType: "modified",
        diff: "--- a/notes/example.md\n+++ b/notes/example.md\n@@ -1,3 +1,5 @@\n # Example Note\n\n-This is an example note.\n+This is an updated example note.\n+\n+Added a new line."
      });
      return changes;
    } catch (error) {
      console.error("Error getting Git changes:", error);
      new obsidian.Notice("Failed to get Git changes: " + (error instanceof Error ? error.message : String(error)));
      return [];
    }
  }
  /**
   * Parse Git diff to extract meaningful information
   */
  parseGitDiff(diff) {
    const lines = diff.split("\n");
    const meaningfulLines = lines.filter(
      (line) => line.startsWith("+") && !line.startsWith("+++") || line.startsWith("-") && !line.startsWith("---")
    );
    return meaningfulLines.join("\n");
  }
  /**
   * Check if the current vault is a Git repository
   */
  async isGitRepository() {
    try {
      const gitPlugin = this.app.plugins.getPlugin("obsidian-git");
      if (!gitPlugin) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking Git repository:", error);
      return false;
    }
  }
}
class CopilotService {
  constructor(app) {
    __publicField(this, "app");
    this.app = app;
  }
  /**
   * Check if Copilot plugin is available
   */
  isCopilotAvailable() {
    const copilotPlugin = this.app.plugins.getPlugin("Copilot");
    return !!copilotPlugin;
  }
  /**
   * Generate commit log using Copilot AI
   */
  async generateCommitLog(changes, language, strategy) {
    try {
      const copilotPlugin = this.app.plugins.getPlugin("Copilot");
      if (!copilotPlugin) {
        throw new Error("Copilot plugin is not installed or enabled");
      }
      const prompt = this.buildPrompt(changes, language, strategy);
      const generatedLog = await this.mockCopilotResponse(prompt, language);
      return generatedLog;
    } catch (error) {
      console.error("Error generating commit log:", error);
      new obsidian.Notice("Failed to generate commit log: " + (error instanceof Error ? error.message : String(error)));
      return "";
    }
  }
  /**
   * Build prompt for Copilot
   */
  buildPrompt(changes, language, strategy) {
    const fileChanges = changes.map((change) => {
      return `File: ${change.filePath}
Type: ${change.changeType}
Diff: ${change.diff}
`;
    }).join("\n");
    const languagePrompt = language === "zh" ? "中文" : "English";
    const strategyPrompt = strategy === "detailed" ? "详细" : "简洁";
    return `请根据以下Git文件变更，生成一个${strategyPrompt}的${languagePrompt}提交日志：

${fileChanges}

要求：
1. 日志应该清晰地描述变更内容
2. 遵循Git提交规范
3. 使用${languagePrompt}撰写
4. ${strategy === "detailed" ? "提供详细的变更说明" : "保持简洁明了"}`;
  }
  /**
   * Mock Copilot response for demonstration
   */
  async mockCopilotResponse(prompt, language) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    if (language === "zh") {
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
}
class LogGenerator {
  constructor(gitService, copilotService) {
    __publicField(this, "gitService");
    __publicField(this, "copilotService");
    this.gitService = gitService;
    this.copilotService = copilotService;
  }
  /**
   * Generate commit log based on Git changes
   */
  async generateLog(settings) {
    try {
      const isGitRepo = await this.gitService.isGitRepository();
      if (!isGitRepo) {
        throw new Error("Current vault is not a Git repository");
      }
      if (!this.copilotService.isCopilotAvailable()) {
        throw new Error("Copilot plugin is not available");
      }
      const changes = await this.gitService.getGitChanges();
      if (changes.length === 0) {
        throw new Error("No Git changes found");
      }
      const formattedChanges = changes.map((change) => ({
        filePath: change.filePath,
        changeType: change.changeType,
        diff: this.gitService.parseGitDiff(change.diff)
      }));
      const log = await this.copilotService.generateCommitLog(
        formattedChanges,
        settings.language,
        settings.strategy
      );
      return log;
    } catch (error) {
      console.error("Error generating log:", error);
      throw error;
    }
  }
  /**
   * Apply template to generated log
   */
  applyTemplate(log, template) {
    return log;
  }
}
class CommandManager {
  constructor(app, plugin, logGenerator, settings) {
    __publicField(this, "app");
    __publicField(this, "plugin");
    __publicField(this, "logGenerator");
    __publicField(this, "settings");
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
      id: "generate-git-log",
      name: "Generate Git Commit Log",
      callback: async () => {
        await this.generateGitLog();
      },
      hotkeys: [
        { modifiers: ["Mod", "Shift"], key: "g" }
      ]
    });
    this.plugin.addCommand({
      id: "generate-git-log-and-fill",
      name: "Generate Git Commit Log and Fill",
      callback: async () => {
        await this.generateGitLogAndFill();
      }
    });
  }
  /**
   * Generate Git commit log
   */
  async generateGitLog() {
    try {
      const log = await this.logGenerator.generateLog(this.settings);
      if (log) {
        new obsidian.Notice("Git commit log generated successfully");
        console.log("Generated Git commit log:", log);
        await navigator.clipboard.writeText(log);
        new obsidian.Notice("Log copied to clipboard");
      }
    } catch (error) {
      console.error("Error generating Git log:", error);
      new obsidian.Notice("Failed to generate Git log: " + (error instanceof Error ? error.message : String(error)));
    }
  }
  /**
   * Generate Git commit log and fill it into Git commit message box
   */
  async generateGitLogAndFill() {
    try {
      const log = await this.logGenerator.generateLog(this.settings);
      if (log) {
        new obsidian.Notice("Git commit log generated and filled successfully");
        console.log("Generated Git commit log:", log);
        await navigator.clipboard.writeText(log);
        new obsidian.Notice("Log copied to clipboard");
      }
    } catch (error) {
      console.error("Error generating Git log:", error);
      new obsidian.Notice("Failed to generate Git log: " + (error instanceof Error ? error.message : String(error)));
    }
  }
  /**
   * Update settings
   */
  updateSettings(settings) {
    this.settings = settings;
  }
}
class GitLogPlugin extends obsidian.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "settings");
    __publicField(this, "gitService");
    __publicField(this, "copilotService");
    __publicField(this, "logGenerator");
    __publicField(this, "commandManager");
  }
  async onload() {
    await this.loadSettings();
    this.gitService = new GitService(this.app);
    this.copilotService = new CopilotService(this.app);
    this.logGenerator = new LogGenerator(this.gitService, this.copilotService);
    this.commandManager = new CommandManager(this.app, this, this.logGenerator, this.settings);
    this.commandManager.registerCommands();
    this.addSettingTab(new GitLogSettingTab(this.app, this));
    console.log("Git Log Generator plugin loaded");
  }
  async onunload() {
    console.log("Git Log Generator plugin unloaded");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    if (this.commandManager) {
      this.commandManager.updateSettings(this.settings);
    }
  }
}
module.exports = GitLogPlugin;
//# sourceMappingURL=main.js.map
