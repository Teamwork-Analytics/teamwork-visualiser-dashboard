const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@interfaces": path.resolve(__dirname, "./src/types"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
};
