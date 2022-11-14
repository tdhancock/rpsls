const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: { 
      rules: [
        {
          test: /\.(html)$/,
          exclude: /(node_modules)/,
          use: {
            loader: "html-loader"
          }
      }
      ]
    }
  }
})
