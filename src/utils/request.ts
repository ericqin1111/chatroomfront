/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 20:11:14
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-07 00:39:32
 * @FilePath: \chatroomreal\src\utils\request.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios,{type InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8080', // 后端地址
  timeout: 5000,
})

// // 请求拦截器：自动携带 token
// request.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token')
    
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`
//     }

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// export default request



// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Axios 通常会确保 config.headers 是一个 AxiosHeaders 对象。
    // 如果在极少数情况下它可能是 undefined/null，可以这样安全地初始化：
    if (!config.headers) {
      config.headers = new AxiosHeaders(); // <--- 使用 AxiosHeaders 初始化
    }

    const token = localStorage.getItem('token');
    if (token) {
      // 使用 .set() 方法来设置头部，这是 AxiosHeaders 的标准方法
      config.headers.set('Authorization', `Bearer ${token}`);
      // 或者直接属性赋值也可以，但 .set() 更规范
      // config.headers['Authorization'] = `Bearer ${token}`;
    }

    // --- 确保 POST/PUT/PATCH 等有数据体的方法，如果数据是对象，则设置 Content-Type ---
    if (config.data && typeof config.data === 'object' &&
        !(config.data instanceof FormData) &&
        !(config.data instanceof URLSearchParams)
       ) {
        // 只有当 Content-Type 尚未被用户在请求时显式设置时才添加
        if (!config.headers.has('Content-Type')) { // <--- 使用 .has() 方法检查
            config.headers.set('Content-Type', 'application/json'); // <--- 使用 .set() 方法设置
        }
        // 注意：Axios 默认在 Content-Type 是 application/json 且 data 是对象时，
        // 会自动 JSON.stringify(config.data)。
        // 如果你之前在 store action 中手动 JSON.stringify 了，这里可能需要调整，
        // 最佳实践是让 Axios 来处理对象的序列化。
    }

    console.log('[Axios Request Interceptor] Final Headers being sent:', JSON.stringify(config.headers));
    console.log('[Axios Request Interceptor] Data type:', typeof config.data);

    return config;
  },
  (error) => {
    console.error('[Axios Request Interceptor] Error:', error);
    return Promise.reject(error);
  }
);

export default request;
