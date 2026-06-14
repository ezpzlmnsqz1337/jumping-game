export default {
  build: {
    target: 'esnext', //browsers can handle the latest ES features
    outDir: './multiplayer-server/dist',
    emptyOutDir: true, // also necessary
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/gui', '@babylonjs/loaders'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@babylonjs/havok']
  }
}