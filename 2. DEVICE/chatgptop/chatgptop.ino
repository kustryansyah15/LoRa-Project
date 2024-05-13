// Importing libraries
#include <RHReliableDatagram.h>
#include <RH_RF95.h>
#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_AHTX0.h>
// #include <TinyGPS++.h>
// #include <SoftwareSerial.h>

// Constants
#define RFM95_CS 10
#define RFM95_RST 9
#define RFM95_INT 2
#define RTU_ADDRESS 11
#define GATEWAY_ADDRESS 10

// Objects and instances
RH_RF95 driver(RFM95_CS, RFM95_INT);
RHReliableDatagram manager(driver, RTU_ADDRESS);
BH1750 lightMeter;
Adafruit_AHTX0 aht;

// Sensor variables
String dataset;
float sensor1, sensor2, sensor4;
int sensor3;
// double sensor5, sensor6;
uint8_t data[64];
uint8_t buf[RH_RF95_MAX_MESSAGE_LEN];
const char Gateway_Command[] = "11";
uint8_t dataLen = 0;

void setup() {
  Serial.begin(9600);
  Serial.print("Running");

  // Sensors setup
  Wire.begin();
  lightMeter.begin();
  aht.begin();

  // LORA setup
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);

  if (!manager.init())
    Serial.println("init failed");

  driver.setFrequency(440.0);
  driver.setTxPower(18, false);

  Serial.println("Node" + String(RTU_ADDRESS) + " Started...");
}

void loop() {
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);
  sensor1 = temp.temperature;
  sensor2 = humidity.relative_humidity;
  sensor3 = map(analogRead(A0), 0, 1023, 0, 100);
  sensor4 = lightMeter.readLightLevel();
  
  if (manager.available()){
    // Wait for a message addressed to this node
    uint8_t len = sizeof(buf);
    uint8_t from;
    if (manager.recvfromAck(buf, &len, &from)){

      if(String(Gateway_Command) == String((char*)buf)){
        dataset = String(sensor1);
        dataset += "," + String(sensor2);
        dataset += "," + String(sensor3);
        dataset += "," + String(sensor4);
        // dataset += "," + String(sensor5);
        // dataset += "," + String(sensor6);
        dataset.toCharArray(data, 128);
        Serial.println(dataset);

      // Send a reply back to gateway
      if (!manager.sendtoWait(data, sizeof(data), from));
      }
    }
  }
}