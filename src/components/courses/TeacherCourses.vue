<template>
  <div class="container">
    <!-- Поисковая форма -->
    <div class="row justify-content-center my-4">
      <div class="col-md-8">
        <div class="input-group">
          <input type="text" v-model="searchQuery" placeholder="Поиск курсов..." class="form-control"/>
          <button @click="searchCourses" class="btn btn-primary">Поиск</button>
          <button @click="openCreateDialog" class="btn btn-success ms-2">Добавить курс</button>
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
              <img :src="`http://localhost:8880/site/file/file/jpg/${course.pathImage}`" alt="Course Image"
                   class="img-fluid rounded-start course-image">
            </div>

            <!-- Информация о курсе -->
            <div class="col-md-8 h-100">
              <div class="card-body d-flex flex-column h-100">
                <div class="d-flex justify-content-start h-100">
                  <div class="d-flex justify-content-start flex-column w-75">
                    <h5 class="card-title">{{ course.courseName }}</h5>
                    <p class="card-text text-truncate text-wrap">{{ course.about.substring(0, 50) }}</p>
                  </div>

                  <div class="mt-auto d-flex row justify-content-center align-content-center h-100">
                    <button @click.stop="openEditDialog(course)" class="btn btn-warning btn-sm mb-1">Изменить</button>
                    <button @click.stop="deleteCourse(course.id)" class="btn btn-danger btn-sm">Удалить</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог создания/изменения курса -->
    <div v-if="showDialog" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Изменить курс' : 'Создать курс' }}</h5>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>
          <div class="modal-body">
            <input class="form-control mb-3" v-model="courseData.courseName" placeholder="Название курса"/>

            <!-- Увеличение поля описания -->
            <textarea class="form-control mb-3" style="resize: none" v-model="courseData.about" placeholder="Описание курса" rows="6"></textarea>

            <input class="form-control mb-3" type="file" @change="handleFileUpload"/>

            <select class="form-control mb-3" v-model="courseData.courseType">
              <option value="USUALLY">Обычный</option>
              <option value="TIMED">С таймером</option>
            </select>

            <input class="form-control mb-3" type="datetime-local" v-model="courseData.timeExecute"/>

            <!-- Чекбокс для поля "Открытые" -->
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" v-model="courseData.open" id="openCheckbox"/>
              <label class="form-check-label" for="openCheckbox">Открытый курс</label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="saveCourse" class="btn btn-primary">{{ isEditing ? 'Сохранить изменения' : 'Создать курс' }}</button>
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
const file = ref(null);
const showDialog = ref(false);
const isEditing = ref(false);
const courseData = ref({courseName: '', about: '', pathImage: '', courseType: 'USUALLY', timeExecute: ''});
const courseIdToEdit = ref(null);
const router = useRouter();

const fetchCourses = async () => {
  try {
    const response = await axios.post('http://localhost:8880/site/courses/search', {
      query: searchQuery.value,
      teacher: true
    });
    courses.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
  }
};

const searchCourses = () => {
  fetchCourses();
};

const openCreateDialog = () => {
  courseData.value = {courseName: '', about: '', pathImage: '', courseType: 'USUALLY', timeExecute: ''};
  showDialog.value = true;
  isEditing.value = false;
};

const openEditDialog = (course) => {
  courseData.value = {...course};
  courseIdToEdit.value = course.id;
  showDialog.value = true;
  isEditing.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const saveCourse = async () => {
  try {
    let uploadedFileName = courseData.value.pathImage;
    if (file.value) {
      const formData = new FormData();
      formData.append('multipartFile', file.value);

      const fileResponse = await axios.post('http://localhost:8880/site/file/save/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      uploadedFileName = fileResponse.data.data;
    }

    if (isEditing.value) {
      await axios.put('http://localhost:8880/site/courses', {
        id: courseIdToEdit.value,
        ...courseData.value,
        pathImage: uploadedFileName,
      });
    } else {
      await axios.post('http://localhost:8880/site/courses', {
        ...courseData.value,
        pathImage: uploadedFileName,
        open: true,
      });
    }

    closeDialog();
    await fetchCourses();
  } catch (error) {
    console.error('Failed to save course:', error);
  }
};

const deleteCourse = async (id) => {
  try {
    await axios.delete(`http://localhost:8880/site/courses/${id}`);
    fetchCourses();
  } catch (error) {
    console.error('Failed to delete course:', error);
  }
};

const getCourseById = async (course) => {
  try {
    await router.push(`/teacher/courses/${course.id}`);
  } catch (error) {
    console.error('Failed to load course:', error);
  }
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.course-image {
  height: 150px;
  width: 100%;
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
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
