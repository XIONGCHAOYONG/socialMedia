<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">首页</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="username">欢迎，{{ userInfo.username }}</span>
            <button @click="handleLogout" class="logout-button">
              退出登录
            </button>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <div class="statistic-card">
          <h2>欢迎使用后台管理系统</h2>
          <p>您已成功登录系统，可以开始管理您的业务了。</p>
          <div class="el-statistics-grid">
            <el-statistic title="总用户数" :value="userTotal" />
            <el-statistic title="今日新增用户数" :value="userTodayAdd" />
            <el-statistic title="群聊数" :value="groupTotal" />
            <el-statistic title="动态数" :value="postTotal" />
          </div>
        </div>
      </main>

      <!-- 数据可视化区域 -->
      <section class="charts-section">
        <EchartsCard title="近七天用户增长数" :xData="last7Days" :yData="userGrowthData" seriesName="用户增长数" />
        <EchartsCard title="近七天动态发表数" :xData="last7Days" :yData="postGrowthData" seriesName="动态发表数" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import EchartsCard from '@/components/EchartsCard.vue'
import User from '@/api/User'
import request from '@/utils/request'

// 路由实例
const router = useRouter()

// 响应式数据
const userInfo = ref({
  username: 'admin',
  role: 'admin'
})

// 生命周期
onMounted(() => {
  // 从localStorage获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
  }
})

// 方法

const handleLogout = () => {
  // 清除登录状态
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')

  // 跳转到登录页
  router.push('/login')
}


const last7Days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return `${d.getMonth() + 1}/${d.getDate()}`
})


const userGrowthData = ref([])


const postGrowthData = ref([])

// 统计数据（可替换为接口数据）
const userTotal = ref()
const userTodayAdd = ref()
const groupTotal = ref()
const postTotal = ref()

const getCounts = () => {
  return request({
    method: 'get',
    url: "/admin/common/getCounts"
  })
}

onMounted(async () => {
  const res = await getCounts()
  if (res.data.code == 1) {
    userTotal.value = res.data.data.userTotal
    userTodayAdd.value = res.data.data.userTodayAdd
    groupTotal.value = res.data.data.groupTotal
    postTotal.value = res.data.data.postTotal
    userGrowthData.value = res.data.data.userGrowthData
    postGrowthData.value = res.data.data.postGrowthData
  }
})

</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background: #f0f2f5;
  min-height: 100vh;
}

.top-header {
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.logout-button {
  padding: 6px 12px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background: #c53030;
}

.page-content {
  padding: 24px;
}

.statistic-card {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.statistic-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px 0;
}

.statistic-card p {
  font-size: 14px;
  color: #718096;
  margin: 0 0 24px 0;
}

.el-statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
}

.el-statistic {
  --el-statistic-content-font-size: 32px;
  --el-statistic-title-font-size: 14px;
  --el-statistic-content-color: #409eff;
  --el-statistic-title-color: #666;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ef 100%);
  border-radius: 8px;
  padding: 24px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .statistic-card {
    padding: 20px;
  }

  .el-statistics-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

.charts-section {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 900px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>