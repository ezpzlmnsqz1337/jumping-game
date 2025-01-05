export default {
  build: {
    target: 'esnext', //browsers can handle the latest ES features
    outDir: './multiplayer-server/dist',
    emptyOutDir: true, // also necessary
  },
  optimizeDeps: {
    exclude: ['@babylonjs/havok']
  }
}