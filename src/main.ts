import { createApp, type Component } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
// @ts-ignore - Element Plus 语言包模块
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
// 关键：引入暗黑模式变量
import 'element-plus/theme-chalk/dark/css-vars.css'
// 引入自定义主题变量
import './styles/theme.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/global.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as Component)
}

app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
app.mount('#app')
