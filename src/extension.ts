import * as vscode from 'vscode';
const figlet = require('figlet');

const enlarge = true;
const font = 'Big Money-sw';
const paddingLeft = 0;
const paddingRight = 0;
const paddingTop = 0;
const paddingBottom = 0;

export function activate(context: vscode.ExtensionContext) {

   const paddingLeftSpaces = ' '.repeat(paddingLeft);
   const paddingRightSpaces = ' '.repeat(paddingRight);

   let disposable = vscode.commands.registerCommand('large-comments.large-comments', () => {

      const editor = vscode.window.activeTextEditor;

      let text: string = '';
      let selection: vscode.Range;
      if (editor?.selection.isEmpty) {
         // cursor
         const activeLine = editor?.document.lineAt(editor?.selection.active.line);
         text = activeLine.text;
         selection = activeLine.range;
      } else {
         // selected some text
         const startPosition = editor?.selection.start.with({ character: 0 });
         const endPosition = editor?.selection.end.with({ character: editor.document.lineAt(editor.selection.end.line).text.length });
         selection = editor?.selection.with(startPosition, endPosition)!;
         for (let i = selection.start.line; i <= selection.end.line; ++i) {
            text += editor?.document.getText(editor.document.lineAt(i).range) + '\n';
         }
      }

      let textLeadingSpaceLength = Number.MAX_SAFE_INTEGER;
      text = text.split('\n')
         .map((line: string) => {
            if (line.trim().length > 0) {
               textLeadingSpaceLength = Math.min(textLeadingSpaceLength, line.search(/\S/));
            }
            return line;
         })
         .map((line: string) => line.substr(textLeadingSpaceLength))
         .join('\n');

      const leadingSpaces = ' '.repeat(textLeadingSpaceLength);

      let newText = enlarge ? figlet.textSync(text, { font }) : text;

      let commentLength = 0;
      newText = newText.split('\n').filter((line: string) => {
         if (line.trim().length > 0) {
            commentLength = line.length;
         }
         return line.trim().length;
      }).join('\n');

      let addComment!: Function;
      switch (editor?.document.languageId) {
         case 'c':
         case 'cpp':
         case 'csharp':
         case 'go':
         case 'java':
         case 'javascript':
         case 'json':
         case 'jsonc':
         case 'php':
         case 'rust':
         case 'swift':
         case 'typescript':
            addComment = (text: string) => {
               let ret = leadingSpaces + '/'.repeat(commentLength + 6 + paddingLeft + paddingRight) + '\n';
               for (let i = 0; i < paddingTop; ++i) {
                  ret += leadingSpaces + '//' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '//\n';
               }
               text.split('\n').map((line: string) => {
                  ret += leadingSpaces + '// ' + paddingLeftSpaces + line + paddingRightSpaces + ' //\n';
               });
               for (let i = 0; i < paddingBottom + 1; ++i) {
                  ret += leadingSpaces + '//' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '//\n';
               }
               ret += leadingSpaces + '/'.repeat(commentLength + 6 + paddingLeft + paddingRight) + '\n';
               return ret;
            }
            break;

         case 'python':
         case 'dockerfile':
         case 'makefile':
         case 'perl':
         case 'perl6':
         case 'powershell':
         case 'r':
         case 'shellscript':
         case 'yaml':
         case 'ruby':
            addComment = (text: string) => {
               let ret = leadingSpaces + '#'.repeat(commentLength + 4 + paddingLeft + paddingRight) + '\n';
               for (let i = 0; i < paddingTop; ++i) {
                  ret += leadingSpaces + '#' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '#\n';
               }
               text.split('\n').map((line: string) => {
                  ret += leadingSpaces + '# ' + paddingLeftSpaces + line + paddingRightSpaces + ' #\n';
               });
               for (let i = 0; i < paddingBottom + 1; ++i) {
                  ret += leadingSpaces + '#' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '#\n';
               }
               ret += leadingSpaces + '#'.repeat(commentLength + 4 + paddingLeft + paddingRight) + '\n';
               return ret;
            }
            break;
         case 'html':
         case 'markdown':
         case 'xml':
            addComment = (text: string) => {
               let ret = leadingSpaces + '<!-- ' + '-'.repeat(commentLength + paddingLeft + paddingRight) + '\n';
               for (let i = 0; i < paddingTop; ++i) {
                  ret += leadingSpaces + ' -' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '-\n';
               }
               text.split('\n').map((line: string) => {
                  ret += leadingSpaces + ' - ' + paddingLeftSpaces + line + paddingRightSpaces + ' -\n';
               });
               for (let i = 0; i < paddingBottom + 1; ++i) {
                  ret += leadingSpaces + ' -' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '-\n';
               }
               ret += leadingSpaces + ' ' + '-'.repeat(commentLength + paddingLeft + paddingRight) + ' -->\n';
               return ret;
            }
            break;
         case 'css':
         case 'scss':
         case 'sass':
            addComment = (text: string) => {
               let ret = leadingSpaces + '/*' + '*'.repeat(commentLength + 3 + paddingLeft + paddingRight) + '\n';
               for (let i = 0; i < paddingTop; ++i) {
                  ret += leadingSpaces + ' *' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '*\n';
               }
               text.split('\n').map((line: string) => {
                  ret += leadingSpaces + ' * ' + paddingLeftSpaces + line + paddingRightSpaces + ' *\n';
               });
               for (let i = 0; i < paddingBottom + 1; ++i) {
                  ret += leadingSpaces + ' *' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '*\n';
               }
               ret += leadingSpaces + ' ' + '*'.repeat(commentLength + 4 + paddingLeft + paddingRight) + '/\n';
               return ret;
            }
            break;
         case 'sql':
            addComment = (text: string) => {
               let ret = leadingSpaces + '-'.repeat(commentLength + 6 + paddingLeft + paddingRight) + '\n';
               for (let i = 0; i < paddingTop; ++i) {
                  ret += leadingSpaces + '--' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '--\n';
               }
               text.split('\n').map((line: string) => {
                  ret += leadingSpaces + '-- ' + paddingLeftSpaces + line + paddingRightSpaces + ' --\n';
               });
               for (let i = 0; i < paddingBottom + 1; ++i) {
                  ret += leadingSpaces + '--' + ' '.repeat(commentLength + 2 + paddingLeft + paddingRight) + '--\n';
               }
               ret += leadingSpaces + '-'.repeat(commentLength + 6 + paddingLeft + paddingRight) + '\n';
               return ret;
            }
            break;
         default:
            addComment = (text: string) => text;
      }

      newText = addComment(newText);

      editor?.edit(editBuilder => {
         editBuilder.replace(selection, newText);
      });

   });

   context.subscriptions.push(disposable);
}

export function deactivate() { }
