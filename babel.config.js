module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // Hermes cannot parse the ES2024 `v` regex flag used by some dependencies.
    // Transpile it to an equivalent Hermes-compatible regular expression.
    plugins: [
      '@babel/plugin-transform-unicode-sets-regex',
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-transform-dynamic-import',
    ],
  };
};
