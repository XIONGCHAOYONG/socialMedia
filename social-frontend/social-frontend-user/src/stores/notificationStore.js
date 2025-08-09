import { defineStore } from "pinia";
import { ref, computed, onMounted, nextTick } from "vue";
import { useLoginStore } from "./loginStore";
import Notification from "@/api/Notification";

export const useNotificationStore = defineStore("notification", () => {
  //store
  const loginStore = useLoginStore()
  //状态
  const receivedNotificationList = ref(JSON.parse(localStorage.getItem('receivedNotificationList') || 'null'))
  const sentNotificationList = ref(JSON.parse(localStorage.getItem('sentNotificationList') || 'null'))
  //方法
  //get
  const getReceivedNotificationList = computed(() => {
    return receivedNotificationList.value
  })

  const getSentNotificationList = computed(() => {
    return sentNotificationList.value
  })
  //set
  const setReceivedNotificationList = (data) => {
    receivedNotificationList.value = data
    localStorage.setItem('receivedNotificationList', JSON.stringify(data))
  }
  const setSentNotificationList = (data) => {
    sentNotificationList.value = data
    localStorage.setItem('sentNotificationList', JSON.stringify(data))
  }

  const fetchNoticeList = async () => {
    const res = await Notification.getReceiveNotificationList(loginStore.getUser.id);
    const ress = await Notification.getSendNotificationList(loginStore.getUser.id);
    setReceivedNotificationList(res.data.data)
    setSentNotificationList(ress.data.data)
    console.log(res.data.data)
    console.log(ress.data.data)

  }

  //实时更新列表数据
  const addNotification = async (data) => {
    if (data.userId === loginStore.getUser.id) {
      // 使用数组重新赋值，强制触发响应式更新
      receivedNotificationList.value = [data, ...receivedNotificationList.value]
      // 同时更新本地存储
      localStorage.setItem('receivedNotificationList', JSON.stringify(receivedNotificationList.value))
    } else {
      // 使用数组重新赋值，强制触发响应式更新
      sentNotificationList.value = [data, ...sentNotificationList.value]
      // 同时更新本地存储
      localStorage.setItem('sentNotificationList', JSON.stringify(sentNotificationList.value))
    }

  }
  // //初始化
  // onMounted(() => {
  //   fetchNoticeList()
  // })
  //makenull
  const makeNull = () => {
    setReceivedNotificationList(null)
    setSentNotificationList(null)
  }

  //返回
  return {
    receivedNotificationList,
    sentNotificationList,
    fetchNoticeList,
    getReceivedNotificationList,
    getSentNotificationList,
    setReceivedNotificationList,
    setSentNotificationList,
    makeNull,
    addNotification
  };
});