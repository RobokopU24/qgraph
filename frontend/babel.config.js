module.exports = {
  presets: [
    "@babel/preset-react",
    ['@babel/preset-env', {
      targets: {
        node: 'current',
        esmodules: false,
      },
      modules: 'commonjs',
      debug: true,
    }],
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
  ],
}
