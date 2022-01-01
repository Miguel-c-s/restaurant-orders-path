# Restaurant orders project

This project uses OR-Tools to find the shortest time path for a courier starting at a fixed position and having to deliver N orders where each
order has a restaurant location, customer location and the cookingTime in minutes for the food to be ready.

## Requisites
Python3
OR-tools: https://developers.google.com/optimization/install (e.g. pip3 install ortools)
Node.js (tested with v14)

## Run
Add the google api key in the file ./config/dev.env with the key GOOGLE_API_KEY or write it as an env variable in your system
Run "node index.js"



## Input Example
[
    {
        "id": 1,
        "restaurantLocation": {
            "lat": 38.712053,
            "lng": -9.141535
        },
        "customerLocation": {
            "lat": 38.712871,
            "lng": -9.156252
        },
        "cookingTime": 15
    },
    {
        "id": 2,
        "restaurantLocation": {
            "lat": 38.720368,
            "lng": -9.135553
        },
        "customerLocation": {
            "lat": 38.722642220148764,
            "lng": -9.143937989210812
        },
        "cookingTime": 35
    }
]

