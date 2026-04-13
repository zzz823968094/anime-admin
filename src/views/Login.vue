<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">⚙️</div>
        <h1 class="login-title">管理后台</h1>
        <p class="login-subtitle">动漫天堂</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">账号</label>
          <input
            v-model="form.account"
            type="text"
            class="ctrl login-input"
            placeholder="请输入账号"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="ctrl login-input" 
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
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
  background: var(--bg);
}

.login-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 0 20px var(--glow);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--sub);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.login-input {
  padding: 10px 14px;
  font-size: 14px;
}

.error-msg {
  color: #f87171;
  font-size: 13px;
  text-align: center;
  padding: 8px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 8px;
}

.login-btn {
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
