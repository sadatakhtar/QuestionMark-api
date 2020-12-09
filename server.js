const express = require('express');
const app = express();
const cors = require('cors');

const PORT = 3001;

//ROUTES
app.get('/', (req, res) => {
 res.send('Homepage here');
});

//SERVER LISTEN
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server listening on port ${PORT}`);
});