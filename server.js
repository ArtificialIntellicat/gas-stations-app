const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const https = require('https');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create gas stations table
db.serialize(() => {
    db.run(`
        CREATE TABLE gas_stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT,
            latitude REAL,
            longitude REAL,
            source TEXT
        )
    `);
});

// Fetch gas stations from external API and save to database
app.get('/api/external-gas-stations', async (req, res) => {
    try {
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await axios.get(
            'https://geoportal.stadt-koeln.de/arcgis/rest/services/verkehr/gefahrgutstrecken/MapServer/0/query?where=objectid+is+not+null&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson',
            { httpsAgent: agent }
        );

        const gasStations = response.data.features.map(feature => ({
            address: feature.attributes.adresse || 'N/A',
            latitude: feature.geometry.y,
            longitude: feature.geometry.x,
            source: 'api'
        }));

        const insert = db.prepare('INSERT INTO gas_stations (address, latitude, longitude, source) VALUES (?, ?, ?, ?)');
        let count = 0;

        for (const station of gasStations) {
            await new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) AS count FROM gas_stations WHERE address = ?', [station.address], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (row.count === 0) {
                            insert.run(station.address, station.latitude, station.longitude, station.source, err => {
                                if (err) {
                                    reject(err);
                                } else {
                                    count++;
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            });
        }

        insert.finalize();
        console.log(`${count} new gas stations added.`);
        res.json({ message: `${count} new gas stations added.` });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all gas stations
app.get('/api/gas-stations', (req, res) => {
    db.all('SELECT * FROM gas_stations', [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// Add a new gas station
app.post('/api/gas-stations', (req, res) => {
    const { address, latitude, longitude } = req.body;
    db.get('SELECT MAX(id) AS maxId FROM gas_stations', (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const nextId = (row.maxId || 0) + 1;

        db.run('INSERT INTO gas_stations (id, address, latitude, longitude, source) VALUES (?, ?, ?, ?, ?)', [nextId, address, latitude, longitude, 'user'], function (err) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json({ id: nextId });
            }
        });
    });
});

// Update a gas station
app.put('/api/gas-stations/:id', (req, res) => {
    const { address, latitude, longitude } = req.body;
    const { id } = req.params;
    db.run('UPDATE gas_stations SET address = ?, latitude = ?, longitude = ? WHERE id = ?', [address, latitude, longitude, id], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.sendStatus(200);
        }
    });
});

// Delete a gas station
app.delete('/api/gas-stations/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM gas_stations WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.sendStatus(200);
        }
    });
});

// Delete all gas stations
app.delete('/api/gas-stations', (req, res) => {
    db.run('DELETE FROM gas_stations', function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.sendStatus(200);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
