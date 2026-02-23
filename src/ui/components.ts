import { App, Modal, TextAreaComponent } from 'obsidian';

export class LogPreviewModal extends Modal {
  private log: string;
  private onConfirm: (log: string) => void;

  constructor(app: App, log: string, onConfirm: (log: string) => void) {
    super(app);
    this.log = log;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Git Commit Log Preview' });

    // Create text area for log preview and editing
    const textArea = new TextAreaComponent(contentEl)
      .setValue(this.log)
      .setPlaceholder('Generated commit log')
      .setRows(10);

    // Create button container
    const buttonContainer = contentEl.createEl('div', { cls: 'modal-button-container' });
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.marginTop = '16px';

    // Cancel button
    buttonContainer.createEl('button', {
      text: 'Cancel',
      cls: 'mod-ghost'
    }).addEventListener('click', () => {
      this.close();
    });

    // Confirm button
    buttonContainer.createEl('button', {
      text: 'Use This Log',
      cls: 'mod-cta'
    }).addEventListener('click', () => {
      this.onConfirm(textArea.getValue());
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}