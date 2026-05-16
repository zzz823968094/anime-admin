/**
 * 表单验证工具
 */

/**
 * 验证结果接口
 */
interface ValidationResult {
  valid: boolean
  message: string
}

/**
 * 验证规则函数类型
 */
type ValidatorFunction = (value: unknown) => ValidationResult

/**
 * 验证规则配置
 */
interface RuleConfig {
  validator?: ValidatorFunction
  [key: string]: unknown
}

/**
 * 验证规则映射
 */
type ValidationRules = Record<string, Array<ValidatorFunction | RuleConfig>>

/**
 * 错误信息映射
 */
type ErrorMap = Record<string, string>

// 验证规则
/**
 * 表单验证器类
 */
export class FormValidator {
  private rules: ValidationRules
  public errors: ErrorMap

  constructor(rules: ValidationRules = {}) {
    this.rules = rules
    this.errors = {}
  }

  /**
   * 验证单个字段
   */
  validateField(field: string, value: unknown): ValidationResult {
    const fieldRules = this.rules[field]
    if (!fieldRules) {
      return { valid: true, message: '' }
    }

    for (const rule of fieldRules) {
      let result: ValidationResult

      if (typeof rule === 'function') {
        result = (rule as ValidatorFunction)(value)
      } else if ((rule as RuleConfig).validator) {
        result = (rule as RuleConfig).validator!(value)
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
  validate(formData: Record<string, unknown>): { valid: boolean; errors: ErrorMap } {
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
  clearErrors(): void {
    this.errors = {}
  }

  /**
   * 清除单个字段错误
   */
  clearFieldError(field: string): void {
    delete this.errors[field]
  }
}

/**
 * 创建表单验证器
 */
export function createFormValidator(rules: ValidationRules): FormValidator {
  return new FormValidator(rules)
}
