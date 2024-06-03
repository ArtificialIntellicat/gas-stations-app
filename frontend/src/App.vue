<template>
  <div id="app">
    <h1>Gas Stations in Cologne</h1>
    Search Gas Station: <input type="text" v-model="search" placeholder="Search by address" />
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th @click="sortBy('address')">Address <span v-if="sortColumn === 'address'">{{ sortAsc ? '▲' : '▼' }}</span></th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="station in filteredStations" :key="station.id">
          <td>{{ station.id }}</td>
          <td>
            {{ station.address }}
            <div v-if="editingStation && editingStation.id === station.id">
              <input type="text" v-model="editingStation.address" placeholder="New Address" />
            </div>
          </td>
          <td>
            {{ station.latitude }}
            <div v-if="editingStation && editingStation.id === station.id">
              <input type="number" v-model="editingStation.latitude" placeholder="New Latitude" />
            </div>
          </td>
          <td>
            {{ station.longitude }}
            <div v-if="editingStation && editingStation.id === station.id">
              <input type="number" v-model="editingStation.longitude" placeholder="New Longitude" />
            </div>
          </td>
          <td>
            <button v-if="!editingStation || editingStation.id !== station.id" @click="editStation(station)">Edit</button>
            <button v-if="editingStation && editingStation.id === station.id" @click="saveStation(station.id)">Save</button>
            <button v-if="editingStation && editingStation.id === station.id" @click="cancelEdit">Cancel</button>
            <button @click="deleteStation(station.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <form @submit.prevent="addStation">
      <h2>Add Gas Station</h2>
      <input type="text" v-model="newStation.address" placeholder="Address" required />
      <input type="number" v-model="newStation.latitude" placeholder="Latitude" required />
      <input type="number" v-model="newStation.longitude" placeholder="Longitude" required />
      <button type="submit">Add</button>
    </form>
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
      let stations = this.gasStations
        .filter(station =>
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  cursor: pointer;
}
</style>
