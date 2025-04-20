module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true,
                },
                // Disable problematic CSS optimizations that could break selectors
                mergeIdents: false,
                reduceIdents: false,
                zindex: false,
                discardUnused: false,
                minifySelectors: {
                  // Disable complicated selector minification
                  removeQuotedValues: false,
                },
              },
            ],
          },
        }
      : {}),
  },
};
