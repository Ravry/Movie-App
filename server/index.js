//server (communicating with the api)

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const APIKEY = 'c2f35c36'

app.use(cors())

app.get('/api', async (req, res) => {  
    const pageValue = req.query.page || 1;
    const searchTerm = req.query.search || "Movie";
    const url = `https://www.omdbapi.com/?s=${searchTerm}&type=movie&page=${pageValue}&apikey=${APIKEY}`
    
    var response = 'error: comunication (server -> api) failed! fatal!';
    try {
        const rawResponse = await fetch(url);
        const dataResponse = await rawResponse.json();
        response = dataResponse;
    }
    catch (error) {
        console.error(error.message);
    }

    res.json({data: response})
})
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})