<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-primary-subtle">
    <div class="container-fluid">
      <!-- Лого -->
      <a class="navbar-brand" href="/">
        <img src="/src/assets/login/logo.png" alt="Home" width="100" height="40" class="d-inline-block align-top">
      </a>

      <div v-if="isAuthenticated" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="user()">
            <router-link class="nav-link" to="/courses">Курсы</router-link>
          </li>
          <li class="nav-item" v-if="user()">
            <router-link class="nav-link" to="/user/courses">Мои курсы</router-link>
          </li>
          <li class="nav-item" v-if="teacher()">
            <router-link class="nav-link" to="/teacher/courses">Курсы</router-link>
          </li>
          <li class="nav-item" v-if="admin()">
            <router-link class="nav-link" to="/admin/users">Пользователи</router-link>
          </li>
          <li class="nav-item" v-if="admin()">
            <router-link class="nav-link" to="/admin/groups">Группы</router-link>
          </li>
        </ul>

        <!-- Иконка пользователя с выпадающим меню -->
        <div class="dropdown">
          <a class="btn dropdown-toggle" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle" style="font-size: 1.5rem;"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="#">Профиль</a></li>
          </ul>
        </div>

        <!-- Иконка выхода -->
        <button @click="logout" class="btn">
          <i class="bi bi-box-arrow-right" style="font-size: 1.5rem;"></i>
        </button>
      </div>

      <!-- Если пользователь не авторизован -->
      <div v-else>
        <button @click="login" class="btn btn-outline-primary">Войти</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import router from "@/router.js";
import { ref } from 'vue';

// Определение авторизации
const isAuthenticated = ref(!!localStorage.getItem('token'));

const logout = async () => {
  localStorage.clear();
  await router.push("/login");
}

const login = async () => {
  await router.push("/login");
}

const teacher = () => {
  return localStorage.getItem('role') === 'TEACHER' || localStorage.getItem('role') === 'ADMIN';
}


const user = () => {
  return localStorage.getItem('role') === 'USER';
}


const admin = () => {
  return localStorage.getItem('role') === 'ADMIN';
}
</script>

<style scoped>
/* Дополнительные стили, если нужно */
.navbar-nav .nav-link {
  font-size: 1.1rem;
  font-weight: 500;
}
</style>
