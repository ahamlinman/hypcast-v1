module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017,
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "arrow-spacing": [ "error" ],
        "block-spacing": [ "error", "always" ],
        "brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],
        "camelcase": [ "error" ],
        "comma-dangle": [ "error", "always-multiline" ],
        "comma-spacing": [ "error", { "before": false, "after": true } ],
        "comma-style": [ "error", "last" ],
        "computed-property-spacing": [ "error", "never" ],
        "curly": [ "error", "all" ],
        "dot-location": [ "error", "property" ],
        "dot-notation": [ "error" ],
        "eol-last": [ "error" ],
        "eqeqeq": [ "error", "always" ],
        "func-call-spacing": [ "error", "never" ],
        "func-name-matching": [ "error" ],
        "func-names": [ "error", "as-needed" ],
        "indent": [ "error", 2 ],
        "key-spacing": [ "error", ],
        "keyword-spacing": [ "error" ],
        "linebreak-style": [ "error", "unix" ],
        "new-cap": [ "error" ],
        "new-parens": [ "error" ],
        "no-await-in-loop": [ "error" ],
        "no-duplicate-imports": [ "error" ],
        "no-else-return": [ "error" ],
        "no-extra-bind": [ "error" ],
        "no-floating-decimal": [ "error" ],
        "no-labels": [ "error" ],
        "no-lonely-if": [ "error" ],
        "no-loop-func": [ "error" ],
        "no-mixed-operators": [ "error" ],
        "no-multi-spaces": [ "error" ],
        "no-restricted-syntax": [ "error", "BinaryExpression[operator='in']" ],
        "no-return-assign": [ "error" ],
        "no-return-await": [ "error" ],
        "no-sequences": [ "error" ],
        "no-sync": [ "error" ],
        "no-tabs": [ "error" ],
        "no-template-curly-in-string": [ "error" ],
        "no-trailing-spaces": [ "error" ],
        "no-unmodified-loop-condition": [ "error" ],
        "no-unneeded-ternary": [ "error" ],
        "no-unused-expressions": [ "error" ],
        "no-useless-call": [ "error" ],
        "no-useless-computed-key": [ "error" ],
        "no-useless-concat": [ "error" ],
        "no-useless-constructor": [ "error" ],
        "no-useless-escape": [ "error" ],
        "no-useless-rename": [ "error" ],
        "no-useless-return": [ "error" ],
        "no-var": [ "error" ],
        "no-whitespace-before-property": [ "error" ],
        "object-curly-spacing": [ "error", "always" ],
        "object-property-newline": [ "error", { "allowMultiplePropertiesPerLine": true } ],
        "object-shorthand": [ "error", "always" ],
        "operator-assignment": [ "error", "always" ],
        "operator-linebreak": [ "error", "after" ],
        "padded-blocks": [ "error", "never" ],
        "prefer-rest-params": [ "error" ],
        "prefer-spread": [ "error" ],
        "prefer-template": [ "error" ],
        "quote-props": [ "error", "as-needed" ],
        "quotes": [ "error", "single" ],
        "require-await": [ "error" ],
        "rest-spread-spacing": [ "error", "never" ],
        "semi": [ "error", "always" ],
        "semi-spacing": [ "error", { "before": false, "after": true } ],
        "space-before-blocks": [ "error", "always" ],
        "space-before-function-paren": [ "error", "never" ],
        "space-infix-ops": [ "error" ],
        "space-unary-ops": [ "error", { "words": true, "nonwords": false } ],
        "wrap-iife": [ "error", "inside" ],
        "yoda": [ "error", "never" ],

        "arrow-body-style": [ "warn", "as-needed" ],
        "arrow-parens": [ "warn" ],
        "jsx-quotes": [ "warn", "prefer-single" ],
        "object-curly-newline": [ "warn" ],
        "prefer-const": [ "warn" ],
        "prefer-destructuring": [ "warn" ],

        "react/jsx-uses-react": [ "error" ],
        "react/jsx-uses-vars": [ "error" ],
        "react/react-in-jsx-scope": [ "error" ],
    }
};
