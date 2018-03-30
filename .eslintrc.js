module.exports = {
  // Enable core eslint rules, see: http://eslint.org/docs/rules/
  extends: "eslint:recommended",
  // Additional rules
  rules: {
    "brace-style": ["warn", "1tbs"],
    indent: ["warn", 2, { SwitchCase: 1 }],
    "max-len": ["warn", 100, { ignoreUrls: true }],
    "no-mixed-spaces-and-tabs": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }]
  },
  env: {
    browser: true,
    commonjs: true,
    jquery: true,
    es6: true
  },
  globals: {
    p5: false,
    ga: false,
    objectFitImages: false,
    smartquotes: false
  }
};
