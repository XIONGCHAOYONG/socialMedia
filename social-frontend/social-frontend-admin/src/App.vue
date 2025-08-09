<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
}

/* 移除按钮默认样式 */
button {
  font-family: inherit;
}

/* 移除输入框默认样式 */
input {
  font-family: inherit;
}

/* 移除链接默认样式 */
a {
  text-decoration: none;
  color: inherit;
}
</style>