import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  // ESM and UMD builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: '../dist/webax.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: '../dist/webax.esm.min.js',
        format: 'esm',
        plugins: [terser()],
        sourcemap: true
      },
      {
        file: '../dist/webax.js',
        format: 'umd',
        name: 'WebAX',
        sourcemap: true
      },
      {
        file: '../dist/webax.min.js',
        format: 'umd',
        name: 'WebAX',
        plugins: [terser()],
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  // Type definitions
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: '../dist/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];
