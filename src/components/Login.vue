<template>
  <div class="login-container">
    <el-form :model="loginForm" ref="loginForm" label-width="100px" class="login-form">
      <el-form-item
        label="用户名"
        prop="username"
        :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
      >
        <el-input
          v-model="loginForm.username"
          @input="onInput('username')"
          placeholder="请输入用户名"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="密码"
        prop="password"
        :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
      >
        <el-input
          type="password"
          v-model="loginForm.password"
          @input="onInput('password')"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
        <el-button @click="goToRegister">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import request from '@/utils/request'
import axios from 'axios'

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
      },
    }
  },

  
  methods: {
    onInput(field: keyof typeof this.loginForm) {
      console.log(this.loginForm[field]) // 确保输入及时更新
    },
    login() {
      // 校验表单
      ;(this.$refs.loginForm as ElForm).validate((valid: boolean) => {
        if (valid) {
          // 如果验证通过，进行登录请求
          console.log('登录数据:', this.loginForm)

          // 使用 axios 发送登录请求
          axios
            .post('http://localhost:8080/login', this.loginForm)
            .then((response) => {
              console.log('登录成功', response.data)
              const token = response.data;
              localStorage.setItem('token', token);
              console.log("Bearer:"+token);
              // 处理成功逻辑，如跳转到主页
              this.$router.push('/home')
            })
            .catch((error) => {
              console.error('登录失败', error)
              // 处理错误逻辑，如显示提示信息
            })
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    },
    goToRegister() {
      this.$router.push('/register')
    },
  },
}
</script>

<style scoped>
html,
body {
  height: 100%; /* 确保整个页面高度为100% */
  margin: 0; /* 去掉默认的外边距 */
}

.login-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100vh; /* 使容器的高度占满视口 */
}

.login-form {
  width: 400px; /* 设置表单的宽度 */
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
