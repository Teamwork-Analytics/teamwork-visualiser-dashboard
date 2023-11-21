const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@constants": path.resolve(__dirname, "./src/shared/constants"),
      "@components": path.resolve(__dirname, "./src/shared/components"),
      "@utils": path.resolve(__dirname, "./src/shared/utils"),
      "@interfaces": path.resolve(__dirname, "./src/shared/types"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
};
