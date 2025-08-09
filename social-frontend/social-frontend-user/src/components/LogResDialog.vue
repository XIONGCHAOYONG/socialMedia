<template>
  <div class="all">
    <div class="first">

      <div ref="toRegister" class="toRegister">
        <h2>还没有账号?快去注册叭！</h2>
        <button @click="zhuce" class="toregbtn">注册</button>
      </div>


      <div ref="login" class="login">
        <div class="close" @click="closeDialog"></div>
        <h1>登录</h1>
        <div class="l">
          <ul class="list">
            <li>账号:</li>
            <li>密码:</li>
            <li>验证码:</li>
          </ul>
          <ul class="loginData">
            <li><input type="text" placeholder="请输入账号" v-model="account"></li>
            <li><input type="text" placeholder="请输入密码" v-model="password"></li>
            <li style="position:relative;">
              <input type="text" placeholder="请输入验证码" v-model="inputCode" style="width:100%;box-sizing:border-box;" />
              <span :title="'点击刷新验证码'" @click="refreshCode"
                style="position:absolute;right:0;bottom:-1.2em;user-select:none;cursor:pointer;display:inline-block;font-size:1.2rem;padding:0.2em 0.8em;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;letter-spacing:0.2em;">
                {{ verifyCode }}
              </span>
            </li>
          </ul>
        </div>
        <button class="loginBtn" @click="loginEvent">登录</button>
      </div>
    </div>



    <div class="then">

      <div ref="toLogin" class="toLogin">
        <h2>注册好啦?去登录叭！</h2>
        <button @click="denglu" class="toLoginBtn">登录</button>
        <div class="close" @click="closeDialog"></div>
      </div>

      <div ref="register" class="register">
        <h2>注册</h2>
        <div class="l">
          <ul class="list">
            <li>账号:</li>
            <li>昵称:</li>
            <li>密码:</li>
            <li>验证码:</li>
          </ul>
          <ul class="loginData">
            <li><input type="text" placeholder="请输入账号" v-model="account"></li>
            <li><input type="text" placeholder="请输入昵称" v-model="username"></li>
            <li><input type="text" placeholder="请输入密码" v-model="password"></li>
            <li style="position:relative;">
              <input type="text" placeholder="请输入验证码" v-model="inputCode" style="width:100%;box-sizing:border-box;" />
              <span :title="'点击刷新验证码'" @click="refreshCode"
                style="position:absolute;right:0;bottom:-1.2em;user-select:none;cursor:pointer;display:inline-block;font-size:1.2rem;padding:0.2em 0.8em;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;letter-spacing:0.2em;">
                {{ verifyCode }}
              </span>
            </li>
          </ul>
        </div>
        <button class="regBtn" @click="registerEvent">注册</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/stores/loginStore';
import { ElNotification, ElLoading } from 'element-plus';
import { CloseBold } from '@element-plus/icons-vue';
import api from '@/api';
import { onMounted } from 'vue';

const router = useRouter();

//清空输入框
const clean = () => {
  account.value = ''
  password.value = ''
  username.value = ''
  inputCode.value = ''
  refreshCode();
}

//登录功能实现
const loginStore = useLoginStore();
const account = ref('');
const password = ref('');

// 验证码相关变量
/** 当前生成的验证码 */
const verifyCode = ref('');
/** 用户输入的验证码 */
const inputCode = ref('');

/**
 * 生成一个4位随机验证码（数字+字母）
 * @returns {string} 生成的验证码
 */
function generateCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 刷新验证码
 */
function refreshCode() {
  verifyCode.value = generateCode();
}

/** 登录加载实例 */
let loadingInstance = null;

/**
 * 登录事件处理
 * @returns {Promise<void>}
 */
const loginEvent = async () => {
  // 输入框为空校验
  if (!account.value.trim()) {
    ElNotification({
      type: 'error',
      title: '账号不能为空',
      message: '请输入账号',
      closeIcon: CloseBold,
    });
    return;
  }
  if (!password.value.trim()) {
    ElNotification({
      type: 'error',
      title: '密码不能为空',
      message: '请输入密码',
      closeIcon: CloseBold,
    });
    return;
  }
  if (!inputCode.value.trim()) {
    ElNotification({
      type: 'error',
      title: '验证码不能为空',
      message: '请输入验证码',
      closeIcon: CloseBold,
    });
    return;
  }
  // 校验验证码
  if (inputCode.value.trim().toLowerCase() !== verifyCode.value.toLowerCase()) {
    ElNotification({
      type: 'error',
      title: '验证码错误',
      message: '验证码输入错误，请重新输入',
      closeIcon: CloseBold,
    });
    refreshCode();
    inputCode.value = '';
    return;
  }
  loadingInstance = ElLoading.service({
    lock: true,
    text: '登录中...请稍候',
    background: 'rgba(0, 0, 0, 0.3)'
  });
  try {
    const res = await api.User.login({
      account: account.value,
      password: password.value
    })
    loginStore.setToken(res.data.data.token)
    const code = res.data.code;
    await loginStore.fetchUser(res.data.data.id)
    clean()
    if (code === 1) {
      ElNotification({
        type: 'success',
        title: 'success',
        message: '登陆成功啦!',
        closeIcon: CloseBold,
      })
      router.push('/chat')
    }
  } catch (err) {
    ElNotification({
      type: 'error',
      title: 'error',
      message: err.message,
      closeIcon: CloseBold,
    })
  } finally {
    if (loadingInstance) loadingInstance.close();
  }
}


//实现注册功能
const username = ref('')
const registerEvent = async () => {
  // 输入框为空校验
  if (!account.value.trim()) {
    ElNotification({
      type: 'error',
      title: '账号不能为空',
      message: '请输入账号',
      closeIcon: CloseBold,
    });
    return;
  }
  if (!username.value.trim()) {
    ElNotification({
      type: 'error',
      title: '昵称不能为空',
      message: '请输入昵称',
      closeIcon: CloseBold,
    });
    return;
  }
  if (!password.value.trim()) {
    ElNotification({
      type: 'error',
      title: '密码不能为空',
      message: '请输入密码',
      closeIcon: CloseBold,
    });
    return;
  }
  if (!inputCode.value.trim()) {
    ElNotification({
      type: 'error',
      title: '验证码不能为空',
      message: '请输入验证码',
      closeIcon: CloseBold,
    });
    return;
  }
  // 校验验证码
  if (inputCode.value.trim().toLowerCase() !== verifyCode.value.toLowerCase()) {
    ElNotification({
      type: 'error',
      title: '验证码错误',
      message: '验证码输入错误，请重新输入',
      closeIcon: CloseBold,
    });
    refreshCode();
    inputCode.value = '';
    return;
  }
  try {
    const res = await api.User.register({
      account: account.value
      , password: password.value,
      username: username.value
    })
    const code = res.data.code;
    //成功的提示在这里处理，code=0或者error由拦截器统一处理
    if (code == 1) {
      ElNotification({
        type: 'success',
        title: 'success',
        message: '注册成功啦,快登录吧！',
        closeIcon: CloseBold,
      })
      clean()
      denglu()
    }
  }
  catch (err) {
    ElNotification({
      type: 'error',
      title: 'error',
      message: err.message,
      closeIcon: CloseBold,
    })
  }
}





//登录注册窗口跳转
const toRegister = ref(null);
const login = ref(null);
const toLogin = ref(null);
const register = ref(null);
const zhuce = () => {
  toRegister.value.style.transform = 'translate(100%,100%)';
  login.value.style.transform = 'translate(-100%,100%)';
  register.value.style.transform = 'translate(-100%,-100%)';
  toLogin.value.style.transform = 'translate(100%,-100%)';
}
const denglu = () => {
  toRegister.value.style.transform = 'translate(0,0)';
  login.value.style.transform = 'translate(0,0)';
  register.value.style.transform = 'translate(100%,100%)';
  toLogin.value.style.transform = 'translate(0,100%)';
}
const closeDialog = () => {
  // 重置动画状态
  toRegister.value.style.transform = 'translate(0,0)';
  login.value.style.transform = 'translate(0,0)';
  register.value.style.transform = 'translate(100%,100%)';
  toLogin.value.style.transform = 'translate(0,100%)';
}

// 初始化验证码
onMounted(() => {
  refreshCode();
});

</script>
<style scoped lang="scss">
.all {
  width: 50%;
  height: 30rem;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 0.9375rem;

  div {
    width: 50%;
    height: 100%;
    transition: transform 0.6s ease;
  }

  .first,
  .then {
    width: 100%;
    height: 100%;
    display: flex
  }

  .toRegister {
    border-right: 0.0625rem solid rgba(0, 0, 0, 0.2);
    /* 1px */
    background-color: white;

    h2 {
      font-size: 1.875rem;
      /* 30px */
      text-align: center;
      margin-top: 30%;
    }

    .toregbtn {
      margin: 20% 12%;
    }
  }

  .register {
    background-color: white;

    .regBtn {
      margin-top: 5.5rem;
    }

    h2 {
      font-size: 2.5rem;
      /* 40px */
      color: black;
      text-align: center;
      margin-top: 10%;
      margin-bottom: 15%;
    }

    button {
      margin-left: 12%;
    }
  }

  .login {
    background-color: white;

    .loginBtn {
      display: block;
      margin-left: 1.875rem;
      /* 30px */
    }

    h1 {
      font-size: 2.5rem;
      /* 40px */
      width: 5rem;
      /* 80px */
      margin: 2.5rem auto;
      /* 40px */
    }

    .close {
      background-image: url("../assets/images/关闭.png");
      width: 2.5rem;
      /* 40px */
      height: 2.5rem;
      /* 40px */
      background-size: 100%;
      position: absolute;
      right: 0.3125rem;
      /* 5px */
      top: 0.3125rem;
      /* 5px */
      cursor: pointer;
      transition: all 0.3s ease;
      background-repeat: no-repeat;

      &:hover {
        transform: scale(1.1);
      }
    }



  }

  .l {
    display: flex;
    height: 12.5rem;
    /* 200px */

    .list {
      display: block;
      margin-left: 0.625rem;
      /* 10px */

      li {
        font-size: 1.25rem;
        /* 20px */
        width: 4.375rem;
        /* 70px */
        height: 3.75rem;
        /* 60px */
      }

    }

    .loginData {
      li {
        width: 12.5rem;
        /* 200px */
        height: 3.75rem;
        /* 60px */
        margin-right: 3.125rem;
        /* 50px */
      }

      input {
        /* 基础样式 */
        width: 100%;
        font-size: 1rem;
        /* 16px */
        line-height: 1.5;

        /* 边框与背景 */
        border: 0.125rem solid #e2e8f0;
        /* 2px */
        border-radius: 0.5rem;
        /* 8px */
        background: #ffffff;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        /* 文字样式 */
        color: #1e293b;
        font-family: 'Inter', system-ui, sans-serif;

        /* 阴影与轮廓 */
        box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.05);
        /* 0 1px 2px */
      }

      /* 悬停效果 */
      input:hover {
        border-color: #94a3b8;
      }

      /* 聚焦效果 */
      input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow:
          0 0 0 0.1875rem rgba(99, 102, 241, 0.2),
          /* 0 0 0 3px */
          0 0.0625rem 0.125rem rgba(0, 0, 0, 0.05);
        /* 0 1px 2px */
      }

      /* 暗黑模式适配 */
      @media (prefers-color-scheme: dark) {
        input {
          background: #1e293b;
          border-color: #475569;
          color: #f8fafc;
          box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.1);
          /* 0 1px 2px */
        }

        input:focus {
          border-color: #818cf8;
          box-shadow:
            0 0 0 0.1875rem rgba(129, 140, 248, 0.2),
            /* 0 0 0 3px */
            0 0.0625rem 0.125rem rgba(0, 0, 0, 0.1);
          /* 0 1px 2px */
        }
      }
    }
  }

  .toLogin {
    // background-color: #c8a9f6;
    background-color: white;

    h2 {
      font-size: 1.875rem;
      /* 30px */
      margin-top: 40%;
      margin-left: 15%;
    }

    .toLoginBtn {
      margin-left: 15%;
    }

    .close {
      background-image: url("../assets/images/关闭.png");
      width: 2.5rem;
      /* 40px */
      height: 2.5rem;
      /* 40px */
      background-size: 100%;
      position: absolute;
      right: 0.3125rem;
      /* 5px */
      top: 0.3125rem;
      /* 5px */
      cursor: pointer;
      transition: all 0.3s ease;
      background-repeat: no-repeat;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .register {
    border-right: 0.0625rem solid rgba(0, 0, 0, 0.2);
    /* 1px */
  }
}

/* From Uiverse.io by yaasiinaxmed */
button {
  --color: #3fc2f8;
  font-family: inherit;
  display: inline-block;
  width: 5.625rem;
  /* 6em = 6 * 0.9375rem */
  height: 2.25rem;
  /* 2.4em = 2.4 * 0.9375rem */
  line-height: 0.9375rem;
  /* 15px */
  overflow: hidden;
  cursor: pointer;
  margin: 1.25rem;
  /* 20px */
  font-size: 0.9375rem;
  /* 15px */
  z-index: 1;
  color: var(--color);
  border: 0.125rem solid var(--color);
  /* 2px */
  border-radius: 0.375rem;
  /* 6px */
  position: relative;
  left: 5.625rem;
  /* 90px */
  top: -0.9375rem;
  /* -15px */
}

button::before {
  position: absolute;
  content: "";
  background: var(--color);
  width: 9.375rem;
  /* 150px */
  height: 12.5rem;
  /* 200px */
  z-index: -1;
  border-radius: 50%;
}

button:hover {
  color: white;
}

button:before {
  top: 100%;
  left: 100%;
  transition: 0.3s all;
}

button:hover::before {
  top: -1.875rem;
  /* -30px */
  left: -1.875rem;
  /* -30px */
}
</style>