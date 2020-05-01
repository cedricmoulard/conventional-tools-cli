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
    "prettier"
  ],
  "ignorePatterns": ["node_modules/"],
  "rules": {
    "@typescript-eslint/member-delimiter-style":"off",
    "@typescript-eslint/type-annotation-spacing":"off"
  }
}
