import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import User from '@/api/User';
import { useMessageStore } from './messageStore';
import { useFriendStore } from './friendStore';
import { useNotificationStore } from './notificationStore';
import { useGroupChatStore } from './groupChatStore';
import { useGroupMessageStore } from './groupMessageStore';
import { usePostStore } from './postStroe';
export const useLoginStore = defineStore('login', () => {
  const messageStore = useMessageStore();
  const groupMessageStore = useGroupMessageStore();
  const friendStore = useFriendStore();
  const notificationStore = useNotificationStore();
  const groupChatStore = useGroupChatStore();
  const postStore = usePostStore();
  // 状态
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);

  // 获取器（使用 computed 保持响应式）
  const getUser = computed(() => user.value);
  const getToken = computed(() => token.value);

  const isLogin = computed(() => !!token.value);  // 方法
  const setUser = (newUser) => {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
    // 登录或切换用户后，强制拉取好友列表
    friendStore.fetchFriendList();
  };

  const setToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem('token', newToken); // 自动持久化
  };

  const logout = () => {
    token.value = null;
    user.value = null;

    // 清除所有相关的本地存储数据
    localStorage.removeItem('token');

    localStorage.removeItem('mesListAll');
    localStorage.removeItem('mesList');
    localStorage.removeItem('curMesList');

    localStorage.removeItem('groupMesListAll');
    localStorage.removeItem('groupMesList');
    localStorage.removeItem('curGroupMesList');

    localStorage.removeItem('friendList');
    localStorage.removeItem('user');
    localStorage.removeItem('receivedNotificationList');
    localStorage.removeItem('sentNotificationList');

    messageStore.makeNull();
    groupMessageStore.makeNull();
    friendStore.makeNull();
    notificationStore.makeNull();




    groupChatStore.makeNullAndRemove();
    groupChatStore.groupChatInit()

    postStore.destroy();

  };
  // 通过 ID 获取用户信息
  const fetchUser = async (userId) => {
    try {
      const response = await User.getById(userId);
      setUser(response.data.data); // 假设响应格式为 { data: { ... } }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  return {
    user,
    token,
    getUser,
    getToken,
    setUser,
    setToken,
    logout,
    isLogin,
    fetchUser
  };
});