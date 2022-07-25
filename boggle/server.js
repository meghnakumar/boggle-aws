let express = require('express');

let app = express();

app.use(express.static(__dirname+'/build'));

app.get('/*', (req, resp) => {
    resp.sendFile(__dirname+'/build/index.html');
})

app.listen(process.env.PORT || 8080);