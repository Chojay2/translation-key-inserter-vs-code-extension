/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(2));
const path = __importStar(__webpack_require__(3));
function activate(context) {
    const translationFormat = [
        { project: 'react', start: "{t('", end: "')}" },
        { project: 'angular', start: "{{'", end: "' | translate }}" },
    ];
    let disposable = vscode.commands.registerCommand('extension.transformText', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found!');
            return;
        }
        const selectedPrefix = await vscode.window.showQuickPick(['HINT_', 'LABEL_', 'BTN_', 'QUEST_', 'ERROR_'], { placeHolder: 'Select a prefix for transformation' });
        if (!selectedPrefix) {
            vscode.window.showInformationMessage('Prefix not selected. Operation canceled.');
            return;
        }
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showWarningMessage('Please select some text to transform.');
            return;
        }
        let transformedText = transformText(selectedText, selectedPrefix);
        if (selectedText.split(/\s+/).length > 5) {
            const customKey = await vscode.window.showInputBox({
                prompt: 'Enter a custom key',
                placeHolder: 'eg. BANK_HACKED',
            });
            if (customKey) {
                transformedText = `${selectedPrefix}${customKey}`;
            }
            else {
                vscode.window.showInformationMessage('No custom key provided. Operation canceled.');
                return;
            }
        }
        const rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('No workspace found!');
            return;
        }
        const config = vscode.workspace.getConfiguration('extension');
        const i18nFilePaths = config.get('translaty.i18nFilePath') || [];
        const projectType = config.get('translaty.projectType') || 'react';
        const prefixesOrder = ['HINT_', 'LABEL_', 'BTN_', 'QUEST_', 'ERROR_'];
        i18nFilePaths.forEach(async (filePath) => {
            const fullPath = path.join(rootPath, filePath);
            if (fs.existsSync(fullPath)) {
                let fileContent = fs.readFileSync(fullPath, 'utf-8');
                let lastPrefixIndex = findLastPrefixIndex(fileContent, prefixesOrder);
                let matchingPrefixIndex = findMatchingPrefixIndex(fileContent, selectedPrefix);
                const newKeyValuePair = `  ${transformedText}: '${selectedText}',\n`;
                if (matchingPrefixIndex === -1) {
                    const insertionIndex = fileContent.indexOf('\n', lastPrefixIndex) + 1;
                    const updatedContent = fileContent.slice(0, insertionIndex) +
                        '\n' +
                        newKeyValuePair +
                        '\n' +
                        fileContent.slice(insertionIndex);
                    fs.writeFileSync(fullPath, updatedContent);
                }
                else {
                    const lines = fileContent.split('\n');
                    const lastPrefixLine = fileContent
                        .substr(0, matchingPrefixIndex)
                        .split("\n").length;
                    const beforeContent = lines.slice(0, lastPrefixLine);
                    const afterContent = lines.slice(lastPrefixLine);
                    fileContent = `${beforeContent.join('\n')}\n${newKeyValuePair}${afterContent.join('\n')}\n`;
                    fs.writeFileSync(fullPath, fileContent);
                }
            }
            else {
                vscode.window.showErrorMessage(`File not found: ${filePath}`);
            }
        });
        let translationStatement = translationFormat.filter((format) => format.project === projectType);
        editor.edit((editBuilder) => {
            editBuilder.replace(selection, `${translationStatement[0].start}${transformedText}${translationStatement[0].end}`);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function transformText(text, prefix) {
    let transformedText = text.replace(/"/g, '');
    transformedText = transformedText.replace(/\s+/g, '_');
    if (/^[a-zA-Z0-9_]+$/.test(transformedText)) {
        return `${prefix}${transformedText.toUpperCase()}`;
    }
    else {
        return `${prefix}${transformedText.toUpperCase()}_TEXT`;
    }
}
function findLastPrefixIndex(fileContent, prefixes) {
    let lastPrefixIndex = -1;
    prefixes.forEach((prefix) => {
        const prefixIndex = fileContent.lastIndexOf(prefix);
        if (prefixIndex > lastPrefixIndex) {
            lastPrefixIndex = prefixIndex;
        }
    });
    return lastPrefixIndex;
}
function findMatchingPrefixIndex(fileContent, prefix) {
    const prefixRegex = new RegExp(`${prefix}[A-Z_]+`, 'g');
    let match;
    let matchingPrefixIndex = -1;
    while ((match = prefixRegex.exec(fileContent)) !== null) {
        matchingPrefixIndex = match.index + match[0].length;
    }
    return matchingPrefixIndex;
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map