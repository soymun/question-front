<template>
  <div class="main-page">
    <!-- Секция заголовка -->
    <section class="hero text-center text-black">
      <div class="container">
        <h1 class="display-4 fw-bold">Добро пожаловать в наш проект!</h1>
        <p class="lead">Учитесь новым навыкам в любое время и в любом месте.</p>
        <router-link to="/courses" class="btn btn-lg btn-primary mt-4">Посмотреть курсы</router-link>
      </div>
    </section>

    <!-- Секция с информацией о проекте -->
    <section class="info-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-4 col-md-6">
            <div class="card text-center shadow-sm p-4">
              <i class="bi bi-laptop" style="font-size: 2rem;"></i>
              <h3 class="mt-3">Интерактивное обучение</h3>
              <p>Погружайтесь в интерактивные курсы с реальными заданиями и проектами.</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4 mt-md-0">
            <div class="card text-center shadow-sm p-4">
              <i class="bi bi-people" style="font-size: 2rem;"></i>
              <h3 class="mt-3">Сообщество</h3>
              <p>Общайтесь с единомышленниками и обменивайтесь знаниями.</p>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 mt-4 mt-lg-0">
            <div class="card text-center shadow-sm p-4">
              <i class="bi bi-award" style="font-size: 2rem;"></i>
              <h3 class="mt-3">Быстрое обучение</h3>
              <p>Получите лучшие знания за самый короткий срок.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Секция с преимуществами -->
    <section class="features-section py-5 text-center text-black">
      <div class="container">
        <h2 class="fw-bold">Почему выбирают нас?</h2>
        <p class="lead mb-5">Наши курсы разработаны лучшими специалистами с мировым опытом.</p>
        <div class="row">
          <div class="col-md-4">
            <i class="bi bi-check-circle" style="font-size: 3rem;"></i>
            <h3 class="mt-3">Качественные материалы</h3>
            <p>Только самые актуальные знания и практические навыки.</p>
          </div>
          <div class="col-md-4">
            <i class="bi bi-globe" style="font-size: 3rem;"></i>
            <h3 class="mt-3">Доступ по всему миру</h3>
            <p>Учитесь из любой точки мира в удобное для вас время.</p>
          </div>
          <div class="col-md-4">
            <i class="bi bi-speedometer" style="font-size: 3rem;"></i>
            <h3 class="mt-3">Быстрая поддержка</h3>
            <p>Наши наставники всегда готовы помочь вам с вопросами.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

// Если нужно, можно добавить динамическое поведение на главной странице.
onMounted(() => {
  console.log("Главная страница загружена");
});
</script>

<style scoped>
/* Градиент от белого к синему */
.main-page {
  min-height: 100vh;
}

.hero {
  padding: 100px 0;
}

.info-section .card {
  background-color: #f8f9fa;
}

.features-section {
}

.features-section i {
  color: black;
}
</style>
