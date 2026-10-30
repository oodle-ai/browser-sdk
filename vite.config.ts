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
      // Tracing is its own entry, so the main bundle never names the
      // optional OpenTelemetry packages (see core/tracing-loader.ts).
      entry: {
        'oodle-rum': 'src/index.ts',
        tracing: 'src/tracing.ts',
      },
      name: 'OodleRum',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
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
