const express = require('express')
const app = express()

const { validate } = require('./validate');
require('dotenv').config({ path: './config/dev.env' });
const { calcBestPath } = require('./pathCalculator');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/*
    @body {array} - the body of the request
        deliveries - array of orders where each order has one restaurant location, 
            one customer location and a cooking time in minutes

    @response {array} - the response body
        Sequence of locations, pointing out if it's a restaurant or customer location
            e.g. [{lat: 32.34, lng: 45.25, type: 'restaurant'}, {lat: 32.55, lng: 45.28, type: 'customer'}]
*/
app.post('/deliveries', validate('deliveries'), async function (req, res) {
    const orders = req.body;

    let path = [];
    try {
        path = await calcBestPath(orders)
    } catch (error) {
        return res.status(500).send('Error on our server');
    }

    return res.send(path)
})




app.listen(3000, () => console.log("Server is running on port 3000"))