import { Plugin } from 'prettier';

import { formatDql } from 'pretty-dql';

const dqlPlugin: Plugin = {
  parsers: {
    dql: {
      parse: (text) => text, // Prettier requires a parser; we just return the raw text
      astFormat: 'dql', // Custom AST format identifier
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
      linguistLanguageId: 1000, // Arbitrary ID
    },
  ],
};

export default dqlPlugin;
