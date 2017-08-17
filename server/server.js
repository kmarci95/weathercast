const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const axios = require('axios');
const moment = require('moment');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('new user connected');

    socket.on('createMessage', (newMessage) => {
        console.log('createMessage', newMessage);
        geoCode(newMessage).then((res) => {
            socket.emit('newMessage',res);
        }).catch((e) => {
            socket.emit('newMessage',e.message);
        });
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected');
    });
});

let geoCode = async (address) => {
    try{
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`;
        const res = await axios.get(geocodeUrl);
        let lat = res.data.results[0].geometry.location.lat;
        let long = res.data.results[0].geometry.location.lng;
        let add = res.data.results[0].formatted_address;
        let weatherUrl = `https://api.darksky.net/forecast/1b28f29a439df9c4277768e3cc4cc465/${lat},${long}?lang=hu&units=si`;
        const weatherData = await axios.get(weatherUrl);
        let temperature = parseFloat(weatherData.data.currently.temperature).toFixed(1);
        let appTemp = parseFloat(weatherData.data.currently.apparentTemperature).toFixed(1);
        let icon = weatherData.data.currently.icon;
        let summary = weatherData.data.currently.summary;
        let time = weatherData.data.currently.time;
        return {
            add,
            temperature,
            appTemp,
            icon,
            summary,
            time
        };
    }
    catch(e){
        throw new Error('Unable to get address. Please do not use letter accents.');
    }

};

server.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});



