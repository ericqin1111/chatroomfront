<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 13:22:50
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-04-20 20:18:47
 * @FilePath: \chatroomreal\src\components\Register.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="reg-container">
    <el-form
      :model="registerForm"
      ref="formRef"
      :rules="rules"
      label-width="100px"
      class="register-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          v-model="registerForm.password"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          type="password"
          v-model="registerForm.confirmPassword"
          placeholder="确认密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="register">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElFormItemRule } from 'element-plus'
import axios from 'axios'
import request from '@/utils/request';

export default defineComponent({


  name: 'Register',
  setup() {
    // 表单数据
    const registerForm = ref({
      username: '',
      password: '',
      confirmPassword: '',
    })

    const confirmPasswordValidator = (
      rule: ElFormItemRule,
      value: string,
      callback: (error?: string) => void,
    ) => {
      if (value !== registerForm.value.password) {
        callback('密码和确认密码不一致')
      } else {
        callback() // 校验通过
      }
    }
    // 表单验证规则
    const rules = ref({
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: confirmPasswordValidator, trigger: 'blur' },
      ],
    })

    // 验证密码与确认密码是否一致

    // 发送表单数据到后端
    const register = () => {
      if (
        registerForm.value.username &&
        registerForm.value.password &&
        registerForm.value.confirmPassword
      ) {
        request.post("http://localhost:8080/register",registerForm.value)
          .then((response) => {
            console.log('注册成功', response.data)
            // 这里可以处理后端返回的响应数据
          })
          .catch((error) => {
            console.error('注册失败', error)
          })
      } else {
        console.log('请填写完整的注册信息')
      }
    }

    return {
      registerForm,
      rules,
      register,
    }
  },
})
</script>

<style scoped>
.reg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-form {
  width: 400px; /* 设置表单的宽度 */
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
