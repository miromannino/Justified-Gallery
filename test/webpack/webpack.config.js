module.exports = {
  entry: ['./index.js'],
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      justifiedGallery: '../../dist/js/jquery.justifiedGallery.js',
      jquery: '../../node_modules/jquery/dist/jquery'
    }
  }
};