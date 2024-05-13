//Importing libraries
//LORA libraries
#include <RHReliableDatagram.h>
#include <RH_RF95.h>
#include <SPI.h>
//MQTT libraries
#include <WiFi.h>
#include <PubSubClient.h>
//secret library
#include "secrets.h"

//LORA settings
#define RFM95_CS 15
#define RFM95_RST 4
#define RFM95_INT 2

#define GATEWAY_ADDRESS 10
// #define RTU_ADDRESS 11
int RTU_ADDRESSES[64] = {11, 12, 13, 14};

//Creating objects
// Singleton instance of the radio driver
RH_RF95 driver(RFM95_CS, RFM95_INT);
// Class to manage message delivery and receipt, using the driver declared above
RHReliableDatagram manager(driver, GATEWAY_ADDRESS);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// Network credentials
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASS;

// MQTT parameters
String id = DEVICE_ID;  // Name of our device, must be unique
String topic_publish = String(TOPIC_BASE) + "pubs/" + String(DEVICE_ID);  // Topic to publish to
String topic_subscribe = String(TOPIC_BASE) + "subs/" + String(DEVICE_ID);  // Topic to subcribe to

// Radio comm variables
uint8_t cmd11[] = "11";
uint8_t cmd12[] = "12";
uint8_t cmd13[] = "13";
uint8_t cmd14[] = "14";
uint8_t* cmd[128] = {cmd11, cmd12, cmd13, cmd14};

uint8_t buf[RH_RF95_MAX_MESSAGE_LEN];

// Misc
String dataset;

void setupMQTT(){
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(callback);
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
    Serial.println("Reconnecting to MQTT Broker...");
    
    if (mqttClient.connect(id.c_str(), MQTT_USERNAME, MQTT_PASS)) {
      Serial.println("Connected.");
      mqttClient.subscribe(topic_subscribe.c_str());     
    }      
  }
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Callback - ");
  Serial.print("Message:");
  String command;

  for (int i =0; i < length; i++){
    command += String((char)message[i]);
  }
  
  Serial.println(command);
  Serial.println(sizeof(command));
  delay(1000);
}

void setup() {
  //Serial setup
  Serial.begin(115200);
  while (!Serial) ; // Wait for serial port to be available

  //LORA setup
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);
  
  // manual reset
  digitalWrite(RFM95_RST, LOW);  delay(10);
  digitalWrite(RFM95_RST, HIGH); delay(10);
  
  if (!manager.init()) Serial.println("init failed");

  driver.setFrequency(440.0);
  driver.setTxPower(18, false);

  //MQTT setup
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");

  setupMQTT();
}

void loop() {
  if (!mqttClient.connected()) reconnect();
  mqttClient.loop();
  
  for (int i = 0; i < 4; i++){
    Serial.println("Sending request to: " + String(RTU_ADDRESSES[i]));
    Serial.println(String((char*) cmd[i]));
    // Send a message to manager_server
    if (manager.sendtoWait(cmd[i], sizeof(cmd[i]), RTU_ADDRESSES[i])){
      // Now wait for a reply from the server
      uint8_t len = sizeof(buf);
      uint8_t from;   
      if (manager.recvfromAckTimeout(buf, &len, 2000, &from)){
      Serial.print("got reply from: 0x");
      Serial.println(from, HEX);
      String reply = (char*) buf; // Convert the received reply to a String
      dataset += reply +";"; // Concatenate the reply to the dataset

        Serial.println(dataset);
      } else {
        Serial.println("No reply, is Node" + String(RTU_ADDRESSES[i]) + " running?");
        dataset += "0,0,0,0;";  
      }
    } else {
      Serial.println("sendtoWait failed");
      dataset += "0,0,0,0;";
    }
    delay(100);
  }
  mqttClient.publish(topic_publish.c_str(), dataset.c_str());
  dataset = "";
  delay(30000);
}
