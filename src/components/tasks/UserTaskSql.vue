<template>
  <div class="container mt-4 h-100">
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
              :class="{ active: activeTab === 'attempts' }"
              @click="activeTab = 'attempts'"
              href="#"
          >Попытки</a>
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
    <div v-if="activeTab === 'task'" class="row mt-4" style="min-height: 75vh">

      <div class="col-md-5" style="min-height: 75vh;">
        <!-- Заменяем textarea на codemirror -->
        <codemirror
            v-model="userSql"
            placeholder="Введите SQL запрос"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="extensions"
            @ready="handleReady"
            style="min-height: 75vh"
        />

        <!-- Кнопки в одну линию -->
        <div class="d-flex">
          <button class="btn btn-outline-primary me-2" style="width: 50%" @click="executeTask">Выполнить</button>
          <button class="btn btn-success" style="width: 50%" @click="submitTask">Сдать</button>
        </div>

        <!-- Модальное окно для результата -->
        <div v-if="isModalVisibleSql" class="modal fade show" tabindex="-1" role="dialog"
             aria-labelledby="resultModalLabel" style="display: block;">
          <div class="modal-dialog h-75 overflow-auto" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="resultModalLabel">Результат</h5>
                <button type="button" class="btn-close" @click="closeModalSql"></button>
              </div>
              <div class="modal-body">
                <!-- Перебор списка результатов -->
                <div v-for="(result, index) in executionResult" :key="index">
                  <h6>Результат {{ index + 1 }}</h6>
                  <!-- Проверка и отображение resultSelect -->
                  <div v-if="result.resultSelect && result.resultSelect.length">
                    <table class="table table-bordered">
                      <thead>
                      <tr>
                        <!-- Отображение ключей из первого объекта resultSelect -->
                        <th v-for="(value, key) in result.resultSelect[0]" :key="key">{{ key }}</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="row in result.resultSelect" :key="row">
                        <!-- Отображение значений из каждого объекта resultSelect -->
                        <td v-for="(value, key) in row" :key="key">{{ value }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- Сообщение -->
                  <p v-if="result.message">{{ result.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-1 d-flex justify-content-center align-items-center">
        <div style="border-left: 1px solid #ccc; height: 100%;"></div>
      </div>

      <div class="col-md-6">
        <h5>{{taskInfo.name}}</h5>
        <p v-html="taskInfo.description"></p>
        <a :href="`${apiUrl}/file/file/${taskInfo.file}`" v-if="taskInfo.file">
          <i class="bi bi-file-earmark"></i>
          <label>{{taskInfo.file}}</label>
        </a>
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
          <h5>SQL Код</h5>
          <pre>{{ currentSql }}</pre>
          <button class="btn btn-secondary" @click="closeModal">Закрыть</button>
        </div>
      </div>
    </div>

    <!-- Комментарии -->
    <div v-if="activeTab === 'comments'" class="mt-4" style="min-height: 70%; width: 100%;">
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
import {onMounted, ref, shallowRef} from 'vue';
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';
import {Codemirror} from 'vue-codemirror';
import {sql} from '@codemirror/lang-sql';
import {oneDark} from '@codemirror/theme-one-dark';

const apiUrl = import.meta.env.VITE_API_HOST;

const router = useRouter();
const route = useRoute();

const activeTab = ref('task');
const taskInfo = ref({});
const userSql = ref('');
const executionResult = ref(null);
const attempts = ref([]);
const currentSql = ref('');
const isModalVisible = ref(false);
const isModalVisibleSql = ref(false);
const comments = ref([]);
const newComment = ref('');

const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
};

const extensions = [sql(), oneDark];

onMounted(() => {
  const taskId = route.params.id;
  fetchTaskInfo(taskId);
  fetchComments(taskId);
  fetchAttempts(taskId);
});

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

const fetchAttempts = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/task/history/task/user/${taskId}`);
    attempts.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch attempts:', error);
  }
};

const executeTask = async () => {
  try {
    const response = await axios.post(apiUrl + '/courses/execute', {
      courseId: taskInfo.value.courses,
      userSql: userSql.value,
    });
    executionResult.value = response.data.data;
    isModalVisibleSql.value = true;
  } catch (error) {
    console.error('Failed to execute task:', error);
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

const fetchComments = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/comments/user/task/${taskId}`);
    comments.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  }
};

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

const submitTask = async () => {
  try {
    await axios.post(apiUrl + '/task/execute', {
      taskId: taskInfo.value.id,
      executeSqlDto: {
        userSql: userSql.value
      }
    });
    await fetchAttempts(taskInfo.value.id);
    activeTab.value = 'attempts';
  } catch (error) {
    console.error('Failed to submit task:', error);
  }
};

const closeModal = () => {
  isModalVisible.value = false;
};

const closeModalSql = () => {
  isModalVisibleSql.value = false;
};

const showSql = (sql) => {
  currentSql.value = sql;
  isModalVisible.value = true;
};
</script>

<style scoped>
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