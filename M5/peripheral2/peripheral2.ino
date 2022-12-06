#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

#define BLE_UUID_ACCELEROMETER_SERVICE "3101"
#define BLE_UUID_ACCELEROMETER_X "4101"
#define BLE_UUID_ACCELEROMETER_Y "4102"
#define BLE_UUID_ACCELEROMETER_Z "4103"

#define BLE_DEVICE_NAME "Elfo2"
#define BLE_LOCAL_NAME "Elfo2"

BLEService accelerometerService(BLE_UUID_ACCELEROMETER_SERVICE);

BLEFloatCharacteristic accelerometerCharacteristicX(BLE_UUID_ACCELEROMETER_X, BLERead | BLENotify);
BLEFloatCharacteristic accelerometerCharacteristicY(BLE_UUID_ACCELEROMETER_Y, BLERead | BLENotify);
BLEFloatCharacteristic accelerometerCharacteristicZ(BLE_UUID_ACCELEROMETER_Z, BLERead | BLENotify);

float ax, ay, az;
short state = 2;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  // initialize IMU
  Serial.begin(9600);
  while(!Serial);
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1)
      ;
  }

  //Accelerometer
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
  accelerometerService.addCharacteristic(accelerometerCharacteristicY);
  accelerometerService.addCharacteristic(accelerometerCharacteristicZ);


  BLE.addService(accelerometerService);

  accelerometerCharacteristicX.writeValue(0);
  accelerometerCharacteristicY.writeValue(0);
  accelerometerCharacteristicZ.writeValue(0);

  // start advertising
  BLE.advertise();

  Serial.println("BLE Accelerometer Peripheral");
}

void loop() {
  BLEDevice central = BLE.central();
  if (IMU.accelerationAvailable()) {
    digitalWrite(LED_BUILTIN, HIGH);
    IMU.readAcceleration(ax, ay, az);

    accelerometerCharacteristicX.writeValue(ax);
    accelerometerCharacteristicY.writeValue(ay);
    accelerometerCharacteristicZ.writeValue(az);
    /*Serial.println("Accelerometer");
    Serial.print("ax :");
    Serial.println(ax);
    Serial.print("ay :");
    Serial.println(ay);
    Serial.print("az :");
    Serial.println(az);*/
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
  if(ay>0.8f){
    state = 0;
  }
  else if(ay<-0.8f){
    state = 1;
  }
  else if(ax>0.5 || ax<-0.5){
    state = 2;
  }
  
  printState(state);
  delay(500);
}
void printState(int state){
  switch(state){
    case 0:
      Serial.println("DOWN");
    break;

    case 1:
      Serial.println("UP");
    break;

    case 2:
      Serial.println("STOP");
    break;
  }
}