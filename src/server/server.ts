import express from 'express';


const web_server = express();

const PORT = 3000;

web_server.get('/', (req, res) => res.send('Le sigh...'));

let clientPath = __dirname + '/../client';
console.log(`Serving files from client path ${clientPath}`);

web_server.use(express.static(clientPath));


web_server.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

})