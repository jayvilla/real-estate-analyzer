//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  transpilePackages: ['@real-estate-analyzer/ui', '@real-estate-analyzer/types'],
  webpack: (config, { isServer }) => {
    const webpack = require('webpack');
    
    // Alias @real-estate-analyzer/types to use Next.js-compatible entry point
    config.resolve.alias = {
      ...config.resolve.alias,
      '@real-estate-analyzer/types': path.resolve(
        __dirname,
        '../../libs/types/src/index.next.ts'
      ),
    };

    // Use NormalModuleReplacementPlugin to replace index.ts with index.next.ts
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /libs\/types\/src\/index\.ts$/,
        path.resolve(__dirname, '../../libs/types/src/index.next.ts')
      )
    );

    // Also add extension alias for .js -> .ts resolution
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };

    return config;
  },
  // Disable Turbopack to use webpack (which respects our custom resolver)
  experimental: {
    turbo: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
