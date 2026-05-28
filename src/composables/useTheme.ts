import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'
export type ColorTheme = '' | 'theme-red' | 'theme-green' | 'theme-purple' | 'theme-orange'

const THEME_KEY = 'admin-theme'
const COLOR_THEME_KEY = 'admin-color-theme'

// 获取初始主题
const getInitialTheme = (): Theme => {
  // 1. 优先从 localStorage 读取
  const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme
  }
  
  // 2. 其次跟随系统偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  // 3. 默认浅色
  return 'light'
}

// 获取初始颜色主题
const getInitialColorTheme = (): ColorTheme => {
  const savedColorTheme = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme | null
  if (savedColorTheme && ['', 'theme-red', 'theme-green', 'theme-purple', 'theme-orange'].includes(savedColorTheme)) {
    return savedColorTheme
  }
  return ''
}

export function useTheme() {
  const theme = ref<Theme>(getInitialTheme())
  const colorTheme = ref<ColorTheme>(getInitialColorTheme())
  
  // 应用主题到 DOM（无动画）
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  // 应用颜色主题
  const applyColorTheme = (newColorTheme: ColorTheme) => {
    // 移除所有颜色主题类
    document.documentElement.classList.remove('theme-red', 'theme-green', 'theme-purple', 'theme-orange')
    // 添加当前颜色主题
    if (newColorTheme) {
      document.documentElement.classList.add(newColorTheme)
    }
  }
  
  // 使用 View Transitions API 切换主题（带动画）
  const toggleThemeWithTransition = async (event?: MouseEvent) => {
    // 如果不支持 View Transitions API，直接切换
    if (!document.startViewTransition) {
      toggleTheme()
      return
    }

    // 记录当前主题状态（切换前）
    const wasDark = theme.value === 'dark'

    // 计算圆心位置
    let x: number, y: number
    
    if (wasDark) {
      // 从深色切换到浅色：圆心在左下角
      x = 0
      y = window.innerHeight
    } else {
      // 从浅色切换到深色：圆心在右上角
      x = window.innerWidth
      y = 0
    }

    // 计算到对角的最大距离作为半径
    const endRadius = Math.hypot(window.innerWidth, window.innerHeight)

    // 启动视图过渡
    const transition = document.startViewTransition(() => {
      // 在回调中更新主题
      theme.value = theme.value === 'light' ? 'dark' : 'light'
    })

    // 等待过渡准备好
    await transition.ready

    // 定义 clip-path 动画关键帧（从 0 扩散到全屏）
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]

    // 两个方向都使用新快照做扩散动画
    // 从浅色到深色：新快照（深色）从左下角扩散
    // 从深色到浅色：新快照（浅色）从右上角扩散
    document.documentElement.animate(
      {
        clipPath: clipPath
      },
      {
        duration: 450,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  }
  
  // 切换主题（简单版本，无动画）
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  // 设置主题
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }
  
  // 设置颜色主题
  const setColorTheme = (newColorTheme: ColorTheme) => {
    colorTheme.value = newColorTheme
  }
  
  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }, { immediate: true })
  
  // 监听颜色主题变化
  watch(colorTheme, (newColorTheme) => {
    applyColorTheme(newColorTheme)
    localStorage.setItem(COLOR_THEME_KEY, newColorTheme)
  }, { immediate: true })
  
  // 监听系统主题变化
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_KEY)) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // 清理监听器
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })
  
  return {
    theme,
    colorTheme,
    toggleTheme,
    toggleThemeWithTransition,
    setTheme,
    setColorTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
}
