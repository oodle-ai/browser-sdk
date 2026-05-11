import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
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
