module.exports = {
  displayName: 'apartment-finder',
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/**/__tests__/*.spec.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
}
