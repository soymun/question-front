<template>
  <div class="container mt-5">
    <!-- Header with the "Exercises" button -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- Button "Exercises" -->
      <button class="btn btn-outline-primary" @click="goBack">Упражнения</button>

      <!-- Tabs (Task and Comments) -->
      <ul class="nav nav-tabs flex-grow-1 justify-content-center">
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'"
             href="#">Задача</a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'"
             href="#">Комментарии</a>
        </li>
      </ul>
    </div>

    <!-- Task Tab -->
    <div v-if="activeTab === 'task'" class="d-flex flex-column align-items-center">
      <!-- Task Title -->
      <h1 class="w-100 text-center text-wrap mb-4">{{ taskInfo.name }}</h1>
      <!-- Google Forms-like Answer Section -->
      <div class="card mt-4" style="width: 60%;">
        <div class="task-section mt-3 text-wrap text-start w-100">
          <p v-html="taskInfo.description" class="m-5"></p>
          <a :href="`${apiUrl}/file/file/${taskInfo.file}`" v-if="taskInfo.file">
            <i class="bi bi-file-earmark"></i>
            <label>{{taskInfo.file}}</label>
          </a>
        </div>
        <div class="card-body">
          <div v-for="(box) in taskInfo.taskInfoQuestionBox" :key="box.id"
               class="form-check form-check-button mb-3 w-100">
            <input type="checkbox" class="form-check-input" :id="'box-' + box.id" :value="box.id"
                   v-model="selectedBoxes"/>
            <label class="form-check-label btn border-0 w-100 text-start text-wrap"
                   :class="{ active: selectedBoxes.includes(box.id) }" :for="'box-' + box.id">
              <span class="checkbox-custom"></span>
              {{ box.answer }}
            </label>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button class="btn btn-success w-25" @click="submitTask" :disabled="isTaskCompleted">Сдать</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comments Tab -->
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
const selectedBoxes = ref([]);
const isTaskCompleted = ref(false);
const apiUrl = import.meta.env.VITE_API_HOST;

const goBack = () => {
  router.push(`/courses/${route.params.cId}`);
};

// Fetch task information
const fetchTaskInfo = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/task/${taskId}`);
    taskInfo.value = response.data.data;
    isTaskCompleted.value = taskInfo.value.completed; // Check if the task is already completed
  } catch (error) {
    console.error('Failed to fetch task info:', error);
  }
};

// Format date
const formatDate = (dateString) => {
  const options = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

// Fetch comments
const fetchComments = async (taskId) => {
  try {
    const response = await axios.get(apiUrl + `/comments/user/task/${taskId}`);
    comments.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  }
};

// Submit a new comment
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('Комментарий не может быть пустым!');
    return;
  }

  try {
    await axios.post(apiUrl + '/comments', {task: taskInfo.value.id, message: newComment.value});
    newComment.value = '';
    await fetchComments(taskInfo.value.id);
  } catch (error) {
    console.error('Failed to submit comment:', error);
  }
};

// Submit the task
const submitTask = async () => {
  try {
    const response = await axios.post(apiUrl + '/task/execute', {
      taskId: taskInfo.value.id,
      executeBoxDto: {resultIds: selectedBoxes.value},
    });

    if (response.data.data.rights) {
      isTaskCompleted.value = true;
      await router.push(`/courses/${route.params.cId}`);
    } else {
      alert('Неправильный ответ!', 'danger');
    }
  } catch (error) {
    console.error('Failed to submit task:', error);
  }
};

onMounted(() => {
  const taskId = route.params.id;
  fetchTaskInfo(taskId);
  fetchComments(taskId);
});
</script>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

textarea.form-control {
  resize: none;
  font-size: 16px;
}

.form-check-button input[type="checkbox"] {
  opacity: 0;
  position: absolute;
}

.form-check-button label.active {
  border: none;
}

.checkbox-custom {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid black;
  border-radius: 4px;
  margin-right: 10px;
  vertical-align: middle;
  position: relative;
}

.form-check-button input[type="checkbox"]:checked + label .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  background-color: #198754;
  border-radius: 2px;
  transform: translate(-50%, -50%);
}
</style>