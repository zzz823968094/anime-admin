/**
 * 表单验证工具
 */

// 验证规则
export const validators = {
  // 手机号验证（中国大陆）
  phone: (value) => {
    if (!value) return { valid: false, message: '请输入手机号' }
    const pattern = /^1[3-9]\d{9}$/
    return {
      valid: pattern.test(value),
      message: pattern.test(value) ? '' : '请输入有效的手机号'
    }
  },

  // 邮箱验证
  email: (value) => {
    if (!value) return { valid: false, message: '请输入邮箱' }
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      valid: pattern.test(value),
      message: pattern.test(value) ? '' : '请输入有效的邮箱地址'
    }
  },

  // URL验证
  url: (value) => {
    if (!value) return { valid: true, message: '' } // 可选字段
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    return {
      valid: pattern.test(value),
      message: pattern.test(value) ? '' : '请输入有效的URL地址'
    }
  },

  // 必填验证
  required: (value, fieldName = '此字段') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { valid: false, message: `${fieldName}不能为空` }
    }
    return { valid: true, message: '' }
  },

  // 最小长度验证
  minLength: (value, min, fieldName = '此字段') => {
    if (!value) return { valid: true, message: '' }
    const str = String(value)
    return {
      valid: str.length >= min,
      message: str.length >= min ? '' : `${fieldName}至少需要${min}个字符`
    }
  },

  // 最大长度验证
  maxLength: (value, max, fieldName = '此字段') => {
    if (!value) return { valid: true, message: '' }
    const str = String(value)
    return {
      valid: str.length <= max,
      message: str.length <= max ? '' : `${fieldName}不能超过${max}个字符`
    }
  },

  // 数字范围验证
  range: (value, min, max, fieldName = '此字段') => {
    if (value === '' || value === null || value === undefined) {
      return { valid: true, message: '' }
    }
    const num = Number(value)
    return {
      valid: num >= min && num <= max,
      message: num >= min && num <= max ? '' : `${fieldName}必须在${min}到${max}之间`
    }
  },

  // 账号验证（字母、数字、下划线，4-20位）
  account: (value) => {
    if (!value) return { valid: false, message: '请输入账号' }
    const pattern = /^[a-zA-Z0-9_]{4,20}$/
    return {
      valid: pattern.test(value),
      message: pattern.test(value) 
        ? '' 
        : '账号只能包含字母、数字、下划线，长度为4-20位'
    }
  },

  // 密码验证（至少8位，包含字母和数字）
  password: (value) => {
    if (!value) return { valid: false, message: '请输入密码' }
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    return {
      valid: pattern.test(value),
      message: pattern.test(value) 
        ? '' 
        : '密码至少8位，必须包含字母和数字'
    }
  },

  // 版本号验证（如：1.0.0）
  version: (value) => {
    if (!value) return { valid: false, message: '请输入版本号' }
    const pattern = /^\d+\.\d+\.\d+$/
    return {
      valid: pattern.test(value),
      message: pattern.test(value) ? '' : '版本号格式不正确（例如：1.0.0）'
    }
  }
}

/**
 * 表单验证器类
 */
export class FormValidator {
  constructor(rules = {}) {
    this.rules = rules
    this.errors = {}
  }

  /**
   * 验证单个字段
   */
  validateField(field, value) {
    const fieldRules = this.rules[field]
    if (!fieldRules) return { valid: true, message: '' }

    for (const rule of fieldRules) {
      let result
      
      if (typeof rule === 'function') {
        result = rule(value)
      } else if (rule.validator) {
        result = rule.validator(value)
      } else {
        continue
      }

      if (!result.valid) {
        this.errors[field] = result.message
        return result
      }
    }

    delete this.errors[field]
    return { valid: true, message: '' }
  }

  /**
   * 验证整个表单
   */
  validate(formData) {
    this.errors = {}
    let isValid = true

    for (const field in this.rules) {
      const value = formData[field]
      const result = this.validateField(field, value)
      
      if (!result.valid) {
        isValid = false
      }
    }

    return {
      valid: isValid,
      errors: this.errors
    }
  }

  /**
   * 清除错误
   */
  clearErrors() {
    this.errors = {}
  }

  /**
   * 清除单个字段错误
   */
  clearFieldError(field) {
    delete this.errors[field]
  }
}

/**
 * 创建表单验证器
 */
export function createFormValidator(rules) {
  return new FormValidator(rules)
}
