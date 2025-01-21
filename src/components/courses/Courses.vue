<template>
  <div class="container">
    <!-- Поисковая форма -->
    <div class="row justify-content-center my-4">
      <div class="col-md-8">
        <div class="input-group">
          <input type="text" v-model="searchQuery" placeholder="Поиск курсов..." class="form-control"/>
          <button @click="searchCourses" class="btn btn-primary">Поиск</button>
        </div>
      </div>
    </div>

    <!-- Отображение курсов -->
    <div class="row justify-content-center">
      <div v-for="course in courses" :key="course.id" class="col-md-8 mb-4">
        <div class="card h-100 horizontal-card" @mouseover="hoverCourse(course.id)" @mouseleave="leaveCourse(course.id)"
             @click="getCourseById(course)">
          <div class="row g-0">
            <!-- Иконка курса -->
            <div class="col-md-4">
              <img :src="apiUrl + `/site/file/file/jpg/${course.pathImage}`" alt="Course Image"
                   class="img-fluid rounded-start course-image">
            </div>

            <!-- Информация о курсе -->
            <div class="col-md-8 h-100">
              <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-start">
                  <div class="d-flex justify-content-start flex-column w-75">
                    <h5 class="card-title">{{ course.courseName }}</h5>
                    <p class="card-text text-truncate text-wrap">{{ course.about.substring(0, 50) }}</p>
                  </div>
                  <div class="d-flex flex-column justify-content-start w-25">
                    <span class="text-muted">{{ course.userCreated.firstName }} {{
                        course.userCreated.secondName
                      }}</span>
                    <p class="text-muted">{{ new Date(course.createTime).toLocaleDateString() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог с информацией о курсе -->
    <div  v-if="showDialog" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ courseInfo.courseName }}</h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body">
            <img :src="`${apiUrl}/site/file/file/jpg/${courseInfo.pathImage}`" alt="Course Image"
                 class="img-fluid mb-3"/>
            <p class="text-wrap">{{ courseInfo.about.substring(0, 50) }}</p>
            <p>Создатель: {{ courseInfo.userCreated.firstName }} {{ courseInfo.userCreated.secondName }}</p>
            <p>Дата создания: {{ new Date(courseInfo.createTime).toLocaleDateString() }}</p>
          </div>
          <div class="modal-footer">
            <button @click="startCourse(courseInfo.id)" class="btn btn-primary">Приступить к выполнению</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';
import {useRouter} from 'vue-router';

const courses = ref([]);
const searchQuery = ref('');
const courseInfo = ref(null);
const showDialog = ref(false);
const hoveredCourse = ref(null); // Переменная для отслеживания наведения на курс
const router = useRouter();
const apiUrl = import.meta.env.VITE_API_HOST;

// Функция для загрузки курсов
const fetchCourses = async (query = '') => {
  try {
    const response = await axios.post(apiUrl + '/site/courses/search', {query});
    courses.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
  }
};

// Поиск курсов
const searchCourses = () => {
  fetchCourses(searchQuery.value);
};

// Загрузка курсов при монтировании компонента
onMounted(() => {
  fetchCourses();
});

// Закрытие диалога
const close = () => {
  showDialog.value = false;
};

// Получение информации о курсе
const getCourseById = async (course) => {
  try {
    courseInfo.value = course;
    const response = await axios.get(apiUrl + `/site/user/courses/course/${course.id}`);
    await router.push(`/courses/${course.id}`);
  } catch (error) {
    showDialog.value = true; // Открываем диалог
  }
};

// Отслеживание наведения на курс
const hoverCourse = (id) => {
  hoveredCourse.value = id;
};

const leaveCourse = (id) => {
  if (hoveredCourse.value === id) {
    hoveredCourse.value = null;
  }
};

// Начало курса
const startCourse = async (id) => {
  try {
    await axios.post(apiUrl + `/site/user/courses/course/add/${id}`);
    await router.push(`/courses/${id}`);
  } catch (error) {
    console.error('Failed to start course:', error);
    alert('Не удалось начать выполнение курса.');
  }
};
</script>

<style scoped>
.course-image {
  height: 200px;
  width: 200px;
  object-fit: cover;
}

.horizontal-card {
  cursor: pointer;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.horizontal-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.modal {
  display: block;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5); /* Затемнение фона */
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* Занять всю высоту экрана */
}

</style>
