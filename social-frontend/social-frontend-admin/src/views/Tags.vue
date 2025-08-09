<template>
  <div class="admin-layout">
    <Sidebar />
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">兴趣标签管理</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="username">欢迎，{{ userInfo.username }}</span>
            <button @click="handleLogout" class="logout-button">退出登录</button>
          </div>
        </div>
      </header>

      <main class="page-content">
        <div class="action-section">
          <button @click="showAddModal = true" class="add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加标签
          </button>
        </div>

        <div class="table-section">
          <div class="table-header">
            <h3>标签列表</h3>
            <div class="table-actions">
              <span class="total-count">共 {{ total }} 个标签</span>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>标签名称</th>
                  <th>标签颜色</th>
                  <th>创建时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tag in tagList" :key="tag.id">
                  <td>{{ tag.id }}</td>
                  <td>
                    <span class="tag-name" :style="{ backgroundColor: tag.color, color: '#ffffff' }">
                      {{ tag.tagName }}
                    </span>
                  </td>

                  <td>
                    <div class="color-preview">
                      <div class="color-box" :style="{ backgroundColor: tag.color }"></div>
                      <span>{{ tag.color }}</span>
                    </div>
                  </td>
                  <td>{{ formatDate(tag.createAt) }}</td>
                  <td>
                    <span :class="['status-tag', tag.status === 1 ? 'active' : 'disabled']">
                      {{ getStatusText(tag.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="toggleStatus(tag)" class="action-btn status-btn"
                        :class="tag.status === 1 ? 'status-btn-enabled' : 'status-btn-disabled'">
                        {{ tag.status === 1 ? '禁用' : '启用' }}
                      </button>
                      <button @click="deleteTag(tag)" class="action-btn delete-btn">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </main>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加标签</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="tag-form">
            <div class="form-group">
              <label for="tagName">标签名称</label>
              <input id="tagName" v-model="tagForm.tag_name" type="text" class="form-input" placeholder="请输入标签名称"
                required />
            </div>

            <div class="form-group">
              <label for="tagColor">标签颜色</label>
              <div class="color-input-group">
                <input id="tagColor" v-model="tagForm.color" type="color" class="color-input" />
                <input v-model="tagForm.color" type="text" class="color-text-input" placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$" />
              </div>
            </div>

            <div class="form-group">
              <label for="tagStatus">状态</label>
              <select v-model.number="tagForm.status" class="form-select">
                <option :value="1">启用</option>
                <option :value="0">禁用</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-btn">取消</button>
              <button type="submit" class="submit-btn">添加</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Tag from '@/api/Tag'

/**
 * 兴趣标签管理页面组件
 * @description 提供标签列表查看、添加、编辑、删除等功能
 */

// 路由实例
const router = useRouter()

// 响应式数据
const userInfo = ref({
  username: 'admin',
  role: 'admin'
})

const tagList = ref([])
const allTags = ref([]) // 存储所有数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showAddModal = ref(false)
const tagForm = ref({
  tag_name: '',
  color: '#409eff',
  status: 1
})

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

// 生命周期
onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
  }
  loadAllTags()
})

// 方法
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

/**
 * 加载所有标签数据
 */
const loadAllTags = async () => {
  const res = await Tag.getAllTags()
  if (res.data.code == 1) {
    // 存储所有数据
    allTags.value = res.data.data
    updateTagList()
  }

}

/**
 * 更新当前页显示的数据
 */
const updateTagList = () => {
  // 计算分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value

  // 获取当前页数据
  tagList.value = allTags.value.slice(startIndex, endIndex)
  total.value = allTags.value.length
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  updateTagList()
}

/**
 * 处理当前页码变化
 */
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  updateTagList()
}

const deleteTag = async (tag) => {
  if (confirm(`确定要删除标签 "${tag.tagName}" 吗？`)) {
    const res = await Tag.deleteById(tag.id)
    if (res.data.code == 1) {
      // 从所有数据中删除
      allTags.value = allTags.value.filter(item => item.id !== tag.id)
      // 重新计算分页
      updateTagList()
      alert('删除成功')
    }

  }
}

const closeModal = () => {
  showAddModal.value = false
  resetTagForm()
}

const resetTagForm = () => {
  tagForm.value = {
    tag_name: '',
    color: '#409eff',
    status: 1
  }
}

const handleSubmit = async () => {
  const newTag = {
    id: allTags.value.length + 1,
    tagName: tagForm.value.tag_name,
    color: tagForm.value.color,
    createdAt: new Date().toISOString(),
    status: tagForm.value.status
  }
  const res = await Tag.addTag({
    tagName: tagForm.value.tag_name,
    color: tagForm.value.color,
    status: tagForm.value.status
  })
  if (res.data.code == 1) {
    // 添加成功
    allTags.value.push(newTag)
    updateTagList()
    resetTagForm()
    closeModal()
    alert('添加成功')
  }
}


const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getStatusText = (status) => {
  return status === 1 ? '启用' : '禁用'
}

/**
 * 切换标签启用/禁用状态
 * @param {Object} tag 标签对象
 */
const toggleStatus = async (tag) => {
  // 假设有 Tag.updateTag 或 Tag.updateStatus 接口
  const res = await Tag.updateById(
    tag.id
  )
  if (res.data.code == 1) {
    if (tag.status === 1)
      tag.status = 0
    else
      tag.status = 1
    updateTagList()
    alert('状态更新成功')
  }
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

.action-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background: #337ecc;
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

.tag-name {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
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

.status-btn {
  min-width: 48px;
}

.status-btn-enabled {
  background: #f59e42;
  color: #fff;
}

.status-btn-enabled:hover {
  background: #e67c23;
}

.status-btn-disabled {
  background: #67c23a;
  color: #fff;
}

.status-btn-disabled:hover {
  background: #4eae1c;
}

.delete-btn {
  background: #e53e3e;
  color: white;
}

.delete-btn:hover {
  background: #c53030;
}

.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e4e7ed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
}

.tag-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #409eff;
}

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: monospace;
  transition: border-color 0.2s ease;
}

.color-text-input:focus {
  outline: none;
  border-color: #409eff;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f3f4f6;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.submit-btn {
  background: #409eff;
  color: white;
}

.submit-btn:hover {
  background: #337ecc;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 200px;
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

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
