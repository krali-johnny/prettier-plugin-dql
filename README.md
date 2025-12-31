# prettier-plugin-dql

A Prettier plugin to format DQL (Dynatrace Query Language) strings using a custom formatter.

## Installation

```bash
npm install --save-dev prettier prettier-plugin-dql
# or
pnpm add -D prettier prettier-plugin-dql
# or
yarn add -D prettier prettier-plugin-dql
```

## Usage

Add the plugin to your Prettier configuration (.prettierrc or prettier.config.js):

```json
{
  "plugins": ["prettier-plugin-dql"]
}
```

Or use it via the CLI:

```bash
prettier --plugin prettier-plugin-dql .
```

## Development

### Scripts

- `npm run build`: Compiles the TypeScript code.
- `npm run format`: Formats the codebase using Prettier.
- `npm run check:format`: Checks if the codebase is formatted correctly.

## License

MIT

