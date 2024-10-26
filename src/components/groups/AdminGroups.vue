<template>
  <div class="container">
    <!-- Поисковая форма -->
    <div class="row justify-content-center my-4">
      <div class="col-md-8">
        <div class="input-group">
          <input type="text" v-model="searchQuery" placeholder="Поиск групп..." class="form-control" />
          <button @click="searchGroups" class="btn btn-primary">Поиск</button>
          <button @click="openCreateDialog" class="btn btn-success ms-2">Добавить группу</button>
        </div>
      </div>
    </div>

    <!-- Отображение групп -->
    <div class="row justify-content-center">
      <div v-for="group in groups" :key="group.id" class="col-md-8 mb-4">
        <div class="card h-100 horizontal-card">
          <div class="card-body d-flex justify-content-between align-items-center">
            <!-- Информация о группе -->
            <div class="info">
              <h5 class="card-title">{{ group.fullName }}</h5>
              <p class="card-text">{{ group.shortName }}</p>
            </div>

            <!-- Кнопки управления -->
            <div class="mt-auto d-flex flex-column">
              <button @click.stop="openEditDialog(group)" class="btn btn-warning btn-sm mb-1">Изменить</button>
              <button @click.stop="deleteGroup(group.id)" class="btn btn-danger btn-sm">Удалить</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог создания/изменения группы -->
    <div v-if="showDialog" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Изменить группу' : 'Создать группу' }}</h5>
            <button type="button" class="btn-close" @click="closeDialog"></button>
          </div>
          <div class="modal-body">
            <input class="form-control mb-3" v-model="groupData.fullName" placeholder="Полное название группы" />
            <input class="form-control mb-3" v-model="groupData.shortName" placeholder="Короткое название группы" />
          </div>
          <div class="modal-footer">
            <button @click="saveGroup" class="btn btn-primary">{{ isEditing ? 'Сохранить изменения' : 'Создать группу' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const groups = ref([]);
const searchQuery = ref('');
const showDialog = ref(false);
const isEditing = ref(false);
const groupData = ref({ fullName: '', shortName: '' });
const groupIdToEdit = ref(null);

const fetchGroups = async () => {
  try {
    const response = await axios.get('http://localhost:8880/site/groups');
    groups.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
  }
};

const searchGroups = () => {
  fetchGroups(); // Можно добавить фильтрацию для поиска
};

const openCreateDialog = () => {
  groupData.value = { fullName: '', shortName: '' };
  showDialog.value = true;
  isEditing.value = false;
};

const openEditDialog = (group) => {
  groupData.value = { ...group };
  groupIdToEdit.value = group.id;
  showDialog.value = true;
  isEditing.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const saveGroup = async () => {
  try {
    if (isEditing.value) {
      await axios.patch('http://localhost:8880/site/groups', {
        id: groupIdToEdit.value,
        ...groupData.value
      });
    } else {
      await axios.post('http://localhost:8880/site/groups', groupData.value);
    }
    closeDialog();
    await fetchGroups();
  } catch (error) {
    console.error('Failed to save group:', error);
  }
};

const deleteGroup = async (id) => {
  try {
    await axios.delete(`http://localhost:8880/site/groups/${id}`);
    await fetchGroups();
  } catch (error) {
    console.error('Failed to delete group:', error);
  }
};

onMounted(() => {
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
