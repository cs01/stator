module.exports = {
  entry: './src/index.js',
  output: {
    filename: './build/index.js'
  },
  module: {
    rules: [
      { test: /\.js$/,
        use: [
        'babel-loader',
        'eslint-loader',
        ],
        exclude: /node_modules/
      },
      { test: /\.jsx$/,
        use: [
          'babel-loader',
          'eslint-loader',
        ],
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map'
}
