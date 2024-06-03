# Gas Stations in Cologne

## Overview

This project is a Single Page Application (SPA) that displays gas stations in Cologne. The application fetches gas station data from an external API, allows users to add, edit, and delete gas stations (also outside of Cologne), and displays the data in a sortable and searchable table. This project is built using Vue.js for the frontend and Node.js with Express for the backend. The data is stored in an SQLite database.

## Features

- **Fetch Data from External API**: Automatically fetches gas stations data from the Cologne geoportal API and stores it in the SQLite database.
- **Add Gas Stations**: Users can add new gas stations with an address, latitude, and longitude.
- **Edit Gas Stations**: Users can edit existing gas stations directly in the table with inline editing functionality.
- **Delete Gas Stations**: Users can delete gas stations.
- **Sort and Search**: The address column can be sorted in ascending or descending order. Users can also search for gas stations by address.
- **Responsive Design**: The application is designed to be responsive and user-friendly.

## Technologies Used

- **Frontend**: Vue.js
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **HTTP Client**: Axios

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Vue CLI installed

### Installation

**Clone the repository:**

```sh
git clone https://github.com/artificialintellicat/gas-stations-app.git
cd gas-stations-app
```

**Backend Setup:**
```sh
Code kopieren
cd backend
npm install
node server.js
```

**Frontend Setup:**

Open a new terminal and navigate to the frontend directory:

```sh
Code kopieren
cd ../frontend
npm install
npm run serve
```

**Access the Application:**

Open your browser and go to http://localhost:8080

## Contributing
Feel free to submit issues or pull requests if you have any suggestions or improvements.

## License
This project is licensed under the MIT License.