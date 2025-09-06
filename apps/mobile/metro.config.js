const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so changes in packages/shared are picked up
config.watchFolders = [workspaceRoot];

// Ensure Metro resolves modules from the app and the workspace root
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],
  disableHierarchicalLookup: true,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;
