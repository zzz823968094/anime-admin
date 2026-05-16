import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    server: {
      port: 3001,
      open: true,
      // 代理配置 - 解决跨域问题
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      // 代码分割优化
      rollupOptions: {
        output: {
          // 分包策略
          manualChunks: {
            // Element Plus 单独打包
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            // Vue 相关库
            'vue-vendor': ['vue', 'vue-router'],
            // 工具库
            utils: ['axios', 'echarts']
          },
          // 减小chunk大小警告阈值
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      // 增大警告阈值到1MB
      chunkSizeWarningLimit: 1000,
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // 生产环境移除console
          drop_debugger: true
        }
      }
    }
  }
})
