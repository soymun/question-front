<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">Управление курсом</h2>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- Tabs (Tasks and Students) -->
      <ul class="nav nav-tabs flex-grow-1 justify-content-center">
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'"
             href="#">Задачи</a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'students' }" @click="activeTab = 'students'"
             href="#">Студенты</a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-center" :class="{ active: activeTab === 'grades' }" @click="activeTab = 'grades'"
             href="#">Оценки</a>
        </li>
        <li class="nav-item" v-if="course.schema">
          <a class="nav-link text-center" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'"
             href="#">Настройка</a>
        </li>
      </ul>
    </div>

    <div v-if="activeTab === 'tasks'">
      <div class="d-flex justify-content-end mb-3">
        <button @click="openCreateTaskGroupModal()" class="btn btn-success" style="width: 15%">Добавить модуль
        </button>
      </div>
      <div v-if="taskGroups.length" class="row justify-content-center accordion" id="accordion">
        <div v-for="taskGroup in taskGroups" :key="taskGroup.id" class="accordion-item col-md-8" :id="taskGroup.id">
          <h2 class="accordion-header" :id="'heading' + taskGroup.id">
            <button class="accordion-button w-100" type="button" data-bs-toggle="collapse"
                    :data-bs-target="'#collapse' + taskGroup.id"
                    aria-expanded="true" :aria-controls="'collapse' + taskGroup.id"
                    @click="fetchTasksForGroup(taskGroup.id)">
              <div class="d-flex align-items-center w-100">
                <div class="w-50">
                  <h5 class="mb-0">{{ taskGroup.number }}. {{ taskGroup.name }}</h5>
                </div>
                <div class="d-flex w-100"></div>
                <div class="mt-auto d-flex row justify-content-center align-content-center h-100 me-1">
                  <button @click.stop="deleteTaskGroup(taskGroup.id)" class="btn btn-danger btn-sm">Удалить</button>
                </div>
              </div>
            </button>
          </h2>
          <div :id="'collapse' + taskGroup.id" class="accordion-collapse collapse"
               :aria-labelledby="taskGroup.id"
               data-bs-parent="#accordion">
            <div class="accordion-body">
              <div v-if="tasks[taskGroup.id] && tasks[taskGroup.id].length" class="mb-2 p-3">
                <div v-for="task in tasks[taskGroup.id]" :key="task.id" class="task-item mb-2">
                  <div class="task-item d-flex align-items-center justify-content-between mb-3 p-3"
                       @click="openEditPanelTask(task)">
                    <div class="w-50">
                      <h5 class="mb-0">{{ task.number }}. {{ task.title.substring(0, 50) }}</h5>
                    </div>

                    <div class="d-flex w-100"></div>

                    <div class="mt-auto d-flex row justify-content-center align-content-center h-100 me-1">
                      <button @click.stop="deleteTask(task.id)" class="btn btn-danger btn-sm">Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center">
                <p>Задач для данной группы нет.</p>
              </div>
              <div class="d-flex justify-content-center mt-3">
                <button @click="openCreateTaskModal(taskGroup.id)" class="btn btn-success btn-sm">Добавить задачу
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center">
        <p>Модулей для данного курса нет.</p>
      </div>

      <div v-if="isCreateTaskGroupModalVisible" class="modal-overlay">
        <div class="modal-content w-50">
          <div class="model-header d-flex justify-content-between">
            <h5 class="modal-title">Создание группы задач</h5>
            <button type="button" class="btn-close" @click="closeCreateTaskGroupModal"></button>
          </div>
          <form @submit.prevent="createTaskGroup">
            <div class="form-group">
              <label for="taskGroupNumber">Номер группы задач:</label>
              <input type="number" v-model="newTaskGroup.number" id="taskGroupNumber" class="form-control">
            </div>
            <div class="form-group">
              <label for="taskGroupName">Название группы задач:</label>
              <input type="text" v-model="newTaskGroup.name" id="taskGroupName" class="form-control">
            </div>
            <div class="w-100 d-flex justify-content-end">
              <button type="submit" class="btn btn-success mt-3">Создать группу задач</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Модальное окно для создания задачи -->
      <div v-if="isCreateTaskModalVisible" class="modal-overlay">
        <div class="modal-content w-50">
          <div class="model-header d-flex justify-content-between">
            <h5 class="modal-title">Создание задачи</h5>
            <button type="button" class="btn-close" @click="closeCreateTaskModal"></button>
          </div>
          <form @submit.prevent="createTask">
            <div class="form-group">
              <label for="taskNumber">Номер задачи:</label>
              <input type="number" v-model="newTask.number" id="taskNumber" class="form-control">
            </div>
            <div class="form-group">
              <label for="taskTitle">Название задачи:</label>
              <input type="text" v-model="newTask.title" id="taskTitle" class="form-control">
            </div>
            <div class="form-group">
              <label for="taskDescription">Описание задачи:</label>
              <textarea v-model="newTask.description" id="taskDescription" class="form-control h-25"
                        style="resize: none;height: 10%"></textarea>
            </div>
            <div class="form-group">
              <label for="taskType">Тип задачи:</label>
              <select v-model="newTask.taskType" id="taskType" class="form-control">
                <option value="NONE">NONE</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="MySQL">MySQL</option>
                <option value="QUESTION_BOX_ONE">Один вариант</option>
                <option value="QUESTION_BOX_MULTI">Множественный выбор</option>
                <option value="QUESTION_TEXT">Текст</option>
                <option value="CODE">Код</option>
              </select>
            </div>
            <div class="w-100 d-flex justify-content-end">
              <button type="submit" class="btn btn-success mt-3">Создать задачу</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'students'">
      <div class="d-flex justify-content-end align-items-center mb-3">
        <button @click="openAddUserModal" class="btn btn-success" style="width: 16%; margin-right: 10px">Добавить
          Пользователя
        </button>
        <button @click="openAddGroupModal" class="btn btn-success" style="width: 16%">Добавить Группу</button>
      </div>
      <div v-if="groups.length" class="row justify-content-center">
        <div v-for="group in groups" :key="group.id"
             class="task-item col-md-8 d-flex justify-content-between align-items-center m-3"
             @click="toggleUsers(group.id)">
          <div class="d-flex justify-content-between align-items-center m-3 w-100">
            <h5>{{ group.shortName }}</h5>
            <button @click.stop="excludeGroup(group.id)" class="btn btn-danger">Исключить</button>
          </div>
        </div>
      </div>
      <div v-if="open" class="mt-3">
        <h4>Пользователи группы</h4>
        <div v-for="user in users" :key="user.id"
             class="task-item d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex justify-content-between align-items-center m-3 w-100">
            <div class="d-flex row align-content-center justify-content-center ms-5">
              <p class="mb-0">{{ user.user.firstName }} {{ user.user.secondName }}</p>
            </div>
            <div class="d-flex align-content-center justify-content-center me-1">
              <p class="text-muted mt-3 me-5">Оценка: {{ getMark(user.courseMarks) }}</p>
              <button @click="excludeUser(user.user.id)" class="btn btn-danger">Исключить</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isAddUserModalVisible" class="modal-overlay">
        <div class="modal-content w-50">
          <div class="model-header d-flex justify-content-between">
            <h5 class="modal-title">Добавление пользователя</h5>
            <button type="button" class="btn-close" @click="closeAddUserModal"></button>
          </div>
          <form @submit.prevent="addUserToCourse">
            <div class="form-group">
              <label for="userName">Имя пользователя:</label>
              <input
                  type="text"
                  v-model="userName"
                  id="userName"
                  class="form-control"
                  @input="searchUsers"
              />
            </div>
            <div v-if="usersList.length" class="form-group">
              <label for="userSelect">Выберите пользователя:</label>
              <select v-model="userId" id="userSelect" class="form-control">
                <option disabled value="">Выберите пользователя</option>
                <option v-for="user in usersList" :key="user.id" :value="user.id">
                  {{ user.firstName }} {{ user.secondName }}
                </option>
              </select>
            </div>
            <div class="d-flex justify-content-end">
              <button @click="addUserToCourse" class="btn btn-success mt-3">
                Добавить
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="isAddGroupModalVisible" class="modal-overlay">
        <div class="modal-content w-50">
          <div class="model-header d-flex justify-content-between">
            <h5 class="modal-title">Добавление группы</h5>
            <button type="button" class="btn-close" @click="closeAddGroupModal"></button>
          </div>
          <form @submit.prevent="addGroupToCourse">
            <div class="form-group">
              <label for="groupName">Название группы:</label>
              <input
                  type="text"
                  v-model="groupName"
                  id="groupName"
                  class="form-control"
                  @input="searchGroups"
              />
            </div>
            <div v-if="groupsList.length" class="form-group">
              <label for="groupSelect">Выберите группу:</label>
              <select v-model="groupId" id="groupSelect" class="form-control">
                <option disabled value="">Выберите группу</option>
                <option v-for="group in groupsList" :key="group.id" :value="group.id">
                  {{ group.fullName }}
                </option>
              </select>
            </div>
            <div class="d-flex justify-content-end">
              <button @click="addGroupToCourse" class="btn btn-success mt-3">
                Добавить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'grades'">
      <div class="d-flex justify-content-end align-items-center mb-3">
        <button @click="openAddMarkModal" class="btn btn-success" style="width: 20%">Добавить оценку</button>
      </div>
      <div class="d-flex row justify-content-center">
        <div v-for="mark in marks" :key="mark.id"
             class="col-md-8">
          <div class="task-item d-flex justify-content-between align-items-center mb-2 w-100">
            <div class="d-flex justify-content-between align-items-center m-3 w-100">
              <div class="d-flex align-content-center justify-content-center me-1">
                <h5 class="ms-3">{{ mark.mark }}</h5>
              </div>
              <div class="d-flex align-content-center justify-content-center">
                <p class="text-muted mt-3 me-5">Количество задач: {{ mark.countTask }}</p>
                <button @click="deleteMark(mark.id)" class="btn btn-danger">Удалить</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isAddMarkModalVisible" class="modal-overlay">
        <div class="modal-content w-50">
          <div class="model-header d-flex justify-content-between">
            <h5 class="modal-title">Создание оценки</h5>
            <button type="button" class="btn-close" @click="closeAddMarkModal"></button>
          </div>
          <form @submit.prevent="addMark">
            <div class="form-group">
              <label for="markValue">Оценка:</label>
              <input type="number" v-model="newMark.mark" id="markValue" class="form-control">
            </div>
            <div class="form-group">
              <label for="taskCount">Количество задач:</label>
              <input type="number" v-model="newMark.countTask" id="taskCount" class="form-control">
            </div>
            <div class="w-100 d-flex justify-content-end">
              <button type="submit" class="btn btn-success mt-3">Добавить</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'settings' && course.schema" class="h-75">
      <h4>SQL настройка</h4>
      <!-- Заменяем textarea на codemirror -->
      <codemirror
          v-model="userSql"
          placeholder="Введите SQL"
          :style="{ height: '400px' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="extensions"
          @ready="handleReady"
          style="min-height: 65vh"
      />
      <div class="d-flex justify-content-end">
        <button @click="executeTask" class="btn btn-success mt-2 w-25">Выполнить</button>
      </div>
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
  </div>
</template>

<script setup>
import {onMounted, ref, shallowRef} from 'vue';
import axios from 'axios';
import {useRoute} from 'vue-router';
import router from "@/router.js";
import {Codemirror} from 'vue-codemirror';
import {sql} from '@codemirror/lang-sql';
import {oneDark} from '@codemirror/theme-one-dark';

const route = useRoute();
const isModalVisible = ref(false);
const isModalVisibleSql = ref(false);
const newMark = ref({
  courses: route.params.id,
  countTask: 0,
  mark: 0,
});
const activeTab = ref('tasks');
const tasks = ref({});
const taskGroups = ref([]);
const groups = ref([]);
const users = ref([]);
const marks = ref([]);
const executionResult = ref(null);
const userSql = ref('');
const course = ref({});
const open = ref(false);
const prevId = ref(0)
const isCreateTaskGroupModalVisible = ref(false);
const isCreateTaskModalVisible = ref(false);
const isAddUserModalVisible = ref(false);
const isAddGroupModalVisible = ref(false);
const isAddMarkModalVisible = ref(false);
const newTaskGroup = ref({
  number: 0,
  name: '',
  courses: route.params.id,
});
const newTask = ref({
  number: 0,
  name: '',
  description: '',
  title: '',
  taskType: 'NONE',
  courses: route.params.id,
  taskGroup: null, // ID группы задач
  file: '',
});
const usersList = ref([]);
const groupName = ref('');
const userName = ref('');
const groupsList = ref([]);
const userId = ref(0);
const groupId = ref(0);
const apiUrl = import.meta.env.VITE_API_HOST;

const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
};

const extensions = [sql(), oneDark];

const openCreateTaskGroupModal = () => {
  isCreateTaskGroupModalVisible.value = true;
};
const closeCreateTaskGroupModal = () => {
  isCreateTaskGroupModalVisible.value = false;
};

const openCreateTaskModal = (taskGroupId) => {
  newTask.value.taskGroup = taskGroupId;
  isCreateTaskModalVisible.value = true;
};
const closeCreateTaskModal = () => {
  isCreateTaskModalVisible.value = false;
};

const openAddUserModal = () => {
  isAddUserModalVisible.value = true;
};
const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
};

const openAddGroupModal = () => {
  isAddGroupModalVisible.value = true;
};
const closeAddGroupModal = () => {
  isAddGroupModalVisible.value = false;
};

const openAddMarkModal = () => {
  isAddMarkModalVisible.value = true;
};
const closeAddMarkModal = () => {
  isAddMarkModalVisible.value = false;
};

const createTaskGroup = async () => {
  try {
    const response = await axios.post(apiUrl + `/task-group`, newTaskGroup.value);
    newTaskGroup.value = {
      number: 0,
      name: '',
      courses: route.params.id,
    };
    await fetchTaskGroups(route.params.id);
    console.log('Task group created:', response.data);
    closeCreateTaskGroupModal();
  } catch (error) {
    console.error('Failed to create task group:', error);
  }
};

const fetchTasksForGroup = async (taskGroupId) => {
  try {
    const response = await axios.get(apiUrl + `/task/v2/search/course/${route.params.id}/${taskGroupId}`);
    tasks.value[taskGroupId] = response.data.data;
  } catch (error) {
    console.error('Failed to fetch tasks for group:', error);
  }
};

const deleteTaskGroup = async (taskGroupId) => {
  try {
    const response = await axios.delete(apiUrl + `/task-group/${taskGroupId}`);
    await fetchTaskGroups(route.params.id);
  } catch (error) {
    console.error('Error:', error);
  }
};

const fetchTaskGroups = async (courseId) => {
  try {
    const response = await axios.get(apiUrl + `/task-group/search/course/${courseId}`);
    taskGroups.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch task groups:', error);
  }
};

const searchUsers = async () => {
  try {
    const response = await axios.get(apiUrl + `/users?name=${userName.value}`);
    usersList.value = response.data.data; // Возвращаем список найденных пользователей
  } catch (error) {
    console.error('Failed to search users:', error);
  }
};

const searchGroups = async () => {
  try {
    const response = await axios.get(apiUrl + `/groups/name/${groupName.value}`);
    groupsList.value = response.data.data; // Возвращаем список найденных групп
  } catch (error) {
    console.error('Failed to search groups:', error);
  }
};

const addGroupToCourse = async () => {
  await axios.post(apiUrl + `/user/courses/course/${route.params.id}/group/${groupId.value}`);
  await fetchGroups(route.params.id);
  await toggleUsers(prevId.value)
  closeAddGroupModal()
};

const addUserToCourse = async () => {
  await axios.post(apiUrl + `/user/courses/course/${userId.value}/add/${route.params.id}`);
  await fetchGroups(route.params.id);
  await toggleUsers(prevId.value)
  closeAddUserModal();
};

const createTask = async () => {
  try {
    const response = await axios.post(apiUrl + `/task`, newTask.value);
    newTask.value = {
      number: 0,
      name: '',
      description: '',
      title: '',
      taskType: 'NONE',
      courses: route.params.id,
      taskGroup: null,
      file: '',
    };
    await fetchTasksForGroup(newTask.value.taskGroup);
    console.log('Task created:', response.data);
    closeCreateTaskModal();
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};

const openEditPanelTask = (task) => {
  switch (task.taskType) {
    case 'PostgreSQL':
      router.push(`/teacher/courses/${route.params.id}/task/sql/${task.id}`);
      break;
    case 'MySQL':
      router.push(`/teacher/courses/${route.params.id}/task/sql/${task.id}`);
      break;
    case 'QUESTION_TEXT':
      router.push(`/teacher/courses/${route.params.id}/task/text/${task.id}`);
      break;
    case 'NONE':
      router.push(`/teacher/courses/${route.params.id}/task/none/${task.id}`);
      break;
    case 'QUESTION_BOX_MULTI':
      router.push(`/teacher/courses/${route.params.id}/task/box/${task.id}`);
      break;
    case 'QUESTION_BOX_ONE':
      router.push(`/teacher/courses/${route.params.id}/task/box/${task.id}`);
      break;
    case 'CODE':
      router.push(`/teacher/courses/${route.params.id}/task/code/${task.id}`);
      break;
    default:
      console.error('Unknown task type:', task.taskType);
  }
}

const addMark = async () => {
  try {
    await axios.post(apiUrl + `/course/marks`, newMark.value);
    newMark.value = {courses: route.params.id, countTask: 0, mark: 0}; // Reset the new mark
    isModalVisible.value = false;
    await fetchMarks(route.params.id)
  } catch (error) {
    console.error('Failed to add mark:', error);
  }
};

const deleteMark = async (markId) => {
  try {
    const response = await axios.delete(apiUrl + `/course/marks/${markId}`);
    await fetchMarks(route.params.id);
    if (response.status === 200) {
      console.log(`Mark with ID ${markId} has been deleted.`);
    } else {
      console.error('Failed to delete mark');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const excludeUser = async (userId) => {
  try {
    const response = await axios.delete(apiUrl + `/user/courses/user/${userId}/course/${route.params.id}`);
    await toggleUsers(prevId.value)
  } catch (error) {
    console.error('Error:', error);
  }
};

const excludeGroup = async (groupId) => {
  try {
    const response = await axios.delete(apiUrl + `/user/courses/course/${route.params.id}/group/${groupId}`);
    await fetchGroups(route.params.id);
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteTask = async (taskId) => {
  try {
    const response = await axios.delete(apiUrl + `/task/${taskId}`);
    await fetchTasksForGroup(newTask.value.taskGroup);
  } catch (error) {
    console.error('Error:', error);
  }
};

const closeModalSql = () => {
  isModalVisibleSql.value = false;
};

// Fetch course info
const fetchCourse = async (courseId) => {
  try {
    const response = await axios.get(apiUrl + `/courses/${courseId}`);
    course.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch course:', error);
  }
};

const getMark = (mark) => {
  return mark ? mark.mark : 0;
}

// Fetch groups for the course
const fetchGroups = async (courseId) => {
  try {
    const response = await axios.get(apiUrl + `/groups/course/${courseId}`);
    groups.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
  }
};

// Fetch marks for the course
const fetchMarks = async (courseId) => {
  try {
    const response = await axios.get(apiUrl + `/course/marks/course/${courseId}`);
    marks.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch marks:', error);
  }
};

// Method to toggle user list visibility
const toggleUsers = async (groupId) => {
  if (groupId == null) return;
  if (open.value && prevId.value === groupId) {
    console.log(false)
    open.value = false; // Clear users if they are already shown
    return;
  }
  try {
    const response = await axios.get(apiUrl + `/user/courses/course/${route.params.id}/group/${groupId}`);
    users.value = response.data.data;
    open.value = true;
    prevId.value = groupId;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

const executeTask = async () => {
  try {
    const response = await axios.post(apiUrl + '/courses/task/execute', {
      courseId: route.params.id,
      userSql: userSql.value,
    });
    executionResult.value = response.data.data;
    isModalVisibleSql.value = true;
  } catch (error) {
    console.error('Failed to execute task:', error);
  }
};

onMounted(() => {
  const courseId = route.params.id;
  fetchCourse(courseId);
  fetchGroups(courseId);
  fetchMarks(courseId);
  fetchTaskGroups(courseId);
});
</script>

<style scoped>
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
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
}

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
