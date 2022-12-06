#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

#define BLE_UUID_ACCELEROMETER_SERVICE "1101"
#define BLE_UUID_ACCELEROMETER_X "2101"
#define BLE_UUID_ACCELEROMETER_Y "2102"
#define BLE_UUID_ACCELEROMETER_Z "2103"
#define BLE_UUID_GYROSCOPE_Z "2104"

#define BLE_DEVICE_NAME "Elfo"
#define BLE_LOCAL_NAME "Elfo"

BLEService accelerometerService(BLE_UUID_ACCELEROMETER_SERVICE);

BLEFloatCharacteristic accelerometerCharacteristicX(BLE_UUID_ACCELEROMETER_X, BLERead | BLENotify);
BLEFloatCharacteristic accelerometerCharacteristicY(BLE_UUID_ACCELEROMETER_Y, BLERead | BLENotify);
BLEFloatCharacteristic accelerometerCharacteristicZ(BLE_UUID_ACCELEROMETER_Z, BLERead | BLENotify);
BLEFloatCharacteristic gyroscopeCharacteristicZ(BLE_UUID_GYROSCOPE_Z, BLERead | BLENotify);

float ax, ay, az, gx, gy, gz;

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

  //Gyroscope
  Serial.print("Gyroscope sample rate = ");
  Serial.print(IMU.gyroscopeSampleRate());
  Serial.println(" Hz");  
  Serial.println();
  Serial.println("Gyroscope in degrees/second");

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
  accelerometerService.addCharacteristic(gyroscopeCharacteristicZ);

  BLE.addService(accelerometerService);

  accelerometerCharacteristicX.writeValue(0);
  accelerometerCharacteristicY.writeValue(0);
  accelerometerCharacteristicZ.writeValue(0);
  gyroscopeCharacteristicZ.writeValue(0);

  // start advertising
  BLE.advertise();

  Serial.println("BLE Accelerometer Peripheral");
}

void loop() {
  BLEDevice central = BLE.central();
  if(IMU.gyroscopeAvailable()){
    digitalWrite(LED_BUILTIN, HIGH);
    IMU.readGyroscope(gx, gy, gz);
    /*Serial.println("Gyroscope :");
    Serial.print("Gx : ");
    Serial.println(gx);
    Serial.print("Gy : ");
    Serial.println(gy);
    Serial.print("Gz : ");
    Serial.println(gz);*/    
    }
  if (IMU.accelerationAvailable()) {
    digitalWrite(LED_BUILTIN, HIGH);
    IMU.readAcceleration(ax, ay, az);

    accelerometerCharacteristicX.writeValue(ax);
    accelerometerCharacteristicY.writeValue(ay);
    accelerometerCharacteristicZ.writeValue(az);
    Serial.println("Accelerometer");
    Serial.print("ax :");
    Serial.println(ax);
    Serial.print("ay :");
    Serial.println(ay);
    Serial.print("az :");
    Serial.println(az);

  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }
  if(ax < -0.2){
    Serial.println("tilting left");
  }
  else if(ax>0.2){
    Serial.println("tilting right");
  }
  else{
    Serial.println("balanced");
  }
  
  delay(500);
}