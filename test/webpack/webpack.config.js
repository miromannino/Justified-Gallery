module.exports = {
  entry: ['./index.js'],
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      justifiedGallery: '../../dist/js/jquery.justifiedGallery.js',
      jquery: '../../bower_components/jquery/dist/jquery'
    }
  }
};