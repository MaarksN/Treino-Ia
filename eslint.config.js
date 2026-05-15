import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'build', 'node_modules', 'android', 'coverage', '.capacitor', '.lighthouseci'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'preserve-caught-error': 'off',
      'react-hooks/static-components': 'off',
      'prefer-const': 'off',
      'no-empty': 'off',
      'no-useless-assignment': 'off'
    },
  }
);
