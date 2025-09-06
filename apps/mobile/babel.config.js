module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@superque/shared': '../../packages/shared/src',
          },
          extensions: ['.tsx', '.ts', '.js', '.json'],
        },
      ],
    ],
  };
};
