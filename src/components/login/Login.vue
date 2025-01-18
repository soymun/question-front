<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100">
    <div class="container w-25">
      <form @submit.prevent="login" class="p-4 border rounded shadow-sm bg-light">
        <div class="text-center mb-4">
          <img src="/src/assets/login/logo.png" alt="ЯТест" class="img-fluid" style="max-width: 200px;"/>
        </div>
        <div class="form-group mb-3">
          <label for="username" class="form-label">Логин</label>
          <input type="text" id="username" v-model="username" class="form-control" required>
        </div>
        <div class="form-group mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input type="password" id="password" v-model="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Войти</button>
      </form>

      <!-- Alert for error message -->
      <div v-if="errorMessage" class="alert alert-danger mt-3 fixed-bottom" role="alert" style="left: 0; right: 0; bottom: 0; margin-left: auto; margin-right: auto; width: 50%;">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "@/router.js";
import {ref} from "vue";
const errorMessage = ref('');

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:8880/site/login', {
          email: username.value,
          password: password.value
        });
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('role', response.data.data.role);

        if (response.data.data.role === 'ADMIN' || response.data.data.role === 'TEACHER') {
          await router.push('teacher/courses');
        } else {
          await router.push('courses');
        }
      } catch (error) {
        errorMessage.value = error.response ? error.response.data.errors : 'Произошла ошибка';
      }
    }
  }
};
</script>

<style scoped>
/* Градиентный фон для всей страницы */
.login-container {
  background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='2000' height='3000' preserveAspectRatio='none' viewBox='0 0 2000 3000'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1039%26quot%3b)' fill='none'%3e%3crect width='2000' height='3000' x='0' y='0' fill='rgba(255%2c 255%2c 255%2c 1)'%3e%3c/rect%3e%3cpath d='M672.55 2183.65 a503.96 503.96 0 1 0 1007.92 0 a503.96 503.96 0 1 0 -1007.92 0z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M637.5260081549468 191.24977984560894L297.9195974251471 100.25251634612692 206.9223339256651 439.8589270759266 546.5287446554648 530.8561905754086z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M1036.2842926501519 59.804033627914755L656.3665769558777 46.53701465232375 643.0995579802866 426.454730346598 1023.0172736745609 439.721749322189z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3cpath d='M1001.0196324009064 3244.623483947774L1301.5501442728832 3041.9130941191115 1098.8397544442205 2741.3825822471345 798.3092425722439 2944.092972075797z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3cpath d='M921.6981161587373 2097.953894694505L910.578433819804 1779.5278548112424 438.4992151643765 1955.420398261274z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M980.361526109122 2036.3493675694165L922.5164525388592 2399.329557638751 1224.444978069783 2289.4365614696117z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M271.189%2c2706.718C460.876%2c2709.211%2c673.356%2c2696.366%2c773.79%2c2535.43C878.309%2c2367.948%2c833.976%2c2147.496%2c721.374%2c1985.339C623.046%2c1843.739%2c443.543%2c1815.241%2c271.189%2c1811.64C89.753%2c1807.849%2c-111.217%2c1815.441%2c-212.804%2c1965.819C-324.14%2c2130.629%2c-317.811%2c2356%2c-209.037%2c2522.512C-108.54%2c2676.353%2c87.448%2c2704.303%2c271.189%2c2706.718' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3cpath d='M1073.881%2c2295.693C1225.857%2c2290.267%2c1346.877%2c2182.551%2c1421.509%2c2050.051C1494.545%2c1920.385%2c1522.281%2c1762.295%2c1446.45%2c1634.244C1371.807%2c1508.2%2c1220.363%2c1461.753%2c1073.881%2c1463.032C929.997%2c1464.289%2c790.094%2c1519.536%2c712.414%2c1640.655C628.123%2c1772.082%2c604.988%2c1939.808%2c680.424%2c2076.51C758.166%2c2217.391%2c913.075%2c2301.434%2c1073.881%2c2295.693' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M360.49 553.01 a612.51 612.51 0 1 0 1225.02 0 a612.51 612.51 0 1 0 -1225.02 0z' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M868.679%2c1697.278C945.501%2c1691.382%2c1008.652%2c1640.94%2c1044.892%2c1572.947C1078.877%2c1509.185%2c1074.917%2c1435.41%2c1042.734%2c1370.72C1005.964%2c1296.809%2c951.231%2c1218.883%2c868.679%2c1218.744C785.99%2c1218.605%2c736.018%2c1299.148%2c693.609%2c1370.134C649.556%2c1443.873%2c597.903%2c1528.411%2c638.432%2c1604.144C680.3%2c1682.38%2c780.205%2c1704.069%2c868.679%2c1697.278' fill='rgba(172%2c 216%2c 255%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1039'%3e%3crect width='2000' height='3000' fill='white'%3e%3c/rect%3e%3c/mask%3e%3cstyle%3e %40keyframes float1 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(-10px%2c 0)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float1 %7b animation: float1 5s infinite%3b %7d %40keyframes float2 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(-5px%2c -5px)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float2 %7b animation: float2 4s infinite%3b %7d %40keyframes float3 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(0%2c -10px)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float3 %7b animation: float3 6s infinite%3b %7d %3c/style%3e%3c/defs%3e%3c/svg%3e");
  min-height: 100vh;
  transition: background 0.5s ease-in-out;
}

/* Минимальная высота для контейнера */
.vh-100 {
  min-height: 100vh;
}
</style>