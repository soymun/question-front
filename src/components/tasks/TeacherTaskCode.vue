<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <button class="btn btn-outline-primary" @click="goToCourse">Упражнения</button>

      <!-- Вкладки (Tabs) -->
      <ul class="nav nav-tabs flex-grow-1 justify-content-center">
        <li class="nav-item">
          <a
              class="nav-link text-center"
              :class="{ active: activeTab === 'main' }"
              @click="activeTab = 'main'"
              href="#"
          >Основные</a>
        </li>
        <li class="nav-item">
          <a
              class="nav-link text-center"
              :class="{ active: activeTab === 'additional' }"
              @click="activeTab = 'additional'"
              href="#"
          >Дополнительные</a>
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

    <!-- Main Panel (Основные) -->
    <div v-if="activeTab === 'main'">
      <div class="form-group">
        <label for="taskNumber">Номер задачи</label>
        <input type="number" v-model="task.number" class="form-control" id="taskNumber">
      </div>
      <div class="form-group">
        <label for="taskName">Название задачи</label>
        <input type="text" v-model="task.name" class="form-control" id="taskName">
      </div>
      <div class="form-group">
        <label for="taskTitle">Заголовок задачи</label>
        <input type="text" v-model="task.title" class="form-control" id="taskTitle">
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" v-model="task.open" id="taskOpen">
        <label class="form-check-label" for="taskOpen">Открыта</label>
      </div>
      <div class="form-group">
        <label for="additionalDescription">Описание</label>
        <textarea v-model="task.description" class="form-control mb-1" id="additionalDescription" rows="10"
                  style="resize: none"></textarea>
      </div>
      <div class="w-100 d-flex justify-content-end">
        <button class="btn btn-success w-25" @click="saveTask">Сохранить</button>
      </div>
    </div>

    <!-- Additional Panel (Дополнительные) -->
    <!-- Additional Panel (Дополнительные) -->
    <div v-if="activeTab === 'additional'">
      <!-- Кнопка для добавления нового типа кода -->
      <button class="btn btn-outline-primary mb-3" @click="openAddDialog">Добавить</button>

      <!-- Список существующих типов кода -->
      <div v-for="(code, index) in taskInfoCode" :key="index" class="mb-3">
        <div @click="selectCodeType(index)" class="d-flex justify-content-between align-items-center cursor-pointer task-item">
          <strong class="w-100 text-center">{{ code.codeType.name }}</strong>
        </div>

        <!-- Поля для редактирования выбранного кода -->
        <div v-if="selectedCodeIndex === index">
          <div class="w-100 d-flex justify-content-between">
            <div style="width: 48%">
              <div class="form-group">
                <label for="userClass">Класс пользователя</label>
                <input v-model="code.userClass" type="text" class="form-control" id="userClass">
              </div>

              <div class="form-group">
                <label for="initCode">Начальный код</label>
                <textarea v-model="code.initCode" class="form-control" id="initCode" rows="17" style="resize: none"></textarea>
              </div>
            </div>

            <div style="width: 48%">
              <div class="form-group">
                <label for="checkClass">Проверяющий класс</label>
                <input v-model="code.checkClass" type="text" class="form-control" id="checkClass">
              </div>

              <div class="form-group">
                <label for="checkCode">Проверяющий код</label>
                <textarea v-model="code.checkCode" class="form-control" id="checkCode" rows="17" style="resize: none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно для добавления нового типа кода -->
      <div v-if="isAddDialogVisible" class="modal-overlay">
        <div class="modal-content">
          <h5>Добавить тип кода</h5>
          <select v-model="newCodeTypeId" class="form-control mb-3">
            <option v-for="type in codeTypes" :value="type.id" :key="type.id">{{ type.name }}</option>
          </select>
          <button class="btn btn-primary" @click="addCodeType">Добавить</button>
          <button class="btn btn-secondary" @click="closeAddDialog">Закрыть</button>
        </div>
      </div>

      <div class="w-100 d-flex justify-content-end">
        <button class="btn btn-success w-25" @click="saveTask">Сохранить</button>
      </div>
    </div>

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

    <div v-if="activeTab === 'comments'" class="mt-4" style="height: 70%; width: 100%;">
      <div class="h-100 overflow-auto">
        <div v-for="comment in comments" :key="comment.id" class="border p-3 mb-3">
          <div class="d-flex justify-content-between">
            <strong>{{ comment.user.firstName }} {{ comment.user.secondName }}</strong>
            <small class="text-muted">{{ formatDate(comment.createTime) }}</small>
          </div>
          <p>{{ comment.message }}</p>
          <div class="w-100 d-flex justify-content-end">
            <button class="btn btn-danger btn-sm me-1" @click="deleteComment(comment.id)">Удалить</button>
            <button class="btn btn-success btn-sm" @click="applyComment(comment.id)">Применить</button>
          </div>
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
import axios from 'axios';
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();
const activeTab = ref('main');
const task = ref({
  number: 0,
  name: '',
  title: '',
  open: true,
  description: '',
  taskInfoCode: []
});
const attempts = ref([]);
const comments = ref([]);
const newComment = ref('');
const currentSql = ref('');
const isModalVisible = ref(false);
const taskInfoCode = ref([]);  // Массив с кодами
const codeTypes = ref([]);      // Массив с типами кода
const selectedCodeIndex = ref(null);  // Индекс выбранного типа кода
const isAddDialogVisible = ref(false); // Видимость модального окна добавления
const newCodeTypeId = ref(null);  // Выбранный тип кода для добавления

const openAddDialog = async () => {
  // Получение типов кода с сервера
  const response = await axios.get('http://localhost:8880/site/dc/code-type');
  codeTypes.value = response.data.data;
  isAddDialogVisible.value = true;
};

// Закрыть модальное окно
const closeAddDialog = () => {
  isAddDialogVisible.value = false;
  newCodeTypeId.value = null;
};

// Добавление нового типа кода
const addCodeType = () => {
  // Проверка на уникальность
  const exists = taskInfoCode.value.some(code => code.codeType.id === newCodeTypeId.value);
  if (exists) {
    alert('Этот тип кода уже добавлен');
    return;
  }

  // Добавление в массив
  const selectedType = codeTypes.value.find(type => type.id === newCodeTypeId.value);
  taskInfoCode.value.push({
    codeType: selectedType,
    initCode: '',
    checkCode: '',
    checkClass: '',
    userClass: ''
  });

  closeAddDialog();
};

// Выбор типа кода для редактирования
const selectCodeType = (index) => {
  if (selectedCodeIndex.value === index){
    selectedCodeIndex.value = null;
  } else {
    selectedCodeIndex.value = index;
  }
};

// Сохранение изменений в коде
const closeModal = () => {
  isModalVisible.value = false;
};

const goToCourse = () => {
  router.push(`/teacher/courses/${route.params.id}`);
};
const fetchTaskData = async () => {
  const response = await axios.get(`http://localhost:8880/site/task/teacher/get/${route.params.taskId}`);
  task.value = response.data.data;
  taskInfoCode.value = task.value.taskInfoCode;
};

const fetchAttempts = async () => {
  try {
    const response = await axios.get(`http://localhost:8880/site/task/history/task/${route.params.taskId}`);
    attempts.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch attempts:', error);
  }
};

const showSql = (sql) => {
  currentSql.value = sql;
  isModalVisible.value = true;
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

const saveTask = async () => {
  task.value.taskInfoCode = taskInfoCode.value;
  await axios.post('http://localhost:8880/site/task', task.value);
};

const fetchComments = async () => {
  const response = await axios.get(`http://localhost:8880/site/comments/task/${route.params.taskId}/all`)
  comments.value = response.data.data;
};
const deleteComment = async (commentId) => {
  await axios.delete(`http://localhost:8880/site/comments/${commentId}`)
  await fetchComments();
};
const applyComment = async (commentId) => {
  await axios.put(`http://localhost:8880/site/comments/apply/${commentId}`);
  await fetchComments();
};
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('Комментарий не может быть пустым!');
    return;
  }

  try {
    await axios.post('http://localhost:8880/site/comments', {
      task: route.params.taskId,
      message: newComment.value,
    });

    newComment.value = '';
    await fetchComments();
  } catch (error) {
    console.error('Failed to submit comment:', error);
  }
};

onMounted(async () => {
  await fetchTaskData();
  await fetchAttempts();
  await fetchComments();
})

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
