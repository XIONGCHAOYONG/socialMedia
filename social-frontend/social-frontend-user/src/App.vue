<template>
  <Nav v-if="!isRootRoute" />
  <router-view></router-view>
</template>
<script setup>
import Nav from "./components/Nav.vue";
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useLoginStore } from "./stores/loginStore";

const loginStore = useLoginStore();
const route = useRoute();
const router = useRouter();
const isRootRoute = computed(() => route.path === '/');
onMounted(() => {
  window.addEventListener("message", (event) => {
    console.log(event);
    // if (event.origin !== "http://localhost:5174") return; // 安全检查
    console.log("接收到来自子窗口的消息：", event.data);
    const { user, token } = event.data;

    if (user && token) {
      loginStore.setUser(user);
      loginStore.setToken(token);
    }
  });
});
</script>
<style scoped lang="scss"></style>
