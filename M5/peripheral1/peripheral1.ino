//What: Arduino BLE Notify
//Where : https://github.com/ucla-hci/m119/tree/main/m2b_peripheral
//Why : Example given in M2
#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

#define BLE_UUID_ACCELEROMETER_SERVICE "1101"
#define BLE_UUID_ACCELEROMETER_X "2101"
#define BLE_UUID_ACCELEROMETER_Y "2102"
#define BLE_UUID_ACCELEROMETER_Z "2103"

#define BLE_DEVICE_NAME "Elfo"
#define BLE_LOCAL_NAME "Elfo"

BLEService accelerometerService(BLE_UUID_ACCELEROMETER_SERVICE);
BLEFloatCharacteristic accelerometerCharacteristicX(BLE_UUID_ACCELEROMETER_X, BLERead | BLENotify);


float x, y, z;
short state = 2;
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  while(!Serial);

  // initialize IMU
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }

  Serial.print("Accelerometer sample rate = ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println("Hz");

  // initialize BLE
  if (!BLE.begin()) {
    Serial.println("Starting Bluetooth® Low Energy module failed!");
    while (1)
      ;
  }

  // set advertised local name and service UUID
  BLE.setDeviceName(BLE_DEVICE_NAME);
  BLE.setLocalName(BLE_LOCAL_NAME);
  BLE.setAdvertisedService(accelerometerService);

  accelerometerService.addCharacteristic(accelerometerCharacteristicX);


  BLE.addService(accelerometerService);

  accelerometerCharacteristicX.writeValue(0);


  // start advertising
  BLE.advertise();

  Serial.println("BLE Accelerometer Peripheral");
}

void loop() {
  BLEDevice central = BLE.central();

  if (IMU.accelerationAvailable()) {
    digitalWrite(LED_BUILTIN, HIGH);
    IMU.readAcceleration(x, y, z);
    if(x > 0.9f){
      state = 0; 
    }
    else if(x<-0.8f){
      state = 1;
    }
    else if(y > 1.2f|| y<-1.2f){
      state = 2;
    }
    accelerometerCharacteristicX.writeValue(state);

  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
  /*  Serial.print("x : ");
    Serial.println(x);
    Serial.print("y : ");
    Serial.println(y);
    Serial.print("z : ");
    Serial.println(z);
*/

    printstate();

}
void printstate(){
  switch(state){
    case 0:
      Serial.println("UP");
    break;
    case 1:
      Serial.println("DOWN");
    break;
    case 2:
      Serial.println("STOP");
    break;
  }

}