const babelConfig = require('../babel.config');

describe('Babel Configuration', () => {
  it('should have the correct presets', () => {
    expect(babelConfig.presets).toEqual([
      ['@babel/preset-env', { targets: { node: 'current' } }],
    ]);
  });
});