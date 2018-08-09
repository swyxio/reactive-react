// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  entry: 'reactivereact/index.js',
  dest: 'build/reactivereact.js',
  format: 'iife',
  sourceMap: 'inline',
  moduleName: 'reactivereact',
  plugins: [
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      plugins: [
        "transform-object-rest-spread",
        "transform-class-properties",
        [
          "transform-react-jsx",
          {}
        ]
      ],
      exclude: 'node_modules/**',
    }),
  ],
};