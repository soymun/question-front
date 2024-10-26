import { createRouter, createWebHistory } from 'vue-router';
import Login from "@/components/login/Login.vue";
import Courses from "@/components/courses/Courses.vue";
import UserTasks from "@/components/tasks/UserTasks.vue";
import UserTaskSql from "@/components/tasks/UserTaskSql.vue";
import UserTaskText from "@/components/tasks/UserTaskText.vue";
import UserTaskNone from "@/components/tasks/UserTaskNone.vue";
import UserTaskBox from "@/components/tasks/UserTaskBox.vue";
import UserTaskCode from "@/components/tasks/UserTaskCode.vue";
import UserCourse from "@/components/courses/UserCourse.vue";
import TeacherCourses from "@/components/courses/TeacherCourses.vue";
import TeacherTask from "@/components/tasks/TeacherTask.vue";
import MainPage from "@/components/MainPage.vue";
import TeacherTaskNone from "@/components/tasks/TeacherTaskNone.vue";
import TeacherTaskSql from "@/components/tasks/TeacherTaskSql.vue";
import TeacherTaskText from "@/components/tasks/TeacherTaskText.vue";
import TeacherTaskBox from "@/components/tasks/TeacherTaskBox.vue";
import TeacherTaskCode from "@/components/tasks/TeacherTaskCode.vue";
import AdminGroups from "@/components/groups/AdminGroups.vue";
import AdminUser from "@/components/users/AdminUser.vue";

const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainPage
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/courses',
        name: 'Courses',
        component: Courses
    },
    {
        path: '/courses/:id',
        name: 'UserTasks',
        component: UserTasks
    },
    {
        path: '/courses/:cId/task/sql/:id',
        name: 'TaskSql',
        component: UserTaskSql
    },
    {
        path: '/courses/:cId/task/text/:id',
        name: 'TaskText',
        component: UserTaskText
    },
    {
        path: '/courses/:cId/task/none/:id',
        name: 'TaskNone',
        component: UserTaskNone
    },
    {
        path: '/courses/:cId/task/box/:id',
        name: 'TaskBox',
        component: UserTaskBox
    },
    {
        path: '/courses/:cId/task/code/:id',
        name: 'TaskCode',
        component: UserTaskCode
    },
    {
        path: '/user/courses',
        name: 'UserCourses',
        component: UserCourse
    },
    {
        path: '/teacher/courses',
        name: 'TeacherCourses',
        component: TeacherCourses
    },
    {
        path: '/teacher/courses/:id',
        name: 'TeacherTask',
        component: TeacherTask
    },
    {
        path: '/teacher/courses/:id/task/none/:taskId',
        name: 'TeacherTaskNone',
        component: TeacherTaskNone
    },
    {
        path: '/teacher/courses/:id/task/sql/:taskId',
        name: 'TeacherTaskSql',
        component: TeacherTaskSql
    },
    {
        path: '/teacher/courses/:id/task/text/:taskId',
        name: 'TeacherTaskText',
        component: TeacherTaskText
    },
    {
        path: '/teacher/courses/:id/task/box/:taskId',
        name: 'TeacherTaskBox',
        component: TeacherTaskBox
    },
    {
        path: '/teacher/courses/:id/task/code/:taskId',
        name: 'TeacherTaskCode',
        component: TeacherTaskCode
    },
    {
        path: '/admin/groups',
        name: 'AdminGroups',
        component: AdminGroups
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: AdminUser
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Добавление глобального навигационного охранника
router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/']; // Страницы, доступные без авторизации
    const authRequired = !publicPages.includes(to.path); // Страницы, требующие авторизации
    const loggedIn = localStorage.getItem('token'); // Проверка наличия токена

    if (authRequired && !loggedIn) {
        return next('/login'); // Перенаправление на страницу входа
    }

    next(); // Продолжить навигацию
});

export default router;
