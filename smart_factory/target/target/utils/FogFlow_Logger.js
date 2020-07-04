//      
const {log, LogLevel} = require('loglevel');

class FogFlow_Logger {

    publish          ;
    caller        ;
    level        ;
    stringSeparator=',';
    levels          ;

    constructor(caller       , publish          ) {
        this.publish = publish;
        this.caller = caller;
    }

    setLevel(level       )      {
        this.level = level;
    }

    getLevel(){
        return this.level;
    }

    setDefaultLevel(level       )      {
        FogFlow_Logger.prototype.level = level;
    }

    getDefaultLevel(){
        return FogFlow_Logger.prototype.level;
    }

    setStringSeparator(separator       )      {
        this.stringSeparator = separator;
    }

    setDefaultStringSeparator(separator       )      {
        FogFlow_Logger.prototype.stringSeparator = separator;
    }

    trace(...message       )      {
        evaluateAndPublish(this,log.levels.TRACE,message);
    }

    debug(...message       )      {
        evaluateAndPublish(this,log.levels.DEBUG,message);
    }

    info(...message       )      {
        evaluateAndPublish(this,log.levels.INFO,message);
    }

    warn(...message       )      {
        evaluateAndPublish(this,log.levels.WARN,message);
    }

    error(...message       )      {
        evaluateAndPublish(this,log.levels.ERROR,message);
    }

    static levelToString(level       )             {
        const LEVELS = log.levels;
        switch (level) {
            case LEVELS.TRACE:
                return 'trace';
            case LEVELS.DEBUG:
                return 'debug';
            case LEVELS.INFO:
                return 'info';
            case LEVELS.WARN:
                return 'warn';
            case LEVELS.ERROR:
                return 'error';
            case LEVELS.SILENT:
                return 'silent';
        }
        throw 'invalid level: '+level;
    }

    static levelToNumber(level       )         {
        const LEVELS = log.levels;
        switch (level) {
            case 'trace':
                return LEVELS.TRACE;
            case 'debug':
                return LEVELS.DEBUG;
            case 'info' :
                return LEVELS.INFO;
            case 'warn' :
                return LEVELS.WARN;
            case 'error' :
                return LEVELS.ERROR;
            case 'silent' :
                return LEVELS.SILENT;
        }
        throw 'invalid level: '+level;
    }
}

function evaluateAndPublish(instance               ,level        ,...message       )      {
    if(instance.level<level){
        const stringMsg = message.join(instance.stringSeparator);
        log.trace(instance.caller,stringMsg);
        instance.publish({
            entityID: {
                id: 'log.' + level + instance.caller + Date.now(),
                type: 'log',
                isPattern: false
            },
            attributes: {
                message: {
                    type: 'string',
                    value: message
                }
            }
        });
    }
}


FogFlow_Logger.prototype.level = log.levels.INFO;
FogFlow_Logger.prototype.stringSeparator = ',';
FogFlow_Logger.prototype.levels = log.levels;

module.exports = {FogFlow_Logger};