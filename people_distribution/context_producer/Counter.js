module.exports = class Counter {
    id;
    male;
    female;
    location;

    constructor(id, male, female, lat, lon) {
        this.id = id;
        this.male = male;
        this.female = female;
        this.location = {
            lat: lat,
            lon: lon
        };
    }

    getEntity() {
        return {
            entityId: {
                id: 'PeopleCounter.' + this.id,
                type: 'PeopleCounter',
                isPattern: false
            },
            attributes: [{
                name: 'count',
                type: 'integer',
                value: this.male + this.female
            }, {
                name: 'male',
                type: 'integer',
                value: this.male
            }, {
                name: 'female',
                type: 'integer',
                value: this.female
            }],
            domainMetadata: [{
                name: 'location',
                type: 'point',
                value: {
                    latitude: this.location.lat,
                    longitude: this.location.lon
                }
            }, {
                name: 'timestamp',
                type: 'integer',
                value: Date.now()
            }]
        };
    }
};
