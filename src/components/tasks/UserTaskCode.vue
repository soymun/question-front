<template>
  <div class="container mt-4">
    <!-- Контейнер для кнопки "Назад" и Tabs -->
    <div class="d-flex justify-content-between align-items-center mb-3">
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
              :class="{ active: activeTab === 'attempts' }"
              @click="activeTab = 'attempts'"
              href="#"
          >Попытки</a>
        </li>
        <li class="nav-item">
          <a
              class="nav-link text-center"
              :class="{ active:  activeTab === 'comments' }"
              @click="activeTab = 'comments'"
              href="#"
          >Комментарии</a>
        </li>
      </ul>
    </div>

    <!-- Содержимое вкладки "Задача" -->
    <div v-if="activeTab === 'task'" class="row mt-4" style="height: 90%">
      <div class="col-md-6">
        <h5>{{taskInfo.name}}</h5>
        <p v-html="taskInfo.description"></p>
      </div>

      <!-- Разделитель -->
      <div class="col-md-1 d-flex justify-content-center align-items-center">
        <div style="border-left: 1px solid #ccc; height: 100%;"></div>
      </div>

      <div class="col-md-5" style="height: 100%;">
        <div class="mb-3">
          <label for="languageSelect" class="form-label">Выберите язык</label>
          <select id="languageSelect" v-model="selectedLanguage" class="form-select">
            <option v-for="codeType in taskInfo.taskInfoCode" :key="codeType.id" :value="codeType">
              {{ codeType.codeType.name }}
            </option>
          </select>
        </div>

        <!-- Поле ввода кода -->
        <textarea
            v-model="userCode"
            class="form-control mb-3"
            rows="10"
            placeholder="Введите код"
            style="height: 80%"
        ></textarea>

        <!-- Кнопка "Сдать" -->
        <div class="d-flex">
          <button class="btn btn-success" style="width: 100%" @click="submitTask">Сдать</button>
        </div>
      </div>
    </div>

    <!-- Попытки -->
    <div v-if="activeTab === 'attempts'" class="d-flex justify-content-center align-content-center">
      <div class="d-flex row align-content-center w-100">
        <div
            v-for="attempt in attempts"
            :key="attempt.id"
            class="task-item d-flex align-items-center justify-content-between mb-3 p-3 w-100"
            @click="showSql(attempt.code)"
        >
          <div class="d-flex align-items-center">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div v-if="attempt.rights" class="status-icon me-3">
                <i class="bi bi-check-circle-fill text-success"></i>
              </div>
              <div v-else-if="attempt.rights === false" class="status-icon me-3">
                <i class="bi bi-x-circle-fill text-danger"></i>
              </div>
              <div v-else class="status-icon me-3">
                <i class="bi bi-circle text-secondary"></i>
              </div>
              <div>
                <h6 v-if="attempt.rights != null" class="mb-1">{{ attempt.message }}</h6>
                <h6 v-else class="mb-1">Идёт проверка</h6>
                <small class="text-muted">{{ formatDate(attempt.timeResult) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно для SQL кода -->
      <div v-if="isModalVisible" class="modal-overlay" @click="closeModal">
        <div class="modal-content w-50" @click.stop>
          <h5>Код</h5>
          <pre>{{ currentSql }}</pre>
          <button class="btn btn-secondary" @click="closeModal">Закрыть</button>
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
        <textarea v-model="newComment" class="form-control" rows="3" placeholder="Введите ваш комментарий"
                  style="resize: none"></textarea>
        <button class="btn btn-primary mt-2 float-end" @click="submitComment">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeTab = ref('task');
const taskInfo = ref({});
const userCode = ref('');
const attempts = ref([]);
const currentSql = ref('');
const isModalVisible = ref(false);
const comments = ref([]);
const newComment = ref('');
const selectedLanguage = ref({});

const goBack = () => {
  router.push(`/courses/${route.params.cId}`);
};

// Функция для загрузки данных задачи
const fetchTaskInfo = async (taskId) => {
  try {
    const response = await axios.get(`http://localhost:8880/site/task/user/get/${taskId}`);
    taskInfo.value = response.data.data;
    // Инициализация кода в текстовое поле
    if (taskInfo.value.taskInfoCode.length > 0) {
      selectedLanguage.value = taskInfo.value.taskInfoCode[0];
      userCode.value = selectedLanguage.value.initCode;
    }
  } catch (error) {
    console.error('Failed to fetch task info:', error);
  }
};

// Следим за изменением выбранного языка, чтобы обновить код
watch(selectedLanguage, (newCode) => {
  userCode.value = newCode.initCode;
});

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

// Отправка задачи
const submitTask = async () => {
  try {
    await axios.post('http://localhost:8880/site/task/execute', {
      taskId: taskInfo.value.id,
      executeCodeDto: {
        dcCodeTypeDto: {
          id: selectedLanguage.value.id
        },
        userCode: userCode.value,
      },
    });
    await fetchAttempts(taskInfo.value.id);
    activeTab.value = 'attempts'
  } catch (error) {
    console.error('Failed to submit task:', error);
  }
};

// Получение комментариев
const fetchComments = async (taskId) => {
  try {
    const response = await axios.get(`http://localhost:8880/site/comments/task/${taskId}`);
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
    await axios.post('http://localhost:8880/site/comments', {
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

// Получение попыток выполнения задачи
const fetchAttempts = async (taskId) => {
  try {
    const response = await axios.get(`http://localhost:8880/site/task/history/task/user/${taskId}`);
    attempts.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch attempts:', error);
  }
};

// Закрытие модального окна
const closeModal = () => {
  isModalVisible.value = false;
};

onMounted(() => {
  const taskId = route.params.id;
  fetchTaskInfo(taskId);
  fetchAttempts(taskId);
  fetchComments(taskId);
});

const showSql = (sqlCode) => {
  currentSql.value = sqlCode;
  isModalVisible.value = true;
};

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

/* Стили для модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
}

.modal-content {
  position: relative;
  width: 90%;
  margin: auto;
  background: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.task-item, .group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}
</style>
