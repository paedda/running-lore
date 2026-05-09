import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'server',
          include: ['packages/server/src/**/*.test.ts'],
        },
      },
      {
        extends: './packages/client/vite.config.ts',
        test: {
          name: 'client',
          environment: 'jsdom',
          setupFiles: './packages/client/src/test-setup.ts',
          include: ['packages/client/src/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});
