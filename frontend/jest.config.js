module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**',
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
    '\\.(yml)$': '<rootDir>/test_config/assetsTransformer.js',
    // https://testing-library.com/docs/react-testing-library/setup#configuring-jest-with-test-utils
    '&/(.*)$': '<rootDir>/tests/common/$1',
  },
};
