module.exports = {
  collectCoverageFrom: [
    'src/**',
    'queryDispatcher/**',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test_config/setupTests.js',
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
  ],
  moduleNameMapper: {
    '~/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|git|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test_config/assetsTransformer.js',
    '\\.(css|less)$': '<rootDir>/test_config/assetsTransformer.js',
  },
};
