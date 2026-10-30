import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

export default defineConfig({
  define: {
    __OODLE_RUM_VERSION__: JSON.stringify(
      pkg.version,
    ),
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OodleRum',
      formats: ['es', 'cjs'],
      fileName: 'oodle-rum',
    },
    rollupOptions: {
      // OpenTelemetry stays out of dist. The app bundler resolves it
      // from our dependencies and keeps it in lazy chunks, so an app
      // with tracing off does not download it.
      external: [
        /^@opentelemetry\//,
        'zone.js',
      ],
    },
    sourcemap: false,
  },
  plugins: [
    dts({
      rollupTypes: true,
      exclude: ['**/*.test.ts'],
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
