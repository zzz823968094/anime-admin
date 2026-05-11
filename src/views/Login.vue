<template>
  <div class="login-container dark-section">
    <div class="login-card">
      <div class="login-header">
        <h1 class="display-hero login-title">管理后台</h1>
        <p class="sub-heading login-subtitle">动漫天堂</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label body-emphasis">账号</label>
          <input
            v-model="form.account"
            type="text"
            class="ctrl login-input"
            placeholder="请输入账号"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label body-emphasis">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="ctrl login-input" 
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="errorMsg" class="error-msg caption">{{ errorMsg }}</div>
        <button type="submit" class="btn btn-primary login-btn body-text" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'

const router = useRouter()
const form = reactive({
  account: '',
  password: ''
})
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await login({
      account: form.account,
      password: form.password
    })
    
    // 保存 token
    localStorage.setItem('ms_token', res.data.access_token)
    router.push('/dashboard')
  } catch (error) {
    console.log(error)
    errorMsg.value = "登陆失败，请检查账号密码"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);               /* 页面背景 #f5f5f7 */
}

.login-card {
  background: var(--card);             /* 卡片背景 #ffffff */
  border-radius: 28px;                 /* 28px 圆角 */
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);  /* 规范轻阴影 */
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  color: var(--text);                  /* 主文字 #1d1d1f */
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 21px;
  color: var(--secondary);             /* 次要文字 #86868b */
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: var(--text);
}

.login-input {
  background: var(--card);
  border: 1px solid var(--border);     /* 浅细边框 */
  color: var(--text);
  padding: 12px 16px;
  font-size: 17px;
  border-radius: 8px;                  /* 8px 圆角 */
}

.login-input::placeholder {
  color: var(--secondary);
}

.error-msg {
  color: var(--danger);                /* 危险 #ff3b30 */
  text-align: center;
  padding: 8px;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 8px;
}

.login-btn {
  padding: 14px;
  font-size: 17px;
  margin-top: 8px;
  border-radius: 8px;                  /* 8px 圆角，禁止 980px */
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
