<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">后台管理系统</h2>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="nav-title">系统管理</h3>
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              <span>首页</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <h3 class="nav-title">内容管理</h3>
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link to="/users" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>用户管理</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/groups" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>群聊管理</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/posts" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <span>动态管理</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/tags" class="nav-link" active-class="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span>兴趣标签管理</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
/**
 * 侧边栏导航组件
 * @description 提供系统主要功能的导航菜单
 */
export default {
  name: 'Sidebar'
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #001529;
  color: #fff;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #1f2937;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.sidebar-nav {
  padding: 20px 0;
}

.nav-section {
  margin-bottom: 30px;
}

.nav-title {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 20px 12px 20px;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #1f2937;
  color: #fff;
  border-left-color: #409eff;
}

.nav-link.active {
  background: #1f2937;
  color: #fff;
  border-left-color: #409eff;
}

.nav-link svg {
  flex-shrink: 0;
}

.nav-link span {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .logo {
    font-size: 16px;
  }

  .nav-link {
    padding: 10px 16px;
  }
}
</style>