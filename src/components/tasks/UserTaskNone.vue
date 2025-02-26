<template>
  <div class="container mt-4">
    <!-- Контейнер для кнопки "Назад" и Tabs -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <!-- Кнопка "Назад" -->
      <button class="btn btn-outline-primary" @click="goBack">Упражнения</button>

      <!-- Вкладки (Tabs) -->
      <ul class="nav nav-tabs flex-grow-1 justify-content-center">
        <li class="nav-item">
          <a
              class="nav-link text-center"
              :class="{ active: activeTab === 'task' }"
              @click="activeTab = 'task'"
              href="#"
          >Задача</a>
        </li>
        <li class="nav-item">
          <a
              class="nav-link text-center"
              :class="{ active: activeTab === 'comments' }"
              @click="activeTab = 'comments'"
              href="#"
          >Комментарии</a>
        </li>
      </ul>
    </div>

    <!-- Содержимое вкладок -->
    <div v-if="activeTab === 'task'" class="row mt-4" style="height: 70%; width: 100%;">
      <!-- Task Description -->
      <div class="h-100 w-100">
        <p v-html="taskInfo.description"></p>
        <a :href="`${apiUrl}/file/file/${taskInfo.file}`" v-if="taskInfo.file">
          <i class="bi bi-file-earmark"></i>
          <label>{{taskInfo.file}}</label>
        </a>
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
import {onMounted, ref} from 'vue';
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = ref('task');
const taskInfo = ref({});
const comments = ref([]);
const newComment = ref('');
const apiUrl = import.meta.env.VITE_API_HOST;

const goBack = () => {
  router.push(`/courses/${route.params.cId}`);
};

const fetchTaskInfo = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/task/${taskId}`);
    taskInfo.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch task info:', error);
  }
};

const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', options).replace(',', '');
};

// Получение комментариев
const fetchComments = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/comments/user/task/${taskId}`);
    comments.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  }
};

// Отправка нового комментария
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

    // После успешной отправки, очищаем поле и обновляем список комментариев
    newComment.value = '';
    fetchComments(taskInfo.value.id);
  } catch (error) {
    console.error('Failed to submit comment:', error);
  }
};


onMounted(() => {
  const taskId = route.params.id;
  fetchTaskInfo(taskId);
  fetchComments(taskId);
});
</script>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
}

textarea.form-control {
  resize: none;
  font-size: 16px; /* Увеличим шрифт */
}

.d-flex .btn {
  width: auto; /* Устанавливаем ширину кнопок автоматической */
}

.nav-tabs {
  flex-grow: 1; /* Растягиваем Tabs на всю доступную ширину */
}
</style>
