<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">群聊管理</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="username">欢迎，{{ userInfo.username }}</span>
            <button @click="handleLogout" class="logout-button">退出登录</button>
          </div>
        </div>
      </header>
      <main class="page-content">
        <div class="search-section">
          <div class="search-form">
            <div class="search-item">
              <label>群名称</label>
              <input v-model="searchForm.groupName" type="text" placeholder="请输入群名称" class="search-input" />
            </div>
            <div class="search-item">
              <label>群号</label>
              <input v-model="searchForm.groupAccount" type="text" placeholder="请输入群号" class="search-input" />
            </div>
            <div class="search-item">
              <label>创建者</label>
              <input v-model="searchForm.creatorName" type="text" placeholder="请输入创建者昵称" class="search-input" />
            </div>
            <div class="search-actions">
              <button @click="handleSearch" class="search-btn">搜索</button>
              <button @click="handleReset" class="reset-btn">重置</button>
            </div>
          </div>
        </div>
        <div class="table-section">
          <div class="table-header">
            <h3>群聊列表</h3>
            <div class="table-actions">
              <span class="total-count">共 {{ total }} 条记录</span>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>群头像</th>
                  <th>群名称</th>
                  <th>群号</th>
                  <th>创建者</th>
                  <th>成员数量</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in groupList" :key="group.id">
                  <td>{{ group.id }}</td>
                  <td>
                    <div class="avatar">
                      <img :src="group.groupAvatar" :alt="group.groupName" />
                    </div>
                  </td>
                  <td>{{ group.groupName }}</td>
                  <td>{{ group.groupAccount }}</td>
                  <td>{{ group.creatorName }}</td>
                  <td>
                    <span class="member-count">{{ group.memberCount }}人</span>
                  </td>
                  <td>{{ formatDate(group.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="viewMembers(group)" class="action-btn view-btn">查看成员</button>
                      <button @click="deleteGroup(group)" class="action-btn delete-btn">删除</button>
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

    <!-- 群成员列表模态框 -->
    <div v-if="showMembersModal" class="modal-overlay" @click="closeMembersModal">
      <div class="modal-content members-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedGroup.groupName }} - 群成员 ({{ selectedGroup.memberCount }}人)</h3>
          <button @click="closeMembersModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="members-list">
            <div v-for="member in allMembers" :key="member.id" class="member-item">
              <div class="member-avatar">
                <img :src="member.avatar" :alt="member.account" />
              </div>
              <div class="member-info">
                <div class="member-username">{{ member.username }}</div>
                <div class="member-meta-row">
                  <span class="member-join-time">加入时间：{{ formatDate(member.joinedAt) }}</span>
                  <span class="member-account-label">账号：</span>
                  <span class="member-account">{{ member.account }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="allMembers.length === 0" class="no-members">
            暂无成员数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Group from '@/api/Group'

// 路由实例
const router = useRouter()

// 响应式数据
const userInfo = ref({ username: 'admin', role: 'admin' })
const searchForm = ref({ groupName: '', groupAccount: '', creatorName: '' })
const allGroups = ref([]) // 存储所有群聊数据
const groupList = ref([]) // 当前页显示的群聊数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedGroup = ref({})
const showMembersModal = ref(false)
const allMembers = ref([]) // 存储所有成员数据

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 生命周期
onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) userInfo.value = JSON.parse(storedUserInfo)
  loadAllGroups()
})

// 方法
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

/**
 * 加载所有群聊数据
 */
const loadAllGroups = async () => {
  const res = await Group.get()
  if (res.data.code == 1) {
    allGroups.value = res.data.data
    updateGroupList()
  }
}

/**
 * 更新当前页显示的群聊数据
 */
const updateGroupList = () => {
  // 过滤数据
  let filteredGroups = allGroups.value.filter(group => {
    const groupNameMatch = !searchForm.value.groupName ||
      group.groupName.toLowerCase().includes(searchForm.value.groupName.toLowerCase())
    const groupAccountMatch = !searchForm.value.groupAccount ||
      group.groupAccount.toLowerCase().includes(searchForm.value.groupAccount.toLowerCase())
    const creatorNameMatch = !searchForm.value.creatorName ||
      group.creatorName.toLowerCase().includes(searchForm.value.creatorName.toLowerCase())
    return groupNameMatch && groupAccountMatch && creatorNameMatch
  })

  // 更新总数
  total.value = filteredGroups.length

  // 计算分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value

  // 获取当前页数据
  groupList.value = filteredGroups.slice(startIndex, endIndex)
}

/**
 * 搜索处理
 */
const handleSearch = () => {
  currentPage.value = 1
  updateGroupList()
}

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.value = { groupName: '', groupAccount: '', creatorName: '' }
  currentPage.value = 1
  updateGroupList()
}

/**
 * 页面大小变化处理
 */
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  updateGroupList()
}

/**
 * 当前页变化处理
 */
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  updateGroupList()
}

/**
 * 查看群成员
 */
const viewMembers = (group) => {
  selectedGroup.value = group
  loadGroupMembers(group.id)
  showMembersModal.value = true
}

/**
 * 关闭群成员模态框
 */
const closeMembersModal = () => {
  showMembersModal.value = false
  selectedGroup.value = {}
  allMembers.value = []
}

/**
 * 加载群成员数据
 */
const loadGroupMembers = async (groupId) => {
  // 模拟群成员数据
  const res = await Group.getMembers(groupId)
  allMembers.value = res.data.data
}

/**
 * 删除群聊
 */
const deleteGroup = async (group) => {
  if (confirm(`确定要删除群聊 "${group.groupName}" 吗？`)) {
    const res = await Group.deleteById(group.id)
    if (res.data.code == 1) {
      // 从所有数据中删除
      allGroups.value = allGroups.value.filter(item => item.id !== group.id)
      // 重新计算分页
      updateGroupList()
      alert('删除成功')
    }
  }
}

/**
 * 格式化日期
 */
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
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
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.reset-btn:hover {
  background: #e6e6e6;
}

.table-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.total-count {
  font-size: 14px;
  color: #666;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  color: #1a202c;
}

.data-table tr:hover {
  background: #f5f5f5;
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

.member-count {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

.view-btn {
  background: #52c41a;
  color: white;
}

.view-btn:hover {
  background: #389e0d;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
}

.delete-btn:hover {
  background: #cf1322;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.members-modal {
  max-width: 800px;
  width: 90%;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 群成员列表样式 */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.member-item:hover {
  background: #f5f5f5;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
}

.member-username {
  font-size: 13px;
  color: #888;
  margin-bottom: 2px;
}

.member-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
}

.member-join-time {
  font-size: 12px;
  color: #999;
}

.member-account-label {
  font-size: 13px;
  color: #888;
}

.member-account {
  font-size: 14px;
  font-weight: normal;
  color: #666;
}

.no-members {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
