const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const appRoute = require('./src/routes/route');
app.use('/', appRoute);

app.listen(5000, ()=>{
    console.log('Server Berjalan di Port : 5000');
});