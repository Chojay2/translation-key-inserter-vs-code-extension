import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import saveToGrist from './handleKeyValue';

interface TranslationFormat {
  project: string;
  start: string;
  end: string;
}

export function activate(context: vscode.ExtensionContext) {
  const translationFormat: TranslationFormat[] = [
    { project: 'react', start: "{t('", end: "')}" },
    { project: 'angular', start: "{{'", end: "' | translate }}" },
  ];

  let disposable = vscode.commands.registerCommand(
    'extension.translateText',
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage('No active text editor found!');
        return;
      }

      const selectedPrefix = await vscode.window.showQuickPick(
        ['HINT_', 'LABEL_', 'BTN_', 'QUEST_', 'ERROR_'],
        { placeHolder: 'Select a prefix for transformation' }
      );

      if (!selectedPrefix) {
        vscode.window.showInformationMessage(
          'Prefix not selected. Operation canceled.'
        );
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!selectedText) {
        vscode.window.showWarningMessage(
          'Please select some text to transform.'
        );
        return;
      }

      let transformedText = transformText(selectedText, selectedPrefix);

      if (selectedText.split(/\s+/).length > 4) {
        const customKey = await vscode.window.showInputBox({
          prompt: 'Enter a custom key',
          placeHolder: 'eg. BANK_HACKED',
        });

        if (customKey) {
          transformedText = `${selectedPrefix}${customKey}`;
        } else {
          vscode.window.showInformationMessage(
            'No custom key provided. Operation canceled.'
          );
          return;
        }
      }

      const rootPath = vscode.workspace.rootPath;

      if (!rootPath) {
        vscode.window.showErrorMessage('No workspace found!');
        return;
      }

      const config = vscode.workspace.getConfiguration('extension');
      const i18nFilePaths: string[] =
        config.get('translaty.i18nFilePath') || [];
      const projectType: string = config.get('translaty.projectType') || 'react';
      const prefixesOrder = ['HINT_', 'LABEL_', 'BTN_', 'QUEST_', 'ERROR_'];

      i18nFilePaths.forEach(async (filePath) => {
        const fullPath = path.join(rootPath, filePath);

        if (fs.existsSync(fullPath)) {
          let fileContent = fs.readFileSync(fullPath, 'utf-8');

          let lastPrefixIndex = findLastPrefixIndex(fileContent, prefixesOrder);
          let matchingPrefixIndex = findMatchingPrefixIndex(
            fileContent,
            selectedPrefix
          );

          const newKeyValuePair = `  ${transformedText}: '${selectedText}',\n`;

          if (matchingPrefixIndex === -1) {
            const insertionIndex =
              fileContent.indexOf('\n', lastPrefixIndex) + 1;

            const updatedContent =
              fileContent.slice(0, insertionIndex) +
              '\n' +
              newKeyValuePair +
              '\n' +
              fileContent.slice(insertionIndex);

            fs.writeFileSync(fullPath, updatedContent);
          } else {
            const lines = fileContent.split('\n');
           
            const lastPrefixLine =  fileContent
            .substr(0, matchingPrefixIndex)
            .split("\n").length;

            const beforeContent = lines.slice(0, lastPrefixLine);
            const afterContent = lines.slice(lastPrefixLine);

            fileContent = `${beforeContent.join(
              '\n'
            )}\n${newKeyValuePair}${afterContent.join('\n')}`;
            fs.writeFileSync(fullPath, fileContent);
          }
        } else {
          vscode.window.showErrorMessage(`File not found: ${filePath}`);
        }
      });

      let translationStatement = translationFormat.filter(
        (format) => format.project === projectType
      );

      editor.edit((editBuilder) => {
        editBuilder.replace(
          selection,
          `${translationStatement[0].start}${transformedText}${translationStatement[0].end}`
        );
      });
    saveToGrist(transformedText, selectedText);

    }
  );

  context.subscriptions.push(disposable);
}

function transformText(text: string, prefix: string): string {
  let transformedText = text.replace(/"/g, '');
  transformedText = transformedText.replace(/\s+/g, '_');

  if (/^[a-zA-Z0-9_]+$/.test(transformedText)) {
    return `${prefix}${transformedText.toUpperCase()}`;
  } else {
    return `${prefix}${transformedText.toUpperCase()}_TEXT`;
  }
}

function findLastPrefixIndex(fileContent: string, prefixes: string[]): number {
  let lastPrefixIndex = -1;
  prefixes.forEach((prefix) => {
    const prefixIndex = fileContent.lastIndexOf(prefix);
    if (prefixIndex > lastPrefixIndex) {
      lastPrefixIndex = prefixIndex;
    }
  });
  return lastPrefixIndex;
}

function findMatchingPrefixIndex(fileContent: string, prefix: string): number {
  const prefixRegex = new RegExp(`${prefix}[A-Z_]+`, 'g');
  let match;
  let matchingPrefixIndex = -1;

  while ((match = prefixRegex.exec(fileContent)) !== null) {
    matchingPrefixIndex = match.index + match[0].length;
  }

  return matchingPrefixIndex;
}
