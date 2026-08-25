import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import esbuild from 'rollup-plugin-esbuild';

const core = [
  nodeResolve({ extensions: ['.ts', '.js'] }),
  esbuild({ target: 'es2015' })
];

const min = [
  ...core,
  terser({
    compress: { passes: 3, unsafe: true },
    mangle: { properties: { regex: /^_/, reserved: ['_r', '_o', '_d'] } }
  })
];

export default [
  {
    input: 'src/index.ts',
    output: { file: 'dist/vibe.esm.js', format: 'es' },
    plugins: core
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/vibe.min.js', format: 'iife', name: 'Vibe' },
    plugins: min
  },
  {
    input: 'src/full.ts',
    output: { file: 'dist/vibe-full.esm.js', format: 'es' },
    plugins: core
  },
  {
    input: 'src/full.ts',
    output: { file: 'dist/vibe-full.min.js', format: 'iife', name: 'Vibe' },
    plugins: min
  }
];
