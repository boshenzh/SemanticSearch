const express = require('express');
const app = express();

const cors = require('cors');
const bodyParser = require('body-parser');

const errorHandler = require('./_helpers/error-handler');
const path = require('path');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

app.use('/image', require('./routes/image.router'));
app.use('/video', require('./routes/video.router'));
app.use(errorHandler);

// start server
const port = 80;
app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
