const express = require('express');
const app = express();
const port = 3168; // Use non-standard port to avoid conflicts (web server is on 3000)

app.use(express.json()); // for parsing application/json

app.post('/data', (req, res) => {
    console.log('Received data:', req.body);
    res.status(200).send('Data received');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
