import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'lib/main.ts',
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    json(),
    commonjs(), 
    typescript()
  ]
};