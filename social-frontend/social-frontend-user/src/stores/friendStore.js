import { defineStore } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useLoginStore } from './loginStore';
import Friend from '@/api/Friend';

export const useFriendStore = defineStore('friend', () => {

  //store
  const loginStore = useLoginStore()

  //状态
  const friendList = ref(JSON.parse(localStorage.getItem('friendList') || null))

  //get  获取器（使用 computed 保持响应式）
  const getFriendList = computed(() => friendList.value);

  //set
  const setFriendList = (newList) => {
    friendList.value = newList;
    localStorage.setItem('friendList', JSON.stringify(newList));
  };
  const fetchFriendList = async () => {
    if (!loginStore.getUser) return
    const res = await Friend.getFriendList(loginStore.getUser.id)
    setFriendList(res.data.data)
  }
  onMounted(() => {
    fetchFriendList()
  })

  const makeNull = () => {
    friendList.value = null
  }

  return {
    getFriendList,
    setFriendList,
    fetchFriendList,
    makeNull
  }
});