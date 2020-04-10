const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.post('/ngsi10/updateContext', (req, res) => {
    for (let contextElement of req.body.contextElements) {
        console.log("next booth for " + contextElement.id + ": " + contextElement.attributes[0].value);
    }
    res.send({contextResponses: null})
});

app.listen(7000, () => console.log("App now running on port", 7000));

for (let i = 0; i < 10; i++) {
    axios({
        method: 'post',
        url: 'http://localhost:8070/NGSI9/registerContext',
        headers: {'fiware-service': 'openiot', 'fiware-servicepath': '/'},
        data: {
            contextRegistrations: [
                {
                    entities: [{
                        type: 'EBoard',
                        isPattern: 'false',
                        id: 'EBoard.' + i
                    }],
                    attributes: [{
                        name: 'show',
                        type: 'command'
                    }],
                    providingApplication: 'http://192.168.1.4:7000'
                }]
        }
    }).then(function (response) {
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }).catch(err => {
        console.log("error registering EBoard " + i);
    });
}
