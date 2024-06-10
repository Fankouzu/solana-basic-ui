const withNextra = require("nextra");
module.exports = withNextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(sa|sc|c)ss$/,
      use: [
        {
          loader: "sass-loader",
          options: {
            sassOptions: {
              includePaths: ["./node_modules"],
            },
          },
        },
      ],
    });

    return config;
  },
});
