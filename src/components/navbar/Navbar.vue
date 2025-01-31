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
            <router-link class="nav-link" to="/courses">Каталог</router-link>
          </li>
          <li class="nav-item" v-if="user()">
            <router-link class="nav-link" to="/user/courses">Моё обучение</router-link>
          </li>
          <li class="nav-item" v-if="userSandbox()">
            <router-link class="nav-link" to="/sandbox">Песочница</router-link>
          </li>
          <li class="nav-item" v-if="teacher()">
            <router-link class="nav-link" to="/teacher/courses">Преподавание</router-link>
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
          <a class="btn dropdown-toggle" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown"
             aria-expanded="false">
            <i class="bi bi-person-circle" style="font-size: 1.5rem;"></i>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="#" @click="fetchProfile">Профиль</a></li>
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


    <dialog v-if="showDialog" class="modal">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ 'Информация пользователя' }}</h5>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>
          <div class="modal-body">
            <p>ФИО: {{ userInfo.firstName }} {{ userInfo.secondName }} {{ userInfo.patronymic }}</p>
            <p>Email: {{ userInfo.email }}</p>
            <p>Первое посещение: {{ new Date(userInfo.firstEntry).toLocaleString() }}</p>
            <p>Последнее посещение: {{ new Date(userInfo.lastEntry).toLocaleString() }}</p>
            <p v-if="userInfo.groups">Группа: {{ userInfo.groups ? userInfo.groups.fullName : "" }}</p>
          </div>

        </div>
      </div>
    </dialog>

  </nav>
</template>

<script setup>
import router from "@/router.js";
import {ref} from 'vue';
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_HOST;

// Определение авторизации
const isAuthenticated = ref(!!localStorage.getItem('token'));
const userInfo = ref(null);
const showDialog = ref(false)


const fetchProfile = async () => {
  try {
    const response = await axios.get(apiUrl + '/users/user');
    userInfo.value = response.data.data;
    showDialog.value = true;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
  }
}
const closeDialog = () => {
  showDialog.value = false;
}

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

const userSandbox = async () => {
  if (localStorage.getItem('role') === 'ADMIN') {
    return true;
  }

  if (localStorage.getItem('role') === 'USER' || localStorage.getItem('role') === 'TEACHER') {
    const response = await axios.get(apiUrl + "/sandbox/open");
    return response.data.data.open;
  }
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

.course-image {
  height: 150px;
  width: 100%;
  object-fit: cover;
}

.horizontal-card {
  cursor: pointer;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.horizontal-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
