<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">动态管理</h1>
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
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-form">
            <div class="search-item">
              <label>用户</label>
              <input v-model="searchForm.username" type="text" placeholder="请输入用户名" class="search-input" />
            </div>
            <div class="search-item">
              <label>关键字</label>
              <input v-model="searchForm.keyword" type="text" placeholder="请输入关键字" class="search-input" />
            </div>
            <div class="search-item">
              <label>开始时间</label>
              <input v-model="searchForm.startDate" type="date" class="search-input" />
            </div>
            <div class="search-item">
              <label>结束时间</label>
              <input v-model="searchForm.endDate" type="date" class="search-input" />
            </div>
            <div class="search-actions">
              <button @click="handleSearch" class="search-btn">搜索</button>
              <button @click="handleReset" class="reset-btn">重置</button>
            </div>
          </div>
        </div>

        <!-- 动态列表 -->
        <div class="table-section">
          <div class="table-header">
            <h3>动态列表</h3>
            <div class="table-actions">
              <span class="total-count">共 {{ total }} 条动态</span>
            </div>
          </div>

          <div class="posts-container">
            <div v-for="post in postList" :key="post.id" class="post-card">
              <div class="post-header">
                <div class="post-user">
                  <img :src="post.author?.avatar" :alt="post.author?.username || '用户头像'" class="user-avatar" />
                  <div class="user-info">
                    <span class="username">{{ post.author?.username || '未知用户' }}</span>
                    <span class="post-time">{{ formatDateTime(post.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-actions">
                  <button @click="deletePost(post)" class="delete-btn">删除</button>
                </div>
              </div>

              <div class="post-content">
                <p class="post-text">{{ post.content }}</p>
                <div v-if="post.imageList && post.imageList.length > 0" class="post-images">
                  <el-image v-for="(image, index) in post.imageList" :key="index" :src="image"
                    :preview-src-list="post.imageList" :initial-index="index" fit="cover" class="post-image"
                    :z-index="2000" preview-teleported />
                </div>
              </div>

              <div class="post-stats">
                <span class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                    </path>
                  </svg>
                  {{ post.likes?.length || 0 }}
                </span>
                <span class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {{ post.comments?.length || 0 }}
                </span>
              </div>

              <div v-if="post.comments && post.comments.length > 0" class="post-comments">
                <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                  <img :src="comment.user?.avatar" :alt="comment.user?.username || '评论用户'" class="comment-avatar" />
                  <div class="comment-content">
                    <span class="comment-user">{{ comment.user?.username || '匿名' }}</span>
                    <span class="comment-text">{{ comment.content }}</span>
                    <span class="comment-time">{{ formatDateTime(comment.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Post from '@/api/Post'
import { ElNotification } from 'element-plus'
/**
 * 动态管理页面组件
 * @description 提供动态列表查看、搜索、删除等功能
 */

// 路由实例
const router = useRouter()

// 响应式数据
const userInfo = ref({
  username: 'admin',
  role: 'admin'
})

const searchForm = ref({
  username: '',
  keyword: '',
  startDate: '',
  endDate: ''
})

const allPosts = ref([]) // 存储所有数据
const postList = ref([]) // 当前页显示的数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showImagePreview = ref(false)
const previewImageUrl = ref('')

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

// 生命周期
onMounted(() => {
  // 从localStorage获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
  }

  // 加载动态列表
  loadAllPosts()
})

// 方法
/**
 * 处理退出登录
 */
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

/**
 * 加载所有动态数据
 */
const loadAllPosts = async () => {
  const res = await Post.getAllPosts()

  const mockPosts = ref([])
  mockPosts.value = res.data.data
  // 处理图片字段
  mockPosts.value.forEach(post => {
    try {
      post.imageList = post.imageUrls ? JSON.parse(post.imageUrls) : []
    } catch {
      post.imageList = []
    }
  })
  allPosts.value = mockPosts.value
  updatePostList()
}

/**
 * 更新当前页显示的数据
 */
const updatePostList = () => {
  // 过滤数据
  let filteredPosts = allPosts.value.filter(post => {
    const usernameMatch = !searchForm.value.username ||
      post.author?.nickname.toLowerCase().includes(searchForm.value.username.toLowerCase())
    const keywordMatch = !searchForm.value.keyword ||
      post.content.toLowerCase().includes(searchForm.value.keyword.toLowerCase())

    let dateMatch = true
    if (searchForm.value.startDate) {
      const startDate = new Date(searchForm.value.startDate)
      const postDate = new Date(post.createdAt)
      dateMatch = dateMatch && postDate >= startDate
    }
    if (searchForm.value.endDate) {
      const endDate = new Date(searchForm.value.endDate)
      const postDate = new Date(post.createdAt)
      dateMatch = dateMatch && postDate <= endDate
    }

    return usernameMatch && keywordMatch && dateMatch
  })

  // 更新总数
  total.value = filteredPosts.length

  // 计算分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value

  // 获取当前页数据
  postList.value = filteredPosts.slice(startIndex, endIndex)
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1
  updatePostList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.value = {
    username: '',
    keyword: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
  updatePostList()
}

/**
 * 处理分页大小变化
 * @param {Number} newSize 新分页大小
 */
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  updatePostList()
}

/**
 * 处理当前页码变化
 * @param {Number} newPage 新页码
 */
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  updatePostList()
}

/**
 * 删除动态
 * @param {Object} post 动态信息
 */
const deletePost = async (post) => {
  if (confirm(`确定要删除用户 "${post.author?.nickname || '未知用户'}" 的动态吗？`)) {
    const res = await Post.deleteById(post.id)
    if (res.data.code == 1) {
      // 从所有数据中删除
      allPosts.value = allPosts.value.filter(item => item.id !== post.id)
      // 重新计算分页
      updatePostList()
      ElNotification({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
    }
  }
}

/**
 * 格式化日期时间
 * @param {String} dateTimeStr 日期时间字符串
 * @returns {String}
 */
const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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

.search-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-item label {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #409eff;
}

.search-actions {
  display: flex;
  gap: 8px;
}

.search-btn,
.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn {
  background: #409eff;
  color: white;
}

.search-btn:hover {
  background: #337ecc;
}

.reset-btn {
  background: #f3f4f6;
  color: #4a5568;
}

.reset-btn:hover {
  background: #e5e7eb;
}

.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.total-count {
  font-size: 14px;
  color: #6b7280;
}

.posts-container {
  padding: 20px;
}

.post-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info .username {
  font-weight: 600;
  color: #1a202c;
  font-size: 14px;
}

.post-time {
  font-size: 12px;
  color: #6b7280;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  padding: 4px 8px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background: #c53030;
}

.post-content {
  margin-bottom: 12px;
}

.post-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.post-images {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
  margin-top: 6px;
  justify-content: flex-start;
  align-items: flex-start;
  overflow-x: auto;
}

.post-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin: 0;
  flex-shrink: 0;
}

.post-image:hover {
  transform: scale(1.05);
}

.post-stats {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.stat-item svg {
  color: #9ca3af;
}

.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e4e7ed;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #4a5568;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

.post-comments {
  margin-top: 10px;
  border-top: 1px solid #f3f4f6;
  padding-top: 10px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-user {
  font-size: 13px;
  color: #409eff;
  font-weight: 600;
}

.comment-text {
  font-size: 13px;
  color: #374151;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 200px;
  }

  .search-form {
    grid-template-columns: 1fr;
  }

  .post-header {
    flex-direction: column;
    gap: 12px;
  }

  .post-actions {
    align-self: flex-end;
  }

  .post-images {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .post-image {
    height: 120px;
  }
}
</style>