import Post from '@/api/Post';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useLoginStore } from './loginStore';
export const usePostStore = defineStore('post', () => {
  //store
  const loginStore = useLoginStore()
  //状态
  const momentsList = ref(JSON.parse(localStorage.getItem('momentsList') || '[]'))

  //方法
  //get
  const getMonentList = computed(() => {
    if (!momentsList.value) return null;
    return momentsList.value.map(moment => ({
      ...moment,
      imageUrls: moment.imageUrls ? JSON.parse(moment.imageUrls) : []
    }));
  })

  //set
  const setMomentsList = (value) => {
    momentsList.value = value
    localStorage.setItem('momentsList', JSON.stringify(value))
  }


  const addPost = async (newMoment) => {
    if (!Array.isArray(momentsList.value)) {
      momentsList.value = []
    }
    momentsList.value.unshift(newMoment)
    // 保持与setMomentsList一致，更新localStorage
    localStorage.setItem('momentsList', JSON.stringify(momentsList.value))
  }
  //初始化
  const fetchMomentsList = async () => {
    const res = await Post.getPosts(loginStore.getUser.id)
    if (res.data.code === 1) {
      setMomentsList(res.data.data)
    }
  }

  //销毁
  const destroy = () => {
    localStorage.removeItem('momentsList')
    momentsList.value = null
  }
  return {
    getMonentList,
    setMomentsList,
    fetchMomentsList,
    destroy,
    addPost
  }
});