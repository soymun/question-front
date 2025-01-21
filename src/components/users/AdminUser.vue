<template>
  <div class="container">
    <!-- Поисковая форма -->
    <div class="row justify-content-center my-4">
      <div class="col-md-8">
        <div class="input-group">
          <input type="text" v-model="searchQuery" placeholder="Поиск пользователей..." class="form-control" />
          <button @click="searchUsers" class="btn btn-primary">Поиск</button>
          <button @click="openCreateDialog" class="btn btn-success ms-2">Добавить пользователя</button>
        </div>
      </div>
    </div>

    <!-- Отображение пользователей -->
    <div class="row justify-content-center">
      <div v-for="user in users" :key="user.id" class="col-md-8 mb-4">
        <div class="card h-100 horizontal-card">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div class="info">
              <h5 class="card-title">{{ user.firstName }} {{ user.secondName }}</h5>
              <p class="card-text">{{ user.email }}</p>
            </div>
            <div class="mt-auto d-flex flex-column">
              <button @click.stop="openEditDialog(user)" class="btn btn-warning btn-sm mb-1">Изменить</button>
              <button @click.stop="openChangePasswordDialog(user)" class="btn btn-secondary btn-sm mb-1">Сменить пароль</button>
              <button @click.stop="deleteUser(user.id)" class="btn btn-danger btn-sm">Удалить</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог создания/изменения пользователя -->
    <div v-if="showDialog" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Изменить пользователя' : 'Создать пользователя' }}</h5>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>
          <div class="modal-body">
            <input class="form-control mb-3" v-model="userData.firstName" placeholder="Имя" />
            <input class="form-control mb-3" v-model="userData.secondName" placeholder="Фамилия" />
            <input class="form-control mb-3" v-model="userData.email" placeholder="Email" />
            <input v-if="!isEditing" class="form-control mb-3" type="password" v-model="userData.password" placeholder="Пароль" />

            <label>Группа:</label>
            <select v-model="userData.groups" class="form-select mb-3">
              <option v-for="group in groupsList" :key="group.id" :value="group.id">{{ group.fullName }}</option>
            </select>

            <label class="form-check-label">
              <input type="checkbox" v-model="userData.active" /> Активный
            </label>
          </div>
          <div class="modal-footer">
            <button @click="saveUser" class="btn btn-primary">{{ isEditing ? 'Сохранить изменения' : 'Создать пользователя' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог изменения пароля -->
    <div v-if="showPasswordDialog" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Изменить пароль</h5>
            <button type="button" class="btn-close" @click="closePasswordDialog"></button>
          </div>
          <div class="modal-body">
            <input class="form-control mb-3" type="password" v-model="passwordData.prevPassword" placeholder="Предыдущий пароль" />
            <input class="form-control mb-3" type="password" v-model="passwordData.newPassword" placeholder="Новый пароль" />
          </div>
          <div class="modal-footer">
            <button @click="changePassword" class="btn btn-primary">Сменить пароль</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import axios from 'axios';

const users = ref([]);
const groupsList = ref([]);
const searchQuery = ref('');
const showDialog = ref(false);
const showPasswordDialog = ref(false);
const isEditing = ref(false);
const userData = ref({firstName: '', secondName: '', email: '', password: '', active: true, groups: null});
const passwordData = ref({id: null, prevPassword: '', newPassword: ''});
const userIdToEdit = ref(null);

const fetchUsers = async () => {
  try {
    const response = await axios.get(apiUrl + `/site/users`, {params: {name: searchQuery.value}});
    users.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

const fetchGroups = async () => {
  try {
    const response = await axios.get(apiUrl + `/site/groups`);
    groupsList.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
  }
};

const searchUsers = () => {
  fetchUsers();
};

const openCreateDialog = () => {
  userData.value = {firstName: '', secondName: '', email: '', password: '', active: true, groups: null};
  showDialog.value = true;
  isEditing.value = false;
};

const openEditDialog = (user) => {
  userData.value = {...user, password: '', groups: user.groups.id};
  userIdToEdit.value = user.id;
  showDialog.value = true;
  isEditing.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const saveUser = async () => {
  try {
    if (isEditing.value) {
      await axios.put(apiUrl + `/site/users`, {
        id: userIdToEdit.value,
        ...userData.value
      });
    } else {
      await axios.post(apiUrl + '/site/registration', userData.value);
    }
    closeDialog();
    fetchUsers();
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

const deleteUser = async (id) => {
  try {
    await axios.delete(apiUrl + `/site/users/${id}`);
    fetchUsers();
  } catch (error) {
    console.error('Failed to delete user:', error);
  }
};

const openChangePasswordDialog = (user) => {
  passwordData.value = {id: user.id, prevPassword: '', newPassword: ''};
  showPasswordDialog.value = true;
};

const closePasswordDialog = () => {
  showPasswordDialog.value = false;
};

const changePassword = async () => {
  try {
    await axios.put(apiUrl + `/site/users/change-password`, passwordData.value);
    closePasswordDialog();
  } catch (error) {
    console.error('Failed to change password:', error);
  }
};

onMounted(() => {
  fetchUsers();
  fetchGroups();
});
</script>

<style scoped>
.horizontal-card {
  cursor: pointer;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.horizontal-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
