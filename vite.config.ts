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
      external: [
        /^@opentelemetry\//,
        'zone.js',
      ],
    },
    sourcemap: false,
  },
  plugins: [dts({ rollupTypes: true })],
});
