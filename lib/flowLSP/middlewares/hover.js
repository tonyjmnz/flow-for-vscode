/* @flow */
// HoverMiddleware: format hover contents field data
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient';
import { format } from '../../utils';

export default function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken,
  next: lsp.ProvideHoverSignature,
): Promise<?vscode.Hover> {
  return Promise.resolve(next(document, position, token)).then(value => {
    if (!value) {
      return value;
    }

    // format content
    value.contents = value.contents.map(content => {
      // NOTE: in our case, content is always MarkdownString
      if (content instanceof vscode.MarkdownString) {
        return formatMarkedDownString(content);
      }
      return content;
    });

    return value;
  });
}

function formatMarkedDownString(
  mdStr: vscode.MarkdownString,
): vscode.MarkdownString {
  const code = extractCode(mdStr, 'flow');
  const formatted = format(code);
  const formattedStr = new vscode.MarkdownString();
  formattedStr.appendCodeblock(formatted, 'javascript');
  return formattedStr;
}

// ```languageID code``` => code
function extractCode(mdStr: vscode.MarkdownString, language: string): string {
  return mdStr.value
    .replace('```' + language, '')
    .replace('```', '')
    .trim();
}
