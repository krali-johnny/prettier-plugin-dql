import { Plugin } from 'prettier';
import { parsers as babelParsers } from 'prettier/plugins/babel';
import { parsers as typescriptParsers } from 'prettier/plugins/typescript';

import { formatDql } from 'pretty-dql';

function transform(ast: any, comments?: any[]) {
  if (!ast || typeof ast !== 'object') {
    return;
  }

  if (Array.isArray(ast)) {
    ast.forEach((node) => transform(node, comments));
    return;
  }

  // Check for TaggedTemplateExpression: dql`...`
  if (
    ast.type === 'TaggedTemplateExpression' &&
    ast.tag.type === 'Identifier' &&
    ast.tag.name === 'dql'
  ) {
    formatTemplateLiteral(ast.quasi);
  }

  // Check for TemplateLiteral with comment: /* dql */ `...`
  if (ast.type === 'TemplateLiteral') {
    if (
      ast.leadingComments &&
      ast.leadingComments.some((comment: any) => comment.value.trim() === 'dql')
    ) {
      formatTemplateLiteral(ast);
    } else if (comments) {
      // Check global comments
      const start = ast.range ? ast.range[0] : ast.start;
      const precedingComment = comments.find((c) => {
        const end = c.range ? c.range[1] : c.end;
        return end < start && start - end < 20 && c.value.trim() === 'dql';
      });
      if (precedingComment) {
        formatTemplateLiteral(ast);
      }
    }
  }

  // Recurse
  for (const key in ast) {
    if (
      key !== 'loc' &&
      key !== 'range' &&
      key !== 'comments' &&
      key !== 'leadingComments' &&
      key !== 'tokens'
    ) {
      transform(ast[key], comments);
    }
  }
}

function formatTemplateLiteral(node: any) {
  if (node.quasis.length === 1) {
    const raw = node.quasis[0].value.raw;
    try {
      const formatted = formatDql(raw);
      // console.error('Formatted:', formatted);
      // Update the node
      node.quasis[0].value.raw = formatted;
      // We also need to update 'cooked' if possible, but 'raw' is what's used for printing usually?
      // Prettier uses 'raw' for printing template literals.
      node.quasis[0].value.cooked = formatted;
    } catch {
      // Ignore errors
    }
  }
}

const dqlPlugin: Plugin = {
  parsers: {
    dql: {
      parse: (text) => text, // Prettier requires a parser; we just return the raw text
      astFormat: 'dql', // Custom AST format identifier
      locStart: () => 0,
      locEnd: (node) => (typeof node === 'string' ? node.length : 0),
    },
    babel: {
      ...babelParsers.babel,
      parse: (text, options) => {
        const ast = babelParsers.babel.parse(text, options);
        transform(ast, ast.comments);
        return ast;
      },
    },
    typescript: {
      ...typescriptParsers.typescript,
      parse: (text, options) => {
        const ast = typescriptParsers.typescript.parse(text, options);
        transform(ast, ast.comments);
        return ast;
      },
    },
  },
  printers: {
    dql: {
      print: (path) => {
        const dql = path.getValue(); // Get the raw DQL string
        return formatDql(dql); // Format the DQL string using your function
      },
    },
  },
  languages: [
    {
      name: 'DQL',
      parsers: ['dql'],
      extensions: ['.dql'], // Optional: Add support for `.dql` files
      linguistLanguageId: 1406, // Arbitrary ID
    },
  ],
};

export = dqlPlugin;
