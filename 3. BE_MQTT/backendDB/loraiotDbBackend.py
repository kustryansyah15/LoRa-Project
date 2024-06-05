import random
import time
from os import remove as deletefile
from os.path import exists as file_exists
from paho.mqtt import client as mqtt_client
from datetime import datetime
import mysql.connector
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

broker = 'XXX'
port = XXX
topic = "XXX"

client_id = f'python-mqtt-{random.randint(0, 1000)}'
username = 'XXX'
password = 'XXX'

def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            client.subscribe(topic)
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    def on_log(client, userdata, level, buff):
        pass

    def on_message(client, userdata, msg):
        print(f"time: {time.time()} | data: {msg.payload.decode()}")

        # Establish a connection to the MySQL database
        connection = mysql.connector.connect(
            host="localhost",
            user="username",
            password="password",
            database="database",
            auth_plugin='mysql_native_password'
        )
        cursor = connection.cursor()

        # Get the current date and time
        now = datetime.now()
        ymdTime = now.strftime("%Y-%m-%d")
        hmsTime = now.strftime("%H:%M:%S")

        # Extract and print dataList
        datasetList = msg.payload.decode().split(";")
        temps = []
        for data in datasetList:
            if data:
                temps.append(data.split(",")[0])

        # Define the temperature input variable and its membership functions
        temperature = ctrl.Antecedent(np.arange(0, 101, 1), 'temperature')
        temperature['cold'] = fuzz.trimf(temperature.universe, [0, 0, 25])
        temperature['normal'] = fuzz.trimf(temperature.universe, [22, 25, 28])
        temperature['hot'] = fuzz.trimf(temperature.universe, [25, 100, 100])

        # Define the shade output variable and its membership functions
        shade = ctrl.Consequent(np.arange(0, 101, 1), 'shade')
        shade['no'] = fuzz.trimf(shade.universe, [0, 0, 50])
        shade['yes'] = fuzz.trimf(shade.universe, [50, 100, 100])

        # Define the fuzzy rules
        rule1 = ctrl.Rule(temperature['cold'], shade['no'])
        rule2 = ctrl.Rule(temperature['normal'], shade['no'])
        rule3 = ctrl.Rule(temperature['hot'], shade['yes'])

        # Create the fuzzy control system
        shade_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
        shade_sim = ctrl.ControlSystemSimulation(shade_ctrl)

        # Process each temp point from the temps list
        for i, temp in enumerate(temps, start=1):
            # Set the input temperature value
            shade_sim.input['temperature'] = float(temp)

            # Compute the result
            shade_sim.compute()

            # Convert the shade value to "1" or "0"
            output = 0 if shade_sim.output['shade'] <= 26 else 1

            print("Output:", output)

            # Construct the SQL query for update
            update_query = "UPDATE nodes SET Is_Need_Shade= %s WHERE Node_Id = %s"
            update_values = [output, i + 1]
            print(update_values)
            # Execute the insertion query
            cursor.execute(update_query, update_values)

        # Construct the SQL query for insertion
        insert_query = "INSERT INTO monitoring_data (Tanggal, Waktu, Suhu1, RH1, SH1, IC1, Suhu2, RH2, SH2, IC2, Suhu3, RH3, SH3, IC3, Suhu4, RH4, SH4, IC4 ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        dataList = [data.split(",") for data in datasetList]
        insert_values = [ymdTime, hmsTime] + [item for sublist in dataList for item in sublist]
        insert_values.pop()
        print(insert_values)
        # Execute the insertion query
        cursor.execute(insert_query, insert_values)

        # Commit the changes and close the database connection
        connection.commit()
        connection.close()


    client = mqtt_client.Client(client_id)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_log = on_log
    client.connect(broker, port)
    return client


def publish(client):
    while True:
        pass            

def run():
    client = connect_mqtt()
    client.loop_start()

    publish(client)


if __name__ == '__main__':
    print("running...")
    run()
