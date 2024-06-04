<template>
  <div id="app" class="min-h-screen bg-gray-800 text-gray-100">
    <div class="max-w-4xl mx-auto py-8">
      <h1 class="text-3xl font-bold text-[#8095d6] text-center mb-8 font-raleway">Gas Stations in Cologne</h1>
      
      <!-- Add Gas Station Form -->
      <form @submit.prevent="addStation" class="bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 class="text-2xl font-bold text-[#8095d6] mb-4 font-raleway">Add Gas Station</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4 flex flex-col md:flex-row md:items-center">
            <label for="address" class="block text-gray-300 text-sm font-bold mb-2 md:mb-0 md:w-1/3">Address:</label>
            <input
              type="text"
              v-model="newStation.address"
              id="address"
              placeholder="Address"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-4 flex flex-col md:flex-row md:items-center">
            <label for="latitude" class="block text-gray-300 text-sm font-bold mb-2 md:mb-0 md:w-1/3">Latitude:</label>
            <input
              type="number"
              v-model="newStation.latitude"
              id="latitude"
              placeholder="Latitude"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-4 flex flex-col md:flex-row md:items-center">
            <label for="longitude" class="block text-gray-300 text-sm font-bold mb-2 md:mb-0 md:w-1/3">Longitude:</label>
            <input
              type="number"
              v-model="newStation.longitude"
              id="longitude"
              placeholder="Longitude"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <button
          type="submit"
          class="bg-[#7188d1] text-white font-bold py-2 px-4 rounded hover:bg-[#4A569D] focus:outline-none focus:shadow-outline"
        >Add</button>
      </form>

      <!-- Search Bar -->
      <div class="mb-6">
        <label for="search" class="block text-gray-300 text-sm font-bold mb-2">Search Gas Station:</label>
        <input
          type="text"
          v-model="search"
          id="search"
          placeholder="Search by address"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <!-- Gas Stations Table -->
      <table class="min-w-full bg-gray-700 shadow-md rounded mb-4">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b text-gray-300">ID</th>
            <th class="py-2 px-4 border-b cursor-pointer text-gray-300" @click="sortBy('address')">Address <span v-if="sortColumn === 'address'">{{ sortAsc ? '▲' : '▼' }}</span></th>
            <th class="py-2 px-4 border-b text-gray-300">Latitude</th>
            <th class="py-2 px-4 border-b text-gray-300">Longitude</th>
            <th class="py-2 px-4 border-b text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="station in filteredStations" :key="station.id" class="hover:bg-gray-600">
            <td class="py-2 px-4 border-b">{{ station.id }}</td>
            <td class="py-2 px-4 border-b">
              {{ station.address }}
              <div v-if="editingStation && editingStation.id === station.id">
                <input
                  type="text"
                  v-model="editingStation.address"
                  placeholder="New Address"
                  class="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </td>
            <td class="py-2 px-4 border-b">
              {{ station.latitude }}
              <div v-if="editingStation && editingStation.id === station.id">
                <input
                  type="number"
                  v-model="editingStation.latitude"
                  placeholder="New Latitude"
                  class="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </td>
            <td class="py-2 px-4 border-b">
              {{ station.longitude }}
              <div v-if="editingStation && editingStation.id === station.id">
                <input
                  type="number"
                  v-model="editingStation.longitude"
                  placeholder="New Longitude"
                  class="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </td>
            <td class="py-2 px-4 border-b">
              <div class="flex space-x-2">
                <button
                  v-if="!editingStation || editingStation.id !== station.id"
                  @click="editStation(station)"
                  class="bg-[#7188d1] text-white font-bold py-1 px-2 rounded hover:bg-[#4A569D] focus:outline-none focus:shadow-outline"
                >Edit</button>
                <button
                  v-if="editingStation && editingStation.id === station.id"
                  @click="saveStation(station.id)"
                  class="bg-[#7188d1] text-white font-bold py-1 px-2 rounded hover:bg-[#4A569D] focus:outline-none focus:shadow-outline"
                >Save</button>
                <button
                  v-if="editingStation && editingStation.id === station.id"
                  @click="cancelEdit"
                  class="bg-gray-500 text-white font-bold py-1 px-2 rounded hover:bg-gray-700 focus:outline-none focus:shadow-outline"
                >Cancel</button>
                <button
                  @click="deleteStation(station.id)"
                  class="bg-red-500 text-white font-bold py-1 px-2 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
                >Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      gasStations: [],
      newStation: {
        address: '',
        latitude: '',
        longitude: '',
      },
      editingStation: null,
      search: '',
      sortAsc: true,
      sortColumn: 'address',
    };
  },
  computed: {
    filteredStations() {
      let stations = this.gasStations.filter(station =>
        station.address.toLowerCase().includes(this.search.toLowerCase())
      );

      if (this.sortColumn === 'address') {
        stations = stations.sort((a, b) => {
          let modifier = this.sortAsc ? 1 : -1;
          if (a.address < b.address) return -1 * modifier;
          if (a.address > b.address) return 1 * modifier;
          return 0;
        });
      }
      return stations;
    },
  },
  methods: {
    fetchGasStations() {
      axios
        .get('http://localhost:3000/api/gas-stations')
        .then(response => {
          this.gasStations = response.data;
        })
        .catch(error => {
          console.error('There was an error fetching the gas stations!', error);
        });
    },
    fetchExternalGasStations() {
      axios
        .get('http://localhost:3000/api/external-gas-stations')
        .then(() => {
          this.fetchGasStations();
        })
        .catch(error => {
          console.error('There was an error fetching the external gas stations!', error);
        });
    },
    addStation() {
      axios
        .post('http://localhost:3000/api/gas-stations', this.newStation)
        .then(() => {
          this.fetchGasStations();
          this.newStation = { address: '', latitude: '', longitude: '' };
        })
        .catch(error => {
          console.error('There was an error adding the gas station!', error);
        });
    },
    editStation(station) {
      this.editingStation = { ...station };
    },
    saveStation(id) {
      axios
        .put(`http://localhost:3000/api/gas-stations/${id}`, {
          address: this.editingStation.address,
          latitude: parseFloat(this.editingStation.latitude),
          longitude: parseFloat(this.editingStation.longitude),
        })
        .then(() => {
          this.editingStation = null;
          this.fetchGasStations();
        })
        .catch(error => {
          console.error('There was an error updating the gas station!', error);
        });
    },
    cancelEdit() {
      this.editingStation = null;
    },
    deleteStation(id) {
      axios
        .delete(`http://localhost:3000/api/gas-stations/${id}`)
        .then(() => {
          this.fetchGasStations();
        })
        .catch(error => {
          console.error('There was an error deleting the gas station!', error);
        });
    },
    sortBy(column) {
      if (column === 'address') {
        if (this.sortColumn === column) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortColumn = column;
          this.sortAsc = true;
        }
      }
    },
  },
  mounted() {
    this.fetchGasStations();
    this.fetchExternalGasStations();
  },
};
</script>

<style>
#app {
  font-family: 'Raleway', sans-serif;
  text-align: center;
}
.font-raleway {
  font-family: 'Raleway', sans-serif;
}
.min-h-screen {
  min-height: 100vh;
}
</style>
