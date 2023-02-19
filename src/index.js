const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

//importing data
// const info = require("./data");
// const data = info.data;

//my code
app.post("/entry", async (req, res) => {
    try {
        const newEntry = await connection.createMany(req.body);
        res.status(201).send({
            status: "sucessful",
            data: newEntry
        })
    } catch (err) {
        res.status(404).send({
            status: "faliur",
            message: err.message
        })
    }

})
app.get("/totalRecovered", async (req, res) => {
    try {
        const data = await connection.find()
        let result = data.map((singleData) => {
            return singleData.recovered;
        })
        let totalRecovered = result.reduce((a, b) => a + b);

        res.status(200).send({
            status: "sucessfull",
            data: { _id: "total", recovered: totalRecovered }
        })
    } catch (err) {
        res.status(400).send({
            status: "failed",
            message: err.message
        })
    }
})

app.get("/totalActive", async (req, res) => {
    const data = await connection.find()
    let result = data.map((singleData) => {
        return singleData.infected;
    })
    let totalActive = result.reduce((a, b) => a + b);

    try {
        res.status(200).send({
            status: "sucessfull",
            data: { _id: "total", active: totalActive }
        })
    } catch (err) {
        res.status(400).send({
            status: "failed",
            message: err.message
        })
    }
})

app.get("/totalDeath", async (req, res) => {
    try {
        const data = await connection.find();
        let result = data.map((singleData) => {
            return singleData.death;
        })
        let totalDeath = result.reduce((a, b) => a + b);

        res.status(200).send({
            status: "sucessfull",
            data: { _id: "total", death: totalDeath }
        })
    } catch (err) {
        res.status(400).send({
            status: "failed",
            message: err.message
        })
    }
})

app.get("/hotspotStates", async (req, res) => {
    try {
        let result = [];
        const data = await connection.find();
        data.map((singleData) => {
            let rate = (singleData.infected - singleData.recovered) / singleData.infected;
            rate = rate.toFixed(5);
            if (rate > 0.1) {
                return result.push({ state: singleData.state, rate: rate })
            }
        })
        // console.log(result);
        res.status(200).send({
            status: "sucessfull",
            data: result
        })
    } catch (err) {
        res.status(400).send({
            status: "failed",
            message: err.message
        })
    }
})

app.get("/healthyStates", async (req, res) => {
    try {
        let result = [];
        const data = await connection.find();
        data.map((singleData) => {
            let mortality = singleData.death / singleData.infected;
            mortality = mortality.toFixed(5);
            if (mortality < 0.005) {
                return result.push({ state: singleData.state, mortality: mortality })
            }
        })
        // console.log(result);
        res.status(200).send({
            status: "sucessfull",
            data: result
        })
    } catch (err) {
        res.status(400).send({
            status: "failed",
            message: err.message
        })
    }
})


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;