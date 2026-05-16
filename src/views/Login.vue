<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <h1 class="login-title">管理后台</h1>
        <p class="login-subtitle">动漫天堂</p>
      </div>
      <el-form :model="form" class="login-form" label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input
            v-model="form.account"
            type="text"
            placeholder="请输入账号"
            clearable
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-alert
          v-if="errorMsg"
          :title="errorMsg"
          type="error"
          show-icon
          :closable="false"
          class="error-alert"
        />
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { login } from '@/api/auth'
  import type { LoginParams } from '@/types/api'

  const router = useRouter()
  const form = reactive<LoginParams>({
    account: '',
    password: ''
  })
  const loading = ref(false)
  const errorMsg = ref('')

  const handleLogin = async () => {
    if (!form.account || !form.password) {
      errorMsg.value = '请输入账号和密码'
      return
    }

    loading.value = true
    errorMsg.value = ''

    try {
      const res = await login({
        account: form.account,
        password: form.password
      })

      // 保存 token
      localStorage.setItem('ms_token', res.data.access_token)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('登录失败:', error)
      errorMsg.value = error?.message || '登陆失败，请检查账号密码'
      ElMessage.error(errorMsg.value)
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
    width: 100%;
    max-width: 480px;
    border-radius: 12px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .login-title {
    font-size: 32px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px;
  }

  .login-subtitle {
    font-size: 18px;
    color: var(--secondary);
    margin: 0;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .error-alert {
    margin-top: 8px;
  }

  .login-btn {
    width: 100%;
    margin-top: 8px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--text);
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
  }
</style>
