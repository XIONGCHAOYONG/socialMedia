<template>
  <div class="moments">
    <!-- 朋友圈封面区域 -->
    <div class="cover-section">
      <div class="cover">
        <el-image v-if="loginStore.getUser.cover" :src="loginStore.getUser.cover" fit="cover" class="cover-image" />
        <div v-else class="cover-placeholder">
          <el-icon class="cover-icon">
            <Picture />
          </el-icon>
          <span>设置朋友圈封面</span>
        </div>

        <!-- 发布按钮 -->
        <div class="publish-btn">
          <el-button type="primary" @click="showPublishDialog = true">
            <el-icon>
              <Edit />
            </el-icon>
            发布
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 动态列表 -->
      <div class="moments-list">
        <div v-if="momentsList?.length === 0" class="empty-moments">
          <el-icon class="empty-icon">
            <ChatDotRound />
          </el-icon>
          <p>还没有动态，快来发布第一条吧！</p>
        </div>

        <div v-else class="moments-container">
          <div v-for="moment in momentsList" :key="moment.id" class="moment-item">
            <!-- 用户头像 -->
            <div class="moment-avatar">
              <Avatar :avatar="moment.author.avatar" :username="moment.author.username || '用户'"
                :style="{ width: '50px', height: '50px', fontSize: '20px' }" />
            </div>

            <!-- 动态内容 -->
            <div class="moment-content">
              <!-- 用户信息 -->
              <div class="moment-header">
                <span class="username">{{ moment.author.username }}</span>
                <span class="time">{{ moment.createdAt }}</span>
              </div>

              <!-- 动态文字 -->
              <div v-if="moment.content" class="moment-text">
                {{ moment.content }}
              </div>

              <!-- 动态图片 -->
              <div v-if="moment.imageUrls && moment.imageUrls.length > 0" class="moment-images">
                <div v-for="(image, index) in moment.imageUrls.slice(0, 9)" :key="index" class="image-item">
                  <el-image :src="image" fit="cover" :preview-src-list="moment.imageUrls" :initial-index="index"
                    preview-teleported hide-on-click-modal />
                </div>
              </div>

              <!-- 动态操作 -->
              <div class="moment-actions">
                <div class="action-buttons">
                  <el-button type="text" size="small" @click="handleLike(moment)" :class="{ 'liked': moment.isLiked }">
                    <el-icon>
                      <Star />
                    </el-icon>
                    {{ moment.likes.length || 0 }}
                  </el-button>
                  <el-button type="text" size="small" @click="handleComment(moment)">
                    <el-icon>
                      <ChatDotRound />
                    </el-icon>
                    评论
                  </el-button>
                </div>

                <!-- 点赞列表 -->
                <div v-if="moment.likes.length > 0" class="like-list">
                  <el-icon>
                    <Star />
                  </el-icon>
                  <span v-for="(like, index) in moment.likes" :key="like.id">
                    {{ like.user.username }}{{ index < moment.likes.length - 1 ? '、' : '' }} </span>
                </div>

                <!-- 评论列表 -->
                <div v-if="moment.comments.length > 0" class="comment-list">
                  <div v-for="comment in moment.comments" :key="comment.id" class="comment-item">
                    <div>
                      <span class="comment-user">{{ comment.user.username }}</span>
                      <span class="comment-content">{{ comment.content }}</span>
                    </div>
                    <span class="comment-time">{{ comment.createdAt }}</span>
                  </div>
                </div>

                <!-- 删除按钮，仅本人动态显示，右上角 -->
                <el-icon v-if="moment.userId === loginStore.getUser.id" class="delete-icon"
                  @click="handleDeleteMoment(moment)"
                  style="position: absolute; right: 10px; top: 10px; z-index: 2; cursor: pointer; font-size: 22px; color: #f56c6c;">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 好友推荐 -->
      <div class="friend-recommend">
        <div class="recommend-header">
          <h3>好友推荐</h3>
        </div>

        <div class="recommend-list">
          <div v-if="recommendList.length === 0" class="empty-recommend">
            <el-icon class="empty-icon">
              <User />
            </el-icon>
            <p>暂无推荐</p>
          </div>

          <div v-else>
            <div v-for="friend in recommendList" :key="friend.id" class="recommend-item" style="position: relative;">
              <div class="friend-info">
                <el-avatar :size="40" :src="friend.avatar" />
                <div class="friend-details">
                  <div class="friend-name">{{ friend.username }}</div>
                  <div class="friend-desc">{{ friend.signature || '这个人很懒，什么都没有留下~' }}</div>
                </div>
              </div>
              <!-- 添加按钮放到右上角 -->
              <div class="friend-actions-top">
                <el-button type="primary" size="small" @click="handleAddFriend(friend)"
                  :disabled="friend.status === 'applied'"
                  :style="friend.status === 'applied' ? 'background-color: #67C23A; border-color: #67C23A; color: #fff;' : ''">
                  {{ friend.status === 'applied' ? '已申请' : '添加' }}
                </el-button>
              </div>
              <!-- 标签区域放到底部 -->
              <div class="friend-tags-row" v-if="friend.tags && friend.tags.length">
                <span class="tags-label">兴趣标签：</span>
                <div class="friend-tags">
                  <span v-for="(tag, idx) in friend.tags" :key="idx" class="friend-tag"
                    :style="{ backgroundColor: tag.color }">
                    {{ tag.tagName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布动态弹窗 -->
    <el-dialog v-model="showPublishDialog" title="发布动态" width="500px">
      <el-form :model="publishForm" label-width="80px">
        <el-form-item label="内容">
          <el-input v-model="publishForm.content" type="textarea" :rows="4" placeholder="分享你的生活..." />
        </el-form-item>

        <el-form-item label="图片">
          <el-upload ref="upload" :action="`${uploadUrl}/user/upload`" :headers="headers" list-type="picture-card"
            :on-change="handleImageChange" :on-success="handleImageSuccess" :file-list="publishForm.images" :limit="9"
            :on-exceed="handleImageExceed" multiple>
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPublishDialog = false">取消</el-button>
          <el-button type="primary" @click="handlePublish">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Picture, Edit, ChatDotRound, Star, User, Plus, Delete }
  from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePostStore } from '@/stores/postStroe'
import { useLoginStore } from '@/stores/loginStore'
import Post from '@/api/Post'
import PostComment from '@/api/PostComment'
import PostLike from '@/api/PostLike'
import Users from '@/api/User'
import Notification from '@/api/Notification'
import router from '@/router'
import Avatar from './Avatar.vue';

const uploadUrl = import.meta.env.VITE_SERVER_URL;


//store
const postStore = usePostStore()
const loginStore = useLoginStore()


//upload的action设置请求头token
const token = localStorage.getItem('token') || ''

const headers = {
  token: `${token}`
}


const momentsList = computed(() => postStore.getMonentList)
onMounted(() => {
  //判断路由参数，如果没有参数,则获取动态列表
  if (!router.currentRoute.value.query.friendId) {
    postStore.fetchMomentsList()
  }
})

/**
 * 好友推荐列表
 * @type {import('vue').Ref<Array<{
 *   id: number,
 *   username: string,
 *   avatar: string,
 *   signature: string,
 *   status: 'pending' | 'applied'
 * }>>}
 */
const recommendList = ref([
])
onMounted(async () => {
  const res = await Users.getRecommendUsers(loginStore.getUser.id)
  if (res.data.code == 1)
    recommendList.value = res.data.data
  console.log(res.data.data)

})
/**
 * 获取图片布局类名
 * @param {number} count - 图片数量
 * @returns {string} 布局类名
 */
const getImageClass = (count) => {
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  if (count === 3) return 'triple'
  if (count === 4) return 'quad'
  return 'grid'
}

//处理点赞操作
const handleLike = async (moment) => {
  const isLiked = moment.likes.some(like => like.userId === loginStore.getUser.id);

  if (!isLiked) {
    // 添加点赞
    const res = await PostLike.addLike({
      postId: moment.id,
      userId: loginStore.getUser.id
    })
    if (res.data.code == 1) {
      ElMessage.success('点赞成功');
      postStore.fetchMomentsList()
    }
  } else {
    // 取消点赞
    const res = await PostLike.deleteLike({
      postId: moment.id,
      userId: loginStore.getUser.id
    })
    if (res.data.code == 1) {
      ElMessage.success('取消点赞成功');
      postStore.fetchMomentsList()
    }
  }
}

// 处理评论操作
const handleComment = (moment) => {
  console.log('handleComment', moment);
  ElMessageBox.prompt('请输入评论内容', '评论', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '说点什么...'
  }).then(async ({ value }) => {
    if (!moment.comments) moment.comments = [];

    const res = await PostComment.addComment({
      postId: moment.id,
      content: value,
      userId: loginStore.getUser.id
    })
    if (res.data.code == 1) {
      ElMessage.success('评论成功');
      postStore.fetchMomentsList()
    }

  }).catch(() => {
    ElMessage.info('取消评论');
  });
}



// 发布动态
const showPublishDialog = ref(false)
const publishForm = ref({ content: '', images: [] })
const upload = ref()

// 处理图片选择
const handleImageChange = (file, fileList) => {
  publishForm.value.images = fileList
}

// 处理图片上传成功
const handleImageSuccess = (response, file, fileList) => {
  // 将上传成功的图片url赋值到file对象的url属性，el-upload会自动渲染
  const target = fileList.find(f => f.uid === file.uid)
  if (target) target.url = response.data
  publishForm.value.images = fileList
}

// 超出图片上传数量限制
const handleImageExceed = (files, fileList) => {
  ElMessage.warning('最多只能上传9张图片')
}

// 发布动态
const handlePublish = async () => {
  if (!publishForm.value.content.trim()) {
    ElMessage.warning('请输入动态内容')
    return
  }
  // 收集所有已上传图片的url
  const imageUrls = publishForm.value.images
    .filter(f => f.url)
    .map(f => f.url)
  const newMoment = {
    userId: loginStore.getUser.id,
    content: publishForm.value.content,
    imageUrls: JSON.stringify(imageUrls)
  }
  const res = await Post.sendPost(newMoment)
  if (res.data.code == 1) {
    showPublishDialog.value = false
    postStore.fetchMomentsList()
    publishForm.value = { content: '', images: [] }
    ElMessage.success('发布成功')
  }
}

//删除动态
const handleDeleteMoment = (moment) => {
  ElMessageBox.confirm(
    '确定要删除这条动态吗？',
    '提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await Post.deletePost(moment.id)
      if (res.data.code === 1) {
        postStore.fetchMomentsList()
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(res.data.msg || '删除失败')
      }
    } catch (e) {
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    // 用户取消
  })
}



/**
 * 处理添加好友操作
 * @param {Object} friend - 好友对象
 */
const handleAddFriend = async (friend) => {
  const res = await Notification.sendRequest({
    userId: friend.id,
    type: 1,//1代表好友申请
    senderId: loginStore.getUser.id,
    status: 0,
  })
  if (res.data.code === 1) {
    friend.status = 'applied'
    ElMessage.success(`已发送好友申请给 ${friend.username}`)
  }
}
</script>

<style scoped lang="scss">
.moments {
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.cover-section {
  position: relative;
  height: 40vh;
}

.cover {
  width: 65%;
  height: 40vh;
  border-radius: 20px;
  margin-top: 10px;
  margin-left: 20px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;

  .cover-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }
}

.publish-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.main-content {
  padding: 20px;
  margin: 0 auto;
}

.moments-list {
  width: 67%;
  // margin-left: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.empty-moments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.moments-container {
  padding: 20px;
}

.moment-item {
  display: flex;
  gap: 15px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.moment-avatar {
  flex-shrink: 0;
}

.moment-content {
  flex: 1;
  min-width: 0;
}

.moment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .username {
    font-weight: 600;
    color: #303133;
    font-size: 16px;
  }

  .time {
    color: #909399;
    font-size: 12px;
  }
}

.moment-text {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #303133;
  font-size: 14px;
}

.moment-images {
  display: grid;
  grid-template-columns: repeat(3, 130px);
  gap: 2px;
  margin-bottom: 15px;
}

.image-item {
  width: 130px;
  height: 130px;
  position: relative;
  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0;
  /* grid布局无需额外下边距 */
}

.image-item .el-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.moment-actions {
  position: relative;

  .action-buttons {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;

    .el-button {
      color: #606266;

      &.liked {
        color: #409eff;
      }
    }
  }

  .like-list {
    background-color: #f5f7fa;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 13px;
    color: #606266;

    .el-icon {
      color: #409eff;
      margin-right: 5px;
    }
  }

  .comment-list {
    background-color: #f5f7fa;
    border-radius: 6px;
    padding: 8px 12px;

    .comment-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      font-size: 13px;

      &:last-child {
        margin-bottom: 0;
      }

      .comment-user {
        color: #409eff;
        font-weight: 500;
        margin-right: 5px;
      }

      .comment-time {
        color: #909399;
        font-size: 12px;
        flex-shrink: 0;
        margin-left: 10px;
      }

      .comment-content {
        color: #303133;
      }
    }
  }
}

.delete-btn {
  display: none;
}

.delete-icon {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  cursor: pointer;
  font-size: 22px;
  color: #f56c6c;
  transition: color 0.2s;
}

.delete-icon:hover {
  color: #ff0000;
}

.friend-recommend {
  width: 28%;
  min-height: 80vh;
  max-height: 80vh;
  position: fixed;
  top: 10vh;
  right: 3vw;
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.recommend-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
  }
}

.recommend-list {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.empty-recommend {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #909399;

  .empty-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.recommend-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;

  &:last-child {
    border-bottom: none;
  }
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.friend-details {
  min-width: 0;
}

.friend-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.friend-desc {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.friend-actions-top {
  position: absolute;
  top: 15px;
  right: 20px;
}

.friend-tags-row {
  display: flex;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}

.tags-label {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
  flex-shrink: 0;
}

.friend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.friend-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  background: #409eff;
  margin-right: 4px;
  margin-bottom: 2px;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 10px;
  }

  .friend-recommend {
    width: 100%;
  }

  .moment-images {
    .image-item {
      &.single {
        width: 100%;
        height: 200px;
      }

      &.double {
        width: calc(50% - 2.5px);
        height: 120px;
      }

      &.triple,
      &.quad,
      &.grid {
        width: calc(33.33% - 3.33px);
        height: 100px;
      }
    }
  }
}
</style>