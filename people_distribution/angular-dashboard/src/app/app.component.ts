import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {HttpClient} from '@angular/common/http';
import {Subject, timer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// import express from 'express';
// const app = express();

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

    counterNumber = 10;
    displayedColumns: string[] = ['name', 'affluence', 'next', 'control'];
    dataSource = new MatTableDataSource<PeopleCounter>([]);
    destroyed = new Subject();

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.sliderValueChanged();
        this.dataSource.paginator = this.paginator;
        const source = timer(0, 10000);
        source.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.dataSource.data.filter(element => element.random).forEach(element => {
                const counter = this.dataSource.data[element.name.replace('PeopleCounter.', '')];
                const affluence = Math.floor(Math.random() * 100);
                const male = Math.floor(Math.random() * affluence);
                counter.affluence = {male, female: affluence - male};
                counter.nextAffluence = affluence;
                this.updateCounter(counter);
            });
        });
        // app.use(express.json());
        // app.listen(7000, () => console.log('App now running on port', 7000));
        /* app.post('/ngsi10/updateContext', (req, res) => {
            for (const contextElement of req.body.contextElements) {
                console.log('next booth for ' + contextElement.id + ': ' + contextElement.attributes[0].value);
            }
            res.send({ contextResponses: null });
        });*/
    }

    sliderValueChanged() {
        if (this.dataSource.data.length < this.counterNumber) {
            for (let i = this.dataSource.data.length; i < this.counterNumber; i++) {
                const affluence = Math.floor(Math.random() * 100);
                const male = Math.floor(Math.random() * affluence);
                const counter = new PeopleCounter(i, male, affluence - male, Math.random(), Math.random());
                this.dataSource.data.push(counter);
                this.updateCounter(counter);
                this.registerBoard(i);
            }
        } else {
            for (let i = this.dataSource.data.length; i > this.counterNumber; i--) {
                this.dataSource.data.pop();
            }
        }
        this.dataSource._updateChangeSubscription();
    }

    elementValueChanged(counter) {
        const newCounter = this.dataSource.data[counter.name.replace('PeopleCounter.', '')];
        const male = Math.floor(Math.random() * newCounter.nextAffluence);
        newCounter.affluence = {male, female: newCounter.nextAffluence - male};
        this.updateCounter(newCounter);
    }

    updateCounter(counter: PeopleCounter) {
        const updateCtxReq = {
            contextElements: [counter.getEntity()],
            updateAction: 'UPDATE'
        };
        this.http.post('http://localhost:8070/ngsi10' + '/updateContext', updateCtxReq).subscribe(data => {
            console.log(data);
        });
    }

    registerBoard(i) {
        this.http.post('http://localhost:8070/NGSI9/registerContext', {
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
        }, {headers: {'fiware-service': 'openiot', 'fiware-servicepath': '/'}}).subscribe(data => {
            console.log(data);
        });
    }

    randomizeAll() {
        this.dataSource.data.forEach(el => el.random = true);
    }

    ngOnDestroy(): void {
        this.destroyed.next();
    }
}

export class PeopleCounter {
    name: string;
    affluence: {
        male: number,
        female: number
    };
    nextCounter: string;
    nextAffluence: number;
    location: {
        lat: number,
        lon: number
    };
    random = false;

    constructor(id, male, female, lat, lon) {
        this.name = 'PeopleCounter.' + id;
        this.nextCounter = 'Waiting for FogFlow';
        this.nextAffluence = male + female;
        this.affluence = {male, female};
        this.location = {lat, lon};
    }

    getEntity() {
        return {
            entityId: {
                id: this.name,
                type: 'PeopleCounter',
                isPattern: false
            },
            attributes: [{
                name: 'count',
                type: 'integer',
                value: this.affluence.male + this.affluence.female
            }, {
                name: 'male',
                type: 'integer',
                value: this.affluence.male
            }, {
                name: 'female',
                type: 'integer',
                value: this.affluence.female
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

    publish(url, http: HttpClient) {


        /*.then((response) => {
            if (response.status === 200) {
                return response.data;
            } else {
                return null;
            }
        });*/
    }
}
