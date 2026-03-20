import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  // Аналог ignorePatterns
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
  // Базові рекомендації ESLint та TypeScript
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // Інтеграція з Prettier
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      // Аналог env: { node: true, jest: true }
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    // Ваші кастомні правила
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
