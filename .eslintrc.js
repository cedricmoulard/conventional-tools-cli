module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "settings": {
    "import/resolver": {
      typescript: {}
    }
  },
  "plugins": ["jest"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018,
    "project": ["tsconfig.json", "test/tsconfig.json"],
    "sourceType": "module"
  },
  "extends": [
    "eslint:recommended",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "plugin:jest/recommended"
  ],
  "ignorePatterns": ["node_modules/"],
  "rules": {
    "@typescript-eslint/no-unsafe-call":"warn",
    "@typescript-eslint/no-unsafe-assignment":"warn",
    "@typescript-eslint/no-unsafe-member-access":"off",
    "@typescript-eslint/member-delimiter-style":"off",
    "@typescript-eslint/type-annotation-spacing":"off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error"
  }
}
