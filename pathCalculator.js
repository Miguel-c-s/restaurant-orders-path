const axios = require('axios');
const { once } = require('events');
const childProcess = require("child_process")

/*
    @method getDirections - get the directions between two locations
    @param {string} origin - the origin address
    @param {string} destination - the destination address

    @return {object} - the directions data object
*/
async function getDirections(orig, dest) { // Use %2C for commas URL encoding
    try {
        const url = "https://maps.googleapis.com/maps/api/directions/json" +
            `?origin=${orig.lat},${orig.lng}&destination=${dest.lat},${dest.lng}&key=${process.env.GOOGLE_API_KEY}`;
        return (await axios.get(url)).data;
    } catch (error) {
        console.log(error);
    }
}


/*
    @method getTotalTravelTime - calculate the total travel time between two locations
    @param {object} dir - the directions data object

    @return {number} - the total travel time in seconds
*/
function getTotalTravelTime(dir) {
    let totalTime = 0;
    dir.routes[0].legs.forEach(leg => {
        totalTime += leg.duration.value;
    });
    return totalTime;
}


/*
    @method getArrayOfLocations - get the array of locations from the deliveries
    @param {object} courier - the courier location
    @param {array} orders - the array of orders

    @return {array} - the array of locations
*/
function getArrayOfLocations(courier, orders) {
    let locations = [];
    locations.push({ lat: courier.lat, lng: courier.lng, type: 'start' });

    orders.forEach((order) => {
        locations.push({
            lat: order.restaurantLocation.lat,
            lng: order.restaurantLocation.lng,
            type: 'restaurant'
        });
        locations.push({
            lat: order.customerLocation.lat,
            lng: order.customerLocation.lng,
            type: 'customer'
        });
    });
    return locations;
}


/*
    @method getDistanceMatrix - get the *time* distance matrix between all the locations
    @param {array} locations - the array of locations

    @return {array} - the time distance matrix
*/
async function getTimeDistanceMatrix(locations) {
    const distMatrix = [];
    for (let i = 0; i < locations.length; i++) {
        distMatrix[i] = new Array(locations.length).fill(0);
    }
    await Promise.all(locations.map(async (loc, idx) => {
        await Promise.all(locations.map(async (loc2, idx2) => {
            if (idx2 > idx) { // Calculate only once for each pair of locations
                const dir = await getDirections({ lat: loc.lat, lng: loc.lng },
                    { lat: loc2.lat, lng: loc2.lng });
                const time = getTotalTravelTime(dir);
                distMatrix[idx][idx2] = time;
                distMatrix[idx2][idx] = time;
            }
        }))
    }))
    // We assign all distances to the starting point to 0 in order to make sure we don't go back to the starting point
    for (let i = 0; i < locations.length; i++) {
        distMatrix[i][0] = 0;
    }

    return distMatrix;
}

function getTimeLimits(orders) {
    // length of orders + 1 for the starting point
    const timeLimits = new Array(orders.length * 2 + 1).fill(0);
    orders.forEach((order, idx) => {
        // The time limits correspond to the restaurants, which come in the odd indexes
        timeLimits[idx * 2 + 1] = order.cookingTime * 60; // in seconds

    })
    return timeLimits
}

/*
    @metod calcBestPath - calculate the best path between the locations
    @param {array} orders - the array of orders
    
    @return {array} - the array of locations
*/
async function calcBestPath(orders) {
    // Courier starts at this position (first arg)
    const locations = getArrayOfLocations({ lat: 38.7251623583442, lng: -9.149948003993101 }, orders);

    const distMatrix = await getTimeDistanceMatrix(locations);

    const timeLimits = getTimeLimits(orders);

    
    const pythonProcess = childProcess.spawn('python3', ["optimizeRoute.py", distMatrix, timeLimits]);

    const data = await once(pythonProcess.stdout, 'data');
    const path = data.toString().split(',').slice(0, -1).map(Number);

    const populatedPath = [];
    path.forEach(v => {
        populatedPath.push(locations[v])
    });
    return populatedPath;

    // pythonProcess.stdout.on('data', (data) => {
    //     console.log(data.toString())
    //     if (data.toString().substring(0, 5) === 'path:') {
    //         // Slice to remove the \n at the end
    //         const path = data.toString().substring(5,).split(',').slice(0, -1).map(Number);


    //         console.log(populatedPath)
    //     }
    // });
}

module.exports = { calcBestPath }; 