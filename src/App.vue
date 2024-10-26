<script setup>
import Navbar from "@/components/navbar/Navbar.vue";
import { useRoute } from "vue-router";
</script>

<template>
  <div class="app-container">
    <Navbar v-if="useRoute().name !== 'Login'" />
    <router-view class="main-content"></router-view>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex-grow: 1;
  height: 80%;
}
</style>