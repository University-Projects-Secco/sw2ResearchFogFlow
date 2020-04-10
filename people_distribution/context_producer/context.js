const NGSI = require('./ngsiclient.js');
const Counter = require('./Counter');
const brokerURL = "http://localhost:8070/ngsi10";

let ngsi10client = new NGSI.NGSI10Client(brokerURL);
let entities = new Array(10);

function update() {
    for (let i = 0; i < 10; i++) {
        let male = Math.floor((Math.random() * 50) - 24);
        let female = Math.floor((Math.random() * 50) - 24);
        entities[i].male += male;
        entities[i].female += female;
        ngsi10client.updateContext(entities[i].getEntity()).then(function (data) {
            console.log(data);
        }).catch(function (error) {
            console.log('failed to update context: ' + error);
        });
    }
}

for (let i = 0; i < 10; i++) {
    let male = Math.floor((Math.random() * 100) + 1);
    let female = Math.floor((Math.random() * 100) + 1);
    entities[i] = new Counter(i, male, female, Math.random(), Math.random());
}

update();
setInterval(() => update(), 10000);
