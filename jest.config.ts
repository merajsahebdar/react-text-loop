const config = {
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  transformIgnorePatterns: ['/node_modules/'],
};

export default config;
