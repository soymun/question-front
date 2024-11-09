<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Упражнения</h2>

    <!-- Проверка на наличие задач -->
    <div v-if="tasks.length" class="row justify-content-center">
      <div v-for="task in tasks" :key="task.userTaskId.id" class="col-md-8">
        <div class="task-item d-flex align-items-center justify-content-between mb-3 p-3"
             @click="redirectToTask(task.userTaskId)">
          <!-- Иконка статуса выполнения задачи -->
          <div class="d-flex align-items-center">
            <div v-if="task.rights" class="status-icon me-3">
              <i class="bi bi-check-circle-fill text-success"></i>
            </div>
            <div v-else-if="!task.rights && task.attempt > 0" class="status-icon me-3">
              <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <div v-else class="status-icon me-3">
              <i class="bi bi-circle text-secondary"></i>
            </div>

            <!-- Номер и название задачи -->
            <div class="task-info">
              <h5 class="mb-0">{{ task.userTaskId.number }}. {{ task.userTaskId.title.substring(0, 50) }}</h5>
            </div>
          </div>

          <!-- Количество попыток -->
          <div class="attempt-info text-muted">
            <small>Попыток: {{ task.attempt }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение, если задач нет -->
    <div v-else class="text-center">
      <p>Задач для данного курса нет.</p>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';
import {useRoute, useRouter} from 'vue-router';

const tasks = ref([]);
const route = useRoute();
const router = useRouter();

const fetchTasks = async (courseId) => {
  try {
    const response = await axios.get(`http://localhost:8880/site/task/user/course/${courseId}`);
    tasks.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  }
};

// Функция для редиректа на панель выполнения задачи
const redirectToTask = (task) => {
  // Определяем путь в зависимости от типа задачи
  switch (task.taskType) {
    case 'PostgreSQL':
      router.push(`/courses/${route.params.id}/task/sql/${task.id}`);
      break;
    case 'MySQL':
      router.push(`/courses/${route.params.id}/task/sql/${task.id}`);
      break;
    case 'QUESTION_TEXT':
      router.push(`/courses/${route.params.id}/task/text/${task.id}`);
      break;
    case 'NONE':
      router.push(`/courses/${route.params.id}/task/none/${task.id}`);
      break;
    case 'QUESTION_BOX_MULTI':
      router.push(`/courses/${route.params.id}/task/box/${task.id}`);
      break;
    case 'CODE':
      router.push(`/courses/${route.params.id}/task/code/${task.id}`);
      break;
    default:
      console.error('Unknown task type:', task.taskType);
  }
};

onMounted(() => {
  const courseId = route.params.id;
  fetchTasks(courseId);
});
</script>

<style scoped>
.task-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.task-item:hover {
  transform: translateY(-5px);
}

.status-icon i {
  font-size: 24px;
}

.task-info h5 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.attempt-info small {
  font-size: 0.9rem;
}
</style>
