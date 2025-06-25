export default {
  preset: "../../jest.preset.js",
  rootDir: ".",
  roots: [
    "<rootDir>/test/",
  ],
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "../../tsconfig.spec.json",
      },
    ],
  },
}