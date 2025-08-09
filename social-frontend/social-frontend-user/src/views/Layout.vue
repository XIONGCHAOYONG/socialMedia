<template>
  <div class="layout">
    <div class="content">
      <h1>微聊</h1>
      <LogResDialog />
    </div>
  </div>
</template>

<script setup>
import LogResDialog from '@/components/LogResDialog.vue';

</script>
<style scoped lang="scss">
.layout {
  height: 100vh;
  background-color: #3fc2f8;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 1rem;
  }

  h1 {
    color: #fff;
    text-align: center;
    font-size: 4rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.3);
    letter-spacing: 0.1rem;
  }

}
</style>