import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'lib/main.ts',
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [commonjs(), typescript(), uglify()]
};