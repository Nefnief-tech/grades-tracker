module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: ["default", { discardComments: { removeAll: true } }],
            // Adding more conservative settings to avoid CSS selector issues
            reduceIdents: false,
            zindex: false,
            discardUnused: false,
            mergeIdents: false,
          },
        }
      : {}),
  },
};
