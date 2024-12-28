export default {
  build: {
    target: 'esnext' //browsers can handle the latest ES features
  },
  optimizeDeps: {
    exclude: ['@babylonjs/havok']
  }
}