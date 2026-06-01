export default {
  // Eslint for TypeScript files
  "**/*.{ts,tsx}": ["pnpm exec eslint --fix"],
  // Prettier and Autocorrect for all files
  "**/*": ["pnpm exec prettier --write --ignore-unknown", "pnpm exec autocorrect --fix"],
};
