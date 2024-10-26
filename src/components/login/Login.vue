<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100">
    <div class="container w-25">
      <form @submit.prevent="login" class="p-4 border rounded shadow-sm bg-light">
        <div class="text-center mb-4">
          <img src="/src/assets/login/logo.png" alt="ЯТест" class="img-fluid" style="max-width: 200px;"/>
        </div>
        <div class="form-group mb-3">
          <label for="username" class="form-label">Логин</label>
          <input type="text" id="username" v-model="username" class="form-control" required>
        </div>
        <div class="form-group mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input type="password" id="password" v-model="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Войти</button>
      </form>

      <!-- Alert for error message -->
      <div v-if="errorMessage" class="alert alert-danger mt-3 fixed-bottom" role="alert" style="left: 0; right: 0; bottom: 0; margin-left: auto; margin-right: auto; width: 50%;">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "@/router.js";
import {ref} from "vue";
const errorMessage = ref('');

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:8880/site/login', {
          email: username.value,
          password: password.value
        });
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('role', response.data.data.role);

        if (response.data.data.role === 'ADMIN' || response.data.data.role === 'TEACHER') {
          await router.push('teacher/courses');
        } else {
          await router.push('courses');
        }
      } catch (error) {
        errorMessage.value = error.response ? error.response.data.errors : 'Произошла ошибка';
      }
    }
  }
};
</script>

<style scoped>
/* Градиентный фон для всей страницы */
.login-container {
  background: linear-gradient(135deg, white 0%, #2575fc 100%);
  min-height: 100vh;
  transition: background 0.5s ease-in-out;
}

/* Минимальная высота для контейнера */
.vh-100 {
  min-height: 100vh;
}
</style>