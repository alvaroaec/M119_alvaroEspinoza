//What : reading data from the arduino periodically
//Where : https://github.com/ucla-hci/m119/blob/main/m3/central.js
//Why: Code given as an example in M3

const noble = require('@abandonware/noble');

const uuid_service = "1101"
const uuid_value_x = "2101"
const uuid_value_y = "2102"
const uuid_value_z = "2103"

let sensorValue_x = NaN
let sensorValue_y = NaN
let sensorValue_z = NaN

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        console.log("start scanning")
        await noble.startScanningAsync([uuid_service], false);
    }
});

noble.on('discover', async (peripheral) => {
    await noble.stopScanningAsync();
    await peripheral.connectAsync();
    const {
        characteristics
    } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service], [uuid_value_x, uuid_value_y, uuid_value_z]);
    readData(characteristics[0])
    readData(characteristics[1])
    readData(characteristics[2])
});

//
// read data periodically
//
let readData = async (characteristic) => {
    const value = (await characteristic.readAsync());

    if(characteristic.uuid = "2101"){
        sensorValue_x = value.readFloatLE(0);
    }
    if(characteristic.uuid = "2102"){
        sensorValue_y = value.readFloatLE(0);
    }
    if(characteristic.uuid = "2103"){
        sensorValue_z = value.readFloatLE(0);
    }
    // read data again in t milliseconds
    setTimeout(() => {
        readData(characteristic)
    }, 10);
}

//
// hosting a web-based front-end and respond requests with sensor data
// based on example code on https://expressjs.com/
//
const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        sensorValue_x: sensorValue_x,
        sensorValue_y: sensorValue_y,
        sensorValue_z: sensorValue_z
    }))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})