import router from '@/router';
import axios from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import { useLoginStore } from '@/stores/loginStore';
import { CloseBold } from '@element-plus/icons-vue'
const request = axios.create({
  // baseURL: 'http://103.38.83.156:8081'
  // baseURL: 'http://localhost:8081'
  baseURL: `${import.meta.env.VITE_SERVER_URL}`


})
// 响应拦截器
request.interceptors.response.use(
  response => {
    // 2xx 范围内的状态码会触发此函数

    // 如果您的 API 返回统一响应结构，可以在这里处理

    // 示例：假设 API 返回 { code: 0, data: {}, message: 'success' }
    if (response.data.code === 1) {
      return response;
    } else {
      // 业务逻辑错误处理
      const errorMessage = response.data.msg || '操作失败，请稍后重试';
      ElMessage({
        message: errorMessage,
        type: 'error',
      })
      return Promise.reject(new Error(errorMessage));
    }
  },
  error => {
    // 超出 2xx 范围的状态码会触发此函数

    // 错误处理
    let errorMessage = '网络错误，请稍后重试';

    if (error.response) {
      // 请求已发出，服务器返回状态码不在 2xx 范围内
      const status = error.response.status;

      switch (status) {
        case 400:
          errorMessage = '请求参数错误';
          break;
        case 401:
          errorMessage = '登录已过期，请重新登录';
          useLoginStore().logout();
          router.push('/');
          break;
        case 403:
          errorMessage = '没有权限执行此操作';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        case 503:
          errorMessage = '服务不可用';
          break;
        default:
          errorMessage = `服务器错误 [${status}]`;
      }

      // 如果有响应数据，使用服务器提供的错误信息
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接';
      } else {
        errorMessage = '网络连接异常，请检查网络设置';
      }
    } else {
      // 发送请求时出了点问题
      errorMessage = '请求发送失败，请重试';
    }

    // 返回一个被拒绝的 Promise，将错误信息传递下去
    ElMessage({
      message: errorMessage,
      type: 'error',
    })
    return Promise.reject(new Error(errorMessage));
  }
);

//请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 添加token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = `${token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
)
export default request