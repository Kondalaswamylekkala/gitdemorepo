const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./Routes/routes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/sgfbl1nopen', routes);

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));