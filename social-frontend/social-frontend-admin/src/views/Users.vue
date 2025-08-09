<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">用户管理</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="username">欢迎，{{ userInfo.username }}</span>
            <button @click="showSetAdminModal = true" class="set-admin-btn">设置管理员</button>
            <button @click="handleLogout" class="logout-button">退出登录</button>
          </div>
        </div>
      </header>
      <main class="page-content">
        <div class="search-section">
          <div class="search-form">
            <div class="search-item">
              <label>账号</label>
              <input v-model="searchForm.account" type="text" placeholder="请输入账号" class="search-input" />
            </div>
            <div class="search-item">
              <label>昵称</label>
              <input v-model="searchForm.nickname" type="text" placeholder="请输入昵称" class="search-input" />
            </div>
            <div class="search-item">
              <label>地区</label>
              <select v-model="searchForm.region" class="search-select">
                <option value="">全部地区</option>
                <option value="北京">北京</option>
                <option value="上海">上海</option>
                <option value="广州">广州</option>
                <option value="深圳">深圳</option>
                <option value="杭州">杭州</option>
              </select>
            </div>
            <div class="search-item">
              <label>性别</label>
              <select v-model="searchForm.gender" class="search-select">
                <option value="">全部性别</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="search-actions">
              <button @click="handleSearch" class="search-btn">搜索</button>
              <button @click="handleReset" class="reset-btn">重置</button>
            </div>
          </div>
        </div>
        <div class="table-section">
          <div class="table-header">
            <h3>用户列表</h3>
            <div class="table-actions">
              <span class="total-count">共 {{ total }} 条记录</span>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>头像</th>
                  <th>账号</th>
                  <th>昵称</th>
                  <th>性别</th>
                  <th>地区</th>
                  <th>个性签名</th>
                  <th>注册时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in userList" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>
                    <div class="avatar">
                      <img :src="user.avatar" :alt="user.nickname" />
                    </div>
                  </td>
                  <td>{{ user.account }}</td>
                  <td>{{ user.username }}</td>
                  <td>
                    <span
                      :class="['gender-tag', user.gender === 1 ? 'male' : user.gender === 2 ? 'female' : 'unknown']">
                      {{ user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知' }}
                    </span>
                  </td>
                  <td>{{ user.region }}</td>
                  <td>{{ user.signature || '-' }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <span :class="['status-tag', user.status === 0 ? 'active' : 'disabled']">{{ user.status }}</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button v-if="user.status !== 0" @click="blockUser(user)"
                        class="action-btn delete-btn">禁用</button>
                      <button v-else @click="recoverUser(user)" class="action-btn recover-btn">恢复</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Element Plus 分页组件 -->
          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </main>
    </div>
  </div>
  <template v-if="showSetAdminModal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h3>设置管理员</h3>
            <button class="modal-close" @click="showSetAdminModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="admin-search-bar">
              <input v-model="adminSearch" @input="filterAdminUsers" placeholder="搜索账号或昵称" class="admin-search-input" />
            </div>
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>头像</th>
                  <th>账号</th>
                  <th>昵称</th>
                  <th>当前角色</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredAdminUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td><img :src="user.avatar" alt="头像" class="admin-avatar" /></td>
                  <td>{{ user.account }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.admin === 1 ? '管理员' : '普通用户' }}</td>
                  <td>
                    <button v-if="user.admin !== 1" @click="setAdmin(user)" class="set-admin-action">设为管理员</button>
                    <span v-else>已是管理员</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import User from '@/api/User'
// 路由实例
const router = useRouter()

// 响应式数据
const userInfo = ref({ username: 'admin', role: 'admin' })
const searchForm = ref({ account: '', nickname: '', region: '', gender: '' })
const allUsers = ref([]) // 存储所有数据
const userList = ref([]) // 当前页显示的数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showSetAdminModal = ref(false)
/**
 * 设置管理员弹窗搜索关键词
 * @type {import('vue').Ref<string>}
 */
const adminSearch = ref("")
/**
 * 设置管理员弹窗筛选后的用户列表
 * @type {import('vue').Ref<Array>}
 */
const filteredAdminUsers = ref([])

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 生命周期
onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) userInfo.value = JSON.parse(storedUserInfo)
  loadAllUsers()
})

// 方法
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

/**
 * 加载所有用户数据
 */
const loadAllUsers = async () => {
  const res = await User.get()
  allUsers.value = res.data.data
  updateUserList()
}

/**
 * 更新当前页显示的数据
 */
const updateUserList = () => {
  // 过滤数据
  let filteredUsers = allUsers.value.filter(user => {
    const accountMatch = !searchForm.value.account ||
      user.account.toLowerCase().includes(searchForm.value.account.toLowerCase())
    const nicknameMatch = !searchForm.value.nickname ||
      user.username.toLowerCase().includes(searchForm.value.nickname.toLowerCase())
    const regionMatch = !searchForm.value.region ||
      user.region === searchForm.value.region
    const genderMatch = !searchForm.value.gender ||
      (searchForm.value.gender === '男' && user.gender === 1) ||
      (searchForm.value.gender === '女' && user.gender === 2) ||
      (searchForm.value.gender === '未知' && user.gender === 0)
    return accountMatch && nicknameMatch && regionMatch && genderMatch
  })

  // 更新总数
  total.value = filteredUsers.length

  // 计算分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value

  // 获取当前页数据
  userList.value = filteredUsers.slice(startIndex, endIndex)
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1
  updateUserList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.value = { account: '', nickname: '', region: '', gender: '' }
  currentPage.value = 1
  updateUserList()
}

/**
 * 页面大小变化处理
 */
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  updateUserList()
}

/**
 * 当前页变化处理
 */
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  updateUserList()
}

const blockUser = async (user) => {
  if (confirm(`确定要禁用用户 "${user.username}" 吗？`)) {
    for (let i = 0; i < allUsers.value.length; i++) {
      if (allUsers.value[i].id === user.id) {
        allUsers.value[i].status = 0
      }
    }
    //调用api
    const res = await User.block(user.id)
    if (res.data.code == 1) {
      // 重新计算分页
      updateUserList()
      alert('禁用成功')
    }
  }
}

/**
 * 恢复用户
 */
const recoverUser = async (user) => {
  if (confirm(`确定要恢复用户 "${user.nickname}" 吗？`)) {
    for (let i = 0; i < allUsers.value.length; i++) {
      if (allUsers.value[i].id === user.id) {
        allUsers.value[i].status = 1
      }
    }
    // 调用api
    const res = await User.recover(user.id)
    if (res.data.code == 1) {
      updateUserList()
      alert('恢复成功')
    }
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

/**
 * 设置指定用户为管理员
 * @param {Object} user 用户对象
 * @returns {Promise<void>}
 */
const setAdmin = async (user) => {
  if (confirm(`确定要将用户 "${user.username}" 设为管理员吗？`)) {
    try {
      const res = await User.setAdmin(user.id)
      if (res.data.code == 1) {
        alert('设置成功')
        user.admin = 1
      }
    } catch (e) {
      alert('设置失败')
    }
  }
}

/**
 * 根据搜索关键词实时筛选用户
 * @returns {void}
 */
const filterAdminUsers = () => {
  const keyword = adminSearch.value.trim().toLowerCase()
  if (!keyword) {
    filteredAdminUsers.value = allUsers.value
  } else {
    filteredAdminUsers.value = allUsers.value.filter(user =>
      (user.account && user.account.toLowerCase().includes(keyword)) ||
      (user.username && user.username.toLowerCase().includes(keyword))
    )
  }
}

// 弹窗每次打开时刷新筛选列表
watch(showSetAdminModal, (val) => {
  if (val) {
    adminSearch.value = ''
    filteredAdminUsers.value = allUsers.value
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

.search-input,
.search-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus,
.search-select:focus {
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

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.data-table td {
  font-size: 14px;
  color: #4a5568;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gender-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.gender-tag.male {
  background: #dbeafe;
  color: #1e40af;
}

.gender-tag.female {
  background: #fce7f3;
  color: #be185d;
}

.gender-tag.unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.active {
  background: #f0f9ff;
  color: #0369a1;
}

.status-tag.disabled {
  background: #fef2f2;
  color: #dc2626;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn {
  background: #e53e3e;
  color: white;
}

.delete-btn:disabled {
  background: #e5e7eb;
  color: #b0b0b0;
  cursor: not-allowed;
  border: 1px solid #e5e7eb;
}

.recover-btn {
  background: #52c41a;
  color: white;
}

.recover-btn:hover {
  background: #389e0d;
}

/* Element Plus 分页样式 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 200px;
  }

  .search-form {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 12px;
  }

  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}

.set-admin-btn {
  padding: 6px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.2s ease;
}

.set-admin-btn:hover {
  background: #337ecc;
}

.modal-mask {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-wrapper {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 800px;
  max-width: 95vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 8px 24px;
  border-bottom: 1px solid #eee;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 16px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  border: 1px solid #eee;
  padding: 8px 12px;
  text-align: center;
}

.set-admin-action {
  padding: 4px 10px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.set-admin-action:hover {
  background: #337ecc;
}

.admin-search-bar {
  margin-bottom: 12px;
  text-align: right;
}

.admin-search-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  width: 220px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}
</style>