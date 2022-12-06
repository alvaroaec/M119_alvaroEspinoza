//What : reading data from the arduino periodically
//Where : https://github.com/ucla-hci/m119/blob/main/m3/central.js
//Why: Code given as an example in M3

const noble = require('@abandonware/noble');

const uuid_service1 = "1101"
const uuid_value1_x = "2101"
const uuid_value1_y = "2102"
const uuid_value1_z = "2103"

const uuid_service2 = "3101"
const uuid_value2_x = "4101"
const uuid_value2_y = "4102"
const uuid_value2_z = "4103"


let sensorValue1_x = NaN
let sensorValue1_y = NaN
let sensorValue1_z = NaN

let sensorValue2_x = NaN
let sensorValue2_y = NaN
let sensorValue2_z = NaN

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        console.log("start scanning")
        await noble.startScanningAsync([uuid_service1], false);
    }
});

noble.on('discover', async (peripheral) => {
    await noble.stopScanningAsync();
    await peripheral.connectAsync();
    const {
        characteristics1
    } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service1], [uuid_value1_x, uuid_value1_y, uuid_value1_z]);
    readData(characteristics1[0]);
    readData(characteristics1[1]);
    readData(characteristics1[2]);
    peripheral.disconnect();
    await  peripheral.connectAsync();
    const {
        characteristics2
    } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service2], [uuid_value2_x, uuid_value2_y, uuid_value2_z]);
    readData(characteristics[0]);
    readData(characteristics[1]);
    readData(characteristics2[2]);
});


//
// read data periodically Arduino 1
//
let readData = async (characteristic) => {
    const value = (await characteristic.readAsync());

    if(characteristic.uuid = "2101"){
        sensorValue1_x = value.readFloatLE(0);
    }
    if(characteristic.uuid = "2102"){
        sensorValue1_y = value.readFloatLE(0);
    }
    if(characteristic.uuid = "2103"){
        sensorValue1_z = value.readFloatLE(0);
    }
    if(characteristic.uuid = "4101"){
        sensorValue2_x = value.reaedFloatLE(0);
    }
    if(characteristic.uuid = "4102"){
        sensorValue2_y = value.readFloatLE(0);
    }
    if(characteristic.uuid = "4103"){
        sensorValue2_z = value.readFloatLE(0);
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
        sensorValue1_x: sensorValue1_x,
        sensorValue1_y: sensorValue1_y,
        sensorValue1_z: sensorValue1_z,
        sensorValue2_x: sensorValue2_x,
        sensorValue2_y: sensorValue2_y,
        sensorValue2_z: sensorValue2_z        
    }))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})