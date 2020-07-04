const AbstractDevice = require('devices/AbstractDevice');
                                                     
                                                                     

const log = require('loglevel');

const STATUS_ENUM = Object.freeze({'idle':0,'working':1,'moving':2});
                                        

class Robot extends AbstractDevice{

    static nextId = 0;
    static profile                     ;
    position          ;
    jobProgression = 0;
    status = 0;

    constructor(initialStatus                  ,profile                     ) {
        super();
        Robot.profile = profile;
        if('number' == typeof initialStatus) this.status = initialStatus;
        else if(initialStatus) this.status = STATUS_ENUM[initialStatus] || 0;
        this.position = [profile.factory.location.latitude, profile.factory.location.longitude];
        this.id = Robot.nextId++;
    };

    getStatusString()        {
        for(let statusString in STATUS_ENUM)
            if(STATUS_ENUM[statusString] === this.status)
                return statusString;
        throw 'Unexpected status index: '+this.status;

    }

    getPosition()          {
        return {
            latitude: this.position[0],
            longitude: this.position[1]
        }
    }

    update()      {
        switch (this.status) {
            case STATUS_ENUM.moving: this._move(); break;
            case STATUS_ENUM.idle: this._idle(); break;
            case STATUS_ENUM.working: this._work(); break;
        }
    }

    getEntity()              {
        return {
            entityId: this.getEntityId(),
            attributes: {
                status: {
                    type: 'string',
                    value: this.getStatusString()
                },
                position: {
                    type: 'point',
                    value: this.getPosition()
                },
                factory: {
                    type: 'string',
                    value: Robot.profile.factory.id
                }
            },
            metadata: {
                location: {
                    type: 'point',
                    value: Robot.profile.factory.location
                },
                factory: {
                    type: 'string',
                    value: Robot.profile.factory.id
                },
                time: {
                    type: 'number',
                    value: Date.now()
                }
            }
        };
    }

    _updateStatus(){
        if(Math.random()<Robot.profile.robot.status_change_chance) {
            const keys = Object.keys(STATUS_ENUM);
            this.status = STATUS_ENUM[keys[Math.floor(Math.random() * keys.length)]];
            log.info('Status changed to '+ this.getStatusString())
        }
    };

    _move(){
        const movingDirection = Math.floor(Math.random()*this.position.length);
        const speed = Robot.profile.robot.moving_speed;
        let movingSign;
        const sizes = Robot.profile.factory.size;

        if(this.position[movingDirection] + speed > sizes[movingDirection]) movingSign = -1;
        else if(this.position[movingDirection] - speed < 0) movingSign = 1;
        else movingSign = Math.sign(Math.random()-.5); //Eventually this variable will be 0, which will make the movement to be skipped. This will not cause other issues and has an almost null probability to happen

        this.position[movingDirection] += (speed * movingSign);

        log.info('Moved to ' + this.position.toString());

        this._updateStatus();
    };

    _work (){
        this.jobProgression += Robot.profile.robot.working_speed;
        if(this.jobProgression >= Robot.profile.robot.job_size) {
            this.jobProgression = 0;
            this._updateStatus();
        }
        log.info('Working progression: '+this.jobProgression);
    };

    _idle(){
        this._updateStatus();
    }
}

Robot.prototype.type = 'Robot';
module.exports = Robot;