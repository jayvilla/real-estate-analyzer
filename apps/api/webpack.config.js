const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  resolve: {
    alias: {
      '@real-estate-analyzer/types': join(
        __dirname,
        '../../libs/types/src/index.ts'
      ),
      '@real-estate-analyzer/ui': join(__dirname, '../../libs/ui/src/index.ts'),
    },
    // Resolve modules from workspace root node_modules first
    modules: [
      join(__dirname, '../../node_modules'),
      join(__dirname, 'node_modules'),
      'node_modules',
    ],
    // Follow symlinks (pnpm uses symlinks)
    symlinks: true,
  },
  resolveLoader: {
    modules: [
      join(__dirname, '../../node_modules'),
      join(__dirname, 'node_modules'),
      'node_modules',
    ],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMaps: true,
    }),
  ],
};
