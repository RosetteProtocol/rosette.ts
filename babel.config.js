
module.exports = {
  presets: ['@babel/preset-typescript', '@babel/preset-react'],

  overrides: [
    {
      include: ['./packages/rosette-core', './packages/rosette-react'],
      presets: [['@babel/preset-env', { targets: 'defaults, not ie 11' }]],
    },
  ],
}
