import * as vscode from 'vscode';
const figlet = require('figlet');

export function activate(context: vscode.ExtensionContext) {

   let disposable = vscode.commands.registerCommand('large-comments.large-comments', () => {

      const editor = vscode.window.activeTextEditor;

      let text: string;
      let selection: vscode.Range;
      if (editor?.selection.isEmpty) {
         // cursor
         const currentLine = editor?.selection.active.line;
         text = editor?.document.lineAt(currentLine).text;
         selection = new vscode.Range(currentLine, 0, currentLine, text?.length);
      } else {
         // selected some text
         selection = editor?.selection!;
         text = editor?.document.getText(selection)!;
      }

      let newText = figlet.textSync(text, {
         font: 'Big Money-sw',
      });

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
               let ret = '/'.repeat(commentLength + 6) + '\n';
               text.split('\n').map((line: string) => {
                  ret += '// ' + line + ' //\n';
               });
               ret += '//' + ' '.repeat(commentLength + 2) + '//\n';
               ret += '/'.repeat(commentLength + 6) + '\n';
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
            addComment = (text: string) => {
               let ret = '#'.repeat(commentLength + 4) + '\n';
               text.split('\n').map((line: string) => {
                  ret += '# ' + line + ' #\n';
               });
               ret += '#' + ' '.repeat(commentLength + 2) + '#\n';
               ret += '#'.repeat(commentLength + 4) + '\n';
               return ret;
            }
            break;
         case 'html':
         case 'markdown':
         case 'xml':
            addComment = (text: string) => {
               let ret = '<!-- ' + '-'.repeat(commentLength) + '\n';
               text.split('\n').map((line: string) => {
                  ret += ' - ' + line + ' -\n';
               });
               ret += ' -' + ' '.repeat(commentLength + 2) + '-\n';
               ret += ' ' + '-'.repeat(commentLength) + ' -->\n';
               return ret;
            }
            break;
         case 'css':
         case 'scss':
         case 'sass':
            addComment = (text: string) => {
               let ret = '/*' + '*'.repeat(commentLength + 3) + '\n';
               text.split('\n').map((line: string) => {
                  ret += ' * ' + line + ' *\n';
               });
               ret += ' *' + ' '.repeat(commentLength + 2) + '*\n';
               ret += ' ' + '*'.repeat(commentLength + 4) + '/\n';
               return ret;
            }
            break;
         case 'sql':
            addComment = (text: string) => {
               let ret = '-'.repeat(commentLength + 6) + '\n';
               text.split('\n').map((line: string) => {
                  ret += '-- ' + line + ' --\n';
               });
               ret += '--' + ' '.repeat(commentLength + 2) + '--\n';
               ret += '-'.repeat(commentLength + 6) + '\n';
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
