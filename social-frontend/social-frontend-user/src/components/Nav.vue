<template>
  <div class="nav-container">
    <div class="left-section">
      <div class="avatar-container" @click="showUserDialog = true">
        <Avatar :avatar="loginStore.getUser?.avatar" :username="loginStore.getUser?.username || '用户'" />
      </div>
      <span class="name">{{ loginStore.getUser?.username || '用户名' }}</span>
    </div>
    <div class="right-section">
      <router-link to="/chat" class="menu-item">聊天</router-link>
      <router-link to="/contacts" class="menu-item">通讯录</router-link>
      <router-link to="/moments" class="menu-item">朋友圈</router-link>
      <router-link to="/home" class="menu-item">我的</router-link>
    </div>
    <!-- 用户信息弹窗 -->
    <el-dialog v-model="showUserDialog" title="个人信息" width="600px" custom-class="user-info-dialog-root"
      @open="loadUserTags">
      <div v-if="loginStore.getUser" class="user-info-flex">
        <div class="user-info-avatar">
          <Avatar :avatar="loginStore.getUser.avatar" :username="loginStore.getUser.username || '用户'"
            :style="{ width: '100px', height: '100px', fontSize: '40px' }" />
        </div>
        <div class="user-info-card">
          <div class="user-info-row">
            <span class="label">用户ID：</span>
            <span>{{ loginStore.getUser.id }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">账号：</span>
            <span>{{ loginStore.getUser.account }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">昵称：</span>
            <span>{{ loginStore.getUser.username }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">性别：</span>
            <span>{{ loginStore.getUser.gender === 1 ? '男' : loginStore.getUser.gender === 2 ? '女' : '未知' }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">地区：</span>
            <span>{{ loginStore.getUser.region || '未设置' }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">个性签名：</span>
            <span>{{ loginStore.getUser.signature || '这个人很懒，什么都没留下~' }}</span>
          </div>
          <div class="user-info-row">
            <span class="label">注册时间：</span>
            <span>{{ loginStore.getUser.created_at || '未知' }}</span>
          </div>
          <div class="user-info-row tags-row">
            <span class="label">兴趣标签:</span>
            <div class="tags-container">
              <el-tag v-if="userTags.length === 0" type="info" size="small">暂无标签</el-tag>
              <el-tag v-for="tag in userTags" :key="tag.id" class="user-tag" disable-transitions
                :style="{ backgroundColor: tag.color, color: 'white', borderColor: tag.color }">
                {{ tag.tagName }}
              </el-tag>
              <el-button type="primary" :icon="Edit" circle size="small" class="edit-tags-btn" @click="openTagDialog" />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUserDialog = false">关闭</el-button>
          <el-button type="danger" @click="handleLogout">
            <el-icon>
              <SwitchButton />
            </el-icon>
            退出登录
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 兴趣标签选择弹窗 -->
    <el-dialog v-model="showTagDialog" title="选择你的兴趣标签" width="500px">
      <div class="tag-selection-container">
        <el-checkbox-group v-model="selectedTagIds">
          <el-checkbox v-for="tag in allTags" :key="tag.id" :label="tag.id" class="custom-tag-checkbox"
            :disabled="selectedTagIds.length >= 5 && !selectedTagIds.includes(tag.id)" @change="onTagChange(tag.id)">
            <el-tag :style="{
              backgroundColor: tag.color,
              color: 'white',
              borderColor: tag.color
            }" disable-transitions>
              {{ tag.tagName }}
            </el-tag>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTagDialog = false">取消</el-button>
          <el-button type="primary" @click="saveUserTags">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/stores/loginStore.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, SwitchButton, Edit } from '@element-plus/icons-vue';
import InterestTag from '@/api/InterestTag';
import Avatar from './Avatar.vue';
// import { getAllTags, getUserTags, updateUserTags } from '@/api/InterestTag';

const router = useRouter();
const loginStore = useLoginStore();

const showUserDialog = ref(false);

const showTagDialog = ref(false);



const allTags = ref([])
const userTags = ref([]);
onMounted(async () => {
  const res = await InterestTag.getAllTags();
  if (res.data.code == 1)
    allTags.value = res.data.data;

  const ress = await InterestTag.getTagsById(loginStore.getUser.id);
  if (ress.data.code == 1)
    userTags.value = ress.data.data;
})


const selectedTagIds = ref([]);

const loadUserTags = async () => {
  // 这里不再需要API调用，数据已在userTags中
  console.log("用户标签已加载 (模拟)");
};

const openTagDialog = async () => {
  // 初始化已选中的标签
  selectedTagIds.value = userTags.value.map(tag => tag.id);
  showTagDialog.value = true;
};

const saveUserTags = async () => {
  // 根据 selectedTagIds 从 allTags 中筛选出完整的标签对象
  const newTags = allTags.value.filter(tag => selectedTagIds.value.includes(tag.id));

  const res = await InterestTag.updateUserTag({
    userId: loginStore.getUser.id,
    selectedTagIds: selectedTagIds.value
  });
  if (res.data.code == 1) {
    ElMessage.success('兴趣标签更新成功！');
    showTagDialog.value = false;
    userTags.value = newTags;
  }

};

/**
 * 处理退出登录
 * @returns {Promise<void>}
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // 执行退出登录
    loginStore.logout();
    // 显示成功消息
    ElMessage({
      type: 'success',
      message: '退出登录成功',
    });
    // 跳转到首页
    router.push('/');
  } catch (error) {
    // 用户取消操作
    console.log('用户取消退出登录');
  }
};

/**
 * 标签选择时的处理，限制最多只能选5个
 * @param {number} tagId
 */
const onTagChange = (tagId) => {
  if (selectedTagIds.value.length > 5) {
    // 超过5个，移除最后一个
    selectedTagIds.value = selectedTagIds.value.slice(0, 5);
    ElMessage.warning('最多只能选择5个标签');
  }
};
</script>

<style scoped>
.nav-container {
  margin-top: 0;
  margin-left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f5f5;
  z-index: 1000;
}

.left-section {
  display: flex;
  align-items: center;
}

.avatar-container {
  position: relative;
  margin-right: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

/* 悬浮气泡样式 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 120px;
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid white;
}

.dropdown-menu::after {
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #e4e7ed;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #333;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.dropdown-item .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.right-section {
  display: flex;
}

.right-section .menu-item {
  margin-left: 20px;
  text-decoration: none;
  color: #333;
  font-size: 18px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.right-section .menu-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-3px);
}

.right-section .menu-item.router-link-active {
  color: #1890ff;
  font-weight: bold;
  background-color: #e6f7ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #1890ff;
}

.right-section a:hover {
  color: #1890ff;
}

.user-info-dialog-root:deep(.el-dialog__body) {
  padding: 24px 24px 0 24px;
}

.user-info-flex {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 32px;
}

.user-info-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info-card {
  flex: 1;
  border: none;
  box-shadow: none;
  background: #fafbfc;
  padding: 0 0 0 0;
}

.user-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

.user-info-row .label {
  font-weight: bold;
  color: #666;
  min-width: 80px;
  margin-right: 8px;
}

.tags-row {
  align-items: flex-start;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.user-tag {
  margin: 2px 0;
}

.edit-tags-btn {
  margin-left: 8px;
}

.tag-selection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 50vh;
  overflow-y: auto;
}

.custom-tag-checkbox.el-checkbox {
  margin-right: 10px;
  margin-bottom: 10px;
  height: 32px;
  /* 统一高度 */
  border-radius: 4px;
  border: 1px solid transparent;
  padding: 0 10px 0 5px;
  transition: border-color 0.2s;
}

.custom-tag-checkbox .el-checkbox__label {
  padding-left: 8px;
  line-height: 1;
  /* 确保el-tag垂直居中 */
  display: inline-flex;
  align-items: center;
}

:deep(.el-tag) {
  border-radius: 12px;
}
</style>