// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  entry: 'reactive-react/index.js',
  dest: 'build/reactive-react.js',
  format: 'iife',
  sourceMap: 'inline',
  moduleName: 'reactive-react',
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