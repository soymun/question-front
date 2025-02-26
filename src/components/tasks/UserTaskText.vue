<template>
  <div class="container mt-5">
    <!-- Контейнер для кнопки "Назад" и вкладок -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <!-- Кнопка "Назад" -->
      <button class="btn btn-outline-primary" @click="goBack">Упражнения</button>

      <!-- Вкладки (Tabs) -->
      <ul class="nav nav-tabs flex-grow-1 justify-content-center">
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'" href="#">
            Задача
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'" href="#">
            Комментарии
          </a>
        </li>
      </ul>
    </div>

    <!-- Содержимое вкладок -->
    <div v-if="activeTab === 'task'" class="card mt-4">
      <div class="card-body">
        <!-- Заголовок карточки -->
        <h5 class="card-title">{{taskInfo.name}}</h5>

        <!-- Описание задачи -->
        <p class="card-text mb-5" v-html="taskInfo.description"></p>
        <a :href="`${apiUrl}/file/file/${taskInfo.file}`" v-if="taskInfo.file">
          <i class="bi bi-file-earmark"></i>
          <label>{{taskInfo.file}}</label>
        </a>

        <!-- Поле для ввода текста -->
        <textarea v-model="userText" class="form-control mb-3" rows="5" placeholder="Введите ответ"></textarea>

        <!-- Кнопка "Сдать" -->
        <div class="d-flex justify-content-end">
          <button class="btn btn-success w-25" @click="submitTask">Сдать</button>
        </div>

        <!-- Bootstrap Alert -->
        <div v-if="alertMessage" :class="`alert mt-3 ${alertType}`" role="alert">
          {{ alertMessage }}
        </div>
      </div>
    </div>

    <!-- Комментарии -->
    <div v-if="activeTab === 'comments'" class="mt-4" style="height: 70%; width: 100%;">
      <div class="h-100 overflow-auto">
        <div v-for="comment in comments" :key="comment.id" class="border p-3 mb-3">
          <div class="d-flex justify-content-between">
            <strong>{{ comment.user.firstName }} {{ comment.user.secondName }}</strong>
            <small class="text-muted">{{ formatDate(comment.createTime) }}</small>
          </div>
          <p>{{ comment.message }}</p>
        </div>
      </div>

      <div class="mb-3 h-25">
        <textarea v-model="newComment" class="form-control" rows="3" placeholder="Введите ваш комментарий" style="resize: none"></textarea>
        <button class="btn btn-primary mt-2 float-end" @click="submitComment">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
const apiUrl = import.meta.env.VITE_API_HOST;

const router = useRouter();
const route = useRoute();

const activeTab = ref('task');
const taskInfo = ref({});
const userText = ref('');
const comments = ref([]);
const newComment = ref('');
const alertMessage = ref('');
const alertType = ref('');

// Редирект на предыдущую страницу (курсы)
const goBack = () => {
  router.push(`/courses/${route.params.cId}`);
};

// Форматирование даты
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

// Загрузка информации о задаче
const fetchTaskInfo = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/task/${taskId}`);
    taskInfo.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch task info:', error);
  }
};

// Загрузка комментариев
const fetchComments = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/comments/user/task/${taskId}`);
    comments.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  }
};

// Отправка комментария
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('Комментарий не может быть пустым!');
    return;
  }

  try {
    await axios.post(apiUrl + '/comments', {
      task: taskInfo.value.id,
      message: newComment.value,
    });
    newComment.value = '';
    fetchComments(taskInfo.value.id);
  } catch (error) {
    console.error('Failed to submit comment:', error);
  }
};

// Отправка решения задачи
const submitTask = async () => {
  try {
    const response = await axios.post(apiUrl + '/task/execute', {
      taskId: taskInfo.value.id,
      executeTextDto: {answer: userText.value},
    });

    if (response.data.data.rights) {
      alertMessage.value = 'Задача выполнена правильно!';
      alertType.value = 'alert-success';
      await router.push(`/courses/${route.params.cId}`);
    } else {
      alertMessage.value = 'Неправильный ответ!';
      alertType.value = 'alert-danger';
    }
  } catch (error) {
    console.error('Failed to submit task:', error);
    alertMessage.value = 'Произошла ошибка при сдаче задачи.';
    alertType.value = 'alert-danger';
  }
};

onMounted(() => {
  const taskId = route.params.id;
  fetchTaskInfo(taskId);
  fetchComments(taskId);
});
</script>

<style scoped>
textarea.form-control {
  resize: none;
}
</style>
