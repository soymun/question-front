<template>
  <div class="me-5 ms-5">
    <!-- Блок для администраторов -->
    <div v-if="admin()" class="mb-4">
      <div class="d-flex align-items-end gap-3">
        <div class="flex-grow-1">
          <label for="schemaName" class="form-label">Название схемы:</label>
          <input v-model="sandbox.schemaName" id="schemaName" type="text" class="form-control">
        </div>
        <div>
          <label for="open" class="form-label">Открыть:</label>
          <input v-model="sandbox.open" id="open" type="checkbox" class="form-check-input">
        </div>
        <div class="flex-grow-1">
          <label for="sqlClear" class="form-label">Очистка SQL:</label>
          <codemirror
              v-model="sandbox.sqlClear"
              id="sqlClear"
              placeholder="Введите SQL"
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="extensions"
              @ready="handleReady"
              class="form-control"
          />
        </div>
        <button @click="saveSandbox" class="btn btn-primary">Сохранить</button>
      </div>
    </div>

    <!-- Блок для работы с таблицами и SQL -->
    <div class="row mt-5">
      <!-- Список таблиц -->
      <div class="col-md-4">
        <h5 class="mb-3">Таблицы песочницы</h5>
        <table class="table table-bordered table-striped">
          <thead>
          <tr>
            <th>Название таблицы</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="table in tables" :key="table.table_name">
            <td>{{ table.table_name }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Редактор SQL -->
      <div class="col-md-8">
        <codemirror
            v-model="userSql"
            placeholder="Введите SQL"
            :style="{ minHeight: '65vh' }"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="extensions"
            @ready="handleReady"
            class="form-control"
        />
        <div class="d-flex justify-content-end">
          <button @click="executeTask" class="btn btn-success mt-3">Выполнить</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для отображения результатов -->
    <div v-if="isModalVisibleSql" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="resultModalLabel" style="display: block;">
      <div class="modal-dialog h-75 overflow-auto" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="resultModalLabel">Результат</h5>
            <button type="button" class="btn-close" @click="closeModalSql"></button>
          </div>
          <div class="modal-body">
            <div v-for="(result, index) in executionResult" :key="index">
              <h6>Результат {{ index + 1 }}</h6>
              <div v-if="result.resultSelect && result.resultSelect.length">
                <table class="table table-bordered">
                  <thead>
                  <tr>
                    <th v-for="(value, key) in result.resultSelect[0]" :key="key">{{ key }}</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="row in result.resultSelect" :key="row">
                    <td v-for="(value, key) in row" :key="key">{{ value }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <p v-if="result.message">{{ result.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { Codemirror } from 'vue-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';

const apiUrl = import.meta.env.VITE_API_HOST;

const admin = () => {
  return localStorage.getItem('role') === 'ADMIN';
}
const schemaName = ref('');
const open = ref(false);
const sqlClear = ref('');
const tables = ref([]);
const selectedTable = ref('');
const columns = ref([]);
const userSql = ref('');
const executionResult = ref([]);
const isModalVisibleSql = ref(false);
const view = ref(null);
const sandbox = ref({
  id: 0,
  schemaName: schemaName.value,
  open: open.value,
  sqlClear: sqlClear.value
});

const extensions = [sql(), oneDark];

const handleReady = (payload) => {
  view.value = payload.view;
};

const getTables = async () => {
  try {
    const response = await axios.post(apiUrl + '/sandbox/execute', {
      sql: "select distinct table_name from information_schema.columns where table_schema='sandbox'"
    });
    tables.value = response.data.data[0].resultSelect;
  } catch (error) {
    console.error('Failed to get tables:', error);
  }
};

const executeTask = async () => {
  try {
    const response = await axios.post(apiUrl + '/sandbox/execute', {
      sql: userSql.value
    });
    executionResult.value = response.data.data;
    isModalVisibleSql.value = true;
  } catch (error) {
    console.error('Failed to execute task:', error);
  }
};

const closeModalSql = () => {
  isModalVisibleSql.value = false;
  getTables();
};

const getSandbox = async () => {
  try {
    const response = await axios.get(apiUrl + '/sandbox');
    sandbox.value = response.data.data;
  } catch (error) {
    console.error('Failed to save sandbox:', error);
  }
};

const saveSandbox = async () => {
  try {
    await axios.post(apiUrl + '/sandbox', sandbox.value);
  } catch (error) {
    console.error('Failed to save sandbox:', error);
  }
};

onMounted(() => {
  getSandbox();
  getTables();
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