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
        <QuillEditor content-type="html"  v-model:content="task.description" toolbar="full" theme="snow" style="resize: none; min-height: 40vh; background-color: white"/>
      </div>
      <div class="w-100 d-flex justify-content-end">
        <button class="btn btn-success w-25" @click="saveTask">Сохранить</button>
      </div>
    </div>

    <!-- Additional Panel (Дополнительные) -->
    <!-- Additional Panel (Дополнительные) -->
    <div v-if="activeTab === 'additional'">

      <div class="w-100 d-flex justify-content-end mb-3">
        <button class="btn btn-primary" @click="openAddModal">Добавить вопрос</button>
      </div>


      <div v-for="(question, index) in task.taskInfoQuestionBox" :key="index" class="border p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <!-- Отображение ответа -->
          <div>
            <strong>Ответ:</strong> {{ question.answer }} <br>
            <strong>Правильность:</strong> {{ question.rights ? 'Верен' : 'Не верен' }}
          </div>

          <!-- Кнопки управления -->
          <div>
            <button class="btn btn-warning btn-sm me-2" @click="openEditModal(index)">Изменить</button>
            <button class="btn btn-danger btn-sm" @click="deleteBox(index)">Удалить</button>
          </div>
        </div>
      </div>

      <!-- Кнопка добавления нового элемента -->

      <!-- Кнопка для сохранения -->
      <div class="w-100 d-flex justify-content-end">
        <button class="btn btn-success w-25" @click="saveTask">Сохранить</button>
      </div>


      <div v-if="openModal" class="modal-overlay" tabindex="-1">
          <div class="modal-content w-50">
            <div class="modal-header d-flex justify-content-between">
              <h5 class="modal-title" id="questionModalLabel">{{ modalMode === 'edit' ? 'Изменить вопрос' : 'Добавить вопрос' }}</h5>
              <button type="button" class="btn-close" @click="closeModel"></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="modalAnswer">Ответ</label>
                <input
                    type="text"
                    v-model="modalData.answer"
                    class="form-control"
                    id="modalAnswer"
                    placeholder="Введите ответ"
                >
              </div>
              <div class="form-group mt-3">
                <label for="modalRights">Правильность</label>
                <select v-model="modalData.rights" class="form-select" id="modalRights">
                  <option :value="true">Верен</option>
                  <option :value="false">Не верен</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="saveModalData">{{ modalMode === 'edit' ? 'Изменить' : 'Добавить' }}</button>
            </div>
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
import {QuillEditor} from "@rafaeljunioxavier/vue-quill-fix";

const route = useRoute();
const router = useRouter();
const activeTab = ref('main');
const task = ref({
  number: 0,
  name: '',
  title: '',
  open: true,
  description: '',
  taskInfoQuestionBox: []
});
const comments = ref([]);
const newComment = ref('');
const modalData = ref({
  answer: '',
  rights: true
});
const modalMode = ref('add'); // режим модального окна ('add' или 'edit')
const editIndex = ref(null); // индекс вопроса для редактирования
const openModal = ref(false);
const apiUrl = import.meta.env.VITE_API_HOST;

const goToCourse = () => {
  router.push(`/teacher/courses/${route.params.id}`);
};
const fetchTaskData = async () => {
  const response = await axios.get(apiUrl + `/task/teacher/${route.params.taskId}`);
  task.value = response.data.data;
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

// Функции для открытия модальных окон
const openAddModal = () => {
  modalMode.value = 'add';
  modalData.value = { answer: '', rights: true };
  openModal.value = true;
};

const openEditModal = (index) => {
  modalMode.value = 'edit';
  editIndex.value = index;
  modalData.value = { ...task.value.taskInfoQuestionBox[index] };
  openModal.value = true;
};


// Сохранение данных из модального окна
const saveModalData = () => {
  if (modalMode.value === 'add') {
    task.value.taskInfoQuestionBox.push({ ...modalData.value });
  } else if (modalMode.value === 'edit') {
    task.value.taskInfoQuestionBox[editIndex.value] = { ...modalData.value };
  }

  openModal.value = false;
};

// Удаление вопроса
const deleteBox = (index) => {
  task.value.taskInfoQuestionBox.splice(index, 1);
};

const closeModel = () => {
  openModal.value = false;
};


const saveTask = async () => {
  await axios.post(apiUrl + '/task', task.value);
};
const fetchComments = async () => {
  const response = await axios.get(apiUrl + `/comments/teacher/task/${route.params.taskId}`)
  comments.value = response.data.data;
};
const deleteComment = async (commentId) => {
  await axios.delete(apiUrl + `/comments/${commentId}`)
  await fetchComments();
};
const applyComment = async (commentId) => {
  await axios.put(apiUrl + `/comments/apply/${commentId}`);
  await fetchComments();
};
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('Комментарий не может быть пустым!');
    return;
  }

  try {
    await axios.post(apiUrl + '/comments', {
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
