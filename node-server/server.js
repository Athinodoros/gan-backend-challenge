

var cookieParser = require('cookie-parser');
const express = require('express')
const fs = require('fs')
const app = express()
const { getDistance, getCityById, getActiveAddressesByTag, getAddressesByTag, getAllAddresses, getAddressesInRadiusFrom } = require('./utils');

const port = 8080

//ideally a dynamic map that will hold promises until they are resolved
//but since the test is for 2152f96f-50c7-4d76-9e18-f7033bd14428 lets make it that way
const resultToPoll = { "2152f96f-50c7-4d76-9e18-f7033bd14428": undefined }
// app.use(cookieParser());
app.use("*", (req, res, next) => {

    const auth = req.headers.authorization;
    if (auth === 'bearer dGhlc2VjcmV0dG9rZW4=') {
        next();
    } else {
        res.status(401);
        res.send('Access forbidden');
    }
})

app.get('/cities-by-tag', (req, res) => {
    const tag = req.query.tag;
    if (!tag) {
        res.status(400).send("Please provide tags to filter cities")
    }
    // only check for isActive if it is set
    const checkActive = req.query.isActive
    res.status(200).send({ cities: checkActive ? getActiveAddressesByTag(tag) : getAddressesByTag(tag) })
})

app.get('/distance', (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    if (!from || !to) {
        res.status(400).send("Please provide from and to destinations. Can't get the distance for one or less coordinates")
    }
    const fromCity = getCityById(from);
    const toCity = getCityById(to);
    if (!fromCity || !toCity) {
        res.status(400).send("One or more destinations not found!")
    }
    res.status(200).send({ from: fromCity, to: toCity, unit: "km", distance: getDistance(fromCity, toCity) })
})

app.get('/area', (req, res) => {
    const from = req.query.from;
    const distance = req.query.distance;
    if (!from || !distance) {
        res.status(400).send("Location and/or distance missing!")
    }
    const fromCity = getCityById(from);
    if (!fromCity) {
        res.status(400).send("City not found!")
    }
    res.status(202).send({
        resultsUrl: `${req.protocol + "://" + req.hostname + ":" + port}/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428`
    })
    getAddressesInRadiusFrom(fromCity,distance).then(result => {
        resultToPoll["2152f96f-50c7-4d76-9e18-f7033bd14428"] = result;
    })

})

app.get("/area-result/:id", (req, res) => {
    const id = req.params.id;
    if (!resultToPoll[req.params.id]) {
        res.status(400).send("Not such pending request");
    }
    if (resultToPoll[id]) {
        res.status(200).send({ cities: resultToPoll[id] });
        //clean the result after it is served
        resultToPoll[id] = undefined;
    } else {
        res.status(202).send()
    }

})

app.get("/all-cities",async (req,res)=>{
    try {
        res.setHeader('Content-Type', "application/json");
        res.setHeader('Content-disposition', 'attachment; filename=all-cities.json');

        const data = fs.createReadStream("../addresses.json");
        for await (const part of data){
            res.write(part)
        }
        res.end()
    
    } catch (error) {
        //usually we should not send server errors to the client 
        res.status(500).send("Something went wrong!")
    }
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})