<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <h3 class="text-center mb-4">Ваши курсы и оценки</h3>
      <div v-for="courseData in userCourses" :key="courseData.course.id" class="col-md-8 mb-4">
        <div class="card h-100 horizontal-card" @mouseover="hoverCourse(courseData.course.id)"
             @mouseleave="leaveCourse(courseData.course.id)"
             @click="goToCourseTasks(courseData)">
          <div class="row g-0">
            <!-- Иконка курса -->
            <div class="col-md-4">
              <img :src="`${apiUrl}/site/file/file/jpg/${courseData.course.pathImage}`"
                   alt="Course Image"
                   class="img-fluid rounded-start course-image">
            </div>

            <!-- Информация о курсе -->
            <div class="col-md-8 h-100">
              <div class="card-body d-flex flex-column h-100">
                <div class="d-flex justify-content-start h-100">
                  <div class="d-flex justify-content-start flex-column w-75">
                    <h5 class="card-title">{{ courseData.course.courseName }}</h5>
                    <p class="card-text text-truncate text-wrap">{{ courseData.course.about.substring(0, 50) }}</p>
                  </div>
                  <div class="d-flex flex-column justify-content-start w-25">
                    <span class="text-muted">{{ courseData.course.userCreated.firstName }} {{
                        courseData.course.userCreated.secondName
                      }}</span>
                    <p class="text-muted">{{ new Date(courseData.course.createTime).toLocaleDateString() }}</p>
                    <div class="d-flex h-100"></div>
                    <p class="text-muted">Оценка: {{getMark(courseData.courseMarks)}}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';

const userCourses = ref([]);
const router = useRouter();
const hoveredCourse = ref(null); // Переменная для отслеживания наведения на курс
const apiUrl = import.meta.env.VITE_API_HOST;

const fetchUserCourses = async () => {
  try {
    const response = await axios.get(apiUrl + '/site/user/courses/user');
    userCourses.value = response.data.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

const getMark = (mark) => {
  if (!mark) {
    return 0;
  } else {
    return mark.mark;
  }
}

const goToCourseTasks = (courseId) => {
  if (courseId.closed === false) {
    router.push(`/courses/${courseId.course.id}`);
  }
};

onMounted(() => {
  fetchUserCourses();
});

const hoverCourse = (id) => {
  hoveredCourse.value = id;
};

const leaveCourse = (id) => {
  if (hoveredCourse.value === id) {
    hoveredCourse.value = null;
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