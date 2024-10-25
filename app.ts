//importing packages
import { createClient } from "@supabase/supabase-js";
import { SerialPort } from "serialport";
import Readline from "@serialport/parser-readline";

const supabaseUrl = '';
const supabaseKey = '';
const supabase = createClient(supabaseUrl, supabaseKey);

//defining data types
type SensorData = {
    humidity: number;
    moisture: number;
    temperature: number;
};

const port = new SerialPort('COM7', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

//method that saves humidity data to database
async function saveHumidity(humidity: number) {
    const { data, error } = await supabase .from('humidity_log')
                                           .insert([{ humidity_value: humidity, timestamp: new Date() }]);

    if (error) {
        console.error('Error insert humidity data:', error.message);
    }
    else {
        console.log('Humidity data saved:', data);
    }
}

//method that saves moisture data to database
async function saveMoisture(moisture: number) {
    const { data, error } = await supabase .from('moisture_log')
                                           .insert([{ moisture_value: moisture, timestamp: new Date() }]);

    if (error) {
        console.error('Error insert moisture data:', error.message);
    }
    else {
        console.log('Moisture data saved:', data);
    }
}

//method that saves temperature data to database
async function saveTemperature(temperature: number) {
    const { data, error } = await supabase .from('temperature_log')
                                           .insert([{ temperature_value: temperature, timestamp: new Date() }]);

    if (error) {
        console.error('Error insert temperature data:', error.message);
    }
    else {
        console.log('Temperature data saved:', data);
    }
}

//function to parse sensor data
function parseSensorData(data: string): SensorData | null {
    const parts = data.split(',');
    if (parts.length === 3) {
        const humidity = parseInt(parts[0].split(':')[1]);
        const moisture = parseInt(parts[1].split(':')[1]);
        const temperature = parseInt(parts[2].split(':')[1]);

        return { humidity, moisture, temperature };
    }
    else {
        console.warn('Received invalid data format:', data);
        return null;
    }
}

//receiving data from arduino
parser.on('data', (data: string) => {
    console.log('Receive data:', data);

    const sensorData = parseSensorData(data);
    if (sensorData) {
        saveHumidity(sensorData.humidity);
        saveMoisture(sensorData.moisture);
        saveTemperature(sensorData.temperature);
    }
});

port.on('error', (err) => {
    console.error('Error with serial port:', err.message);
});