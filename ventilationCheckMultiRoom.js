//  Program Ventilate Bedroom Check
/*
*   @author Moritz Heusinger <moritz.heusinger@gmail.com>
*   The program checks the absolute humidity of an inside room and outside.
*   If the difference is above a specified threshold, a ventilation recommendation
*   is set as state. The absolute humidity values are set as state too.
*   The script also contains a datapoint, which triggers speech output of the
*   last used Amazon Alexa device.
*
*   Require: Instance of Alexa2 Adapter
*
*   Create your rooms in the rooms array with a name and the states which contain the desired values.
*   Humidity Threshold is used to only give a ventilate claculation if outside absolute humidity - the
*   threshold is less than inside absolute humidity. Min Humidity is used to make sure that you only get a 
*   ventilation recommendation, if the relative inside humidity is above the min value.
*   Also configure javascript instance if it differs from 0.
*/

const logging = true;
const javaScriptInstance = 0;
const rooms = [
    {
        roomName: `sleepingRoom`,
        outsideHumidityState: `hm-rpc.1.000ED8A9909A27.1.HUMIDITY`,
        outsideTemperatureState: `hm-rpc.1.000ED8A9909A27.1.ACTUAL_TEMPERATURE`,
        insideHumidityState: `hm-rpc.1.000A98A98A8FD7.1.HUMIDITY`,
        insideTemperatureState: `hm-rpc.1.000A98A98A8FD7.1.ACTUAL_TEMPERATURE`,
        humidityThreshold: 2,
        minHumidity: 45
    }
];

const triggersInsideHumidity = [];
const triggersAlexa = [];

for (const room of rooms) {
    createState(`${room.roomName}.absoluteHumidity`, {
        type: `number`,
        read: true,
        write: false,
        unit: `g/m^3`,
        name: `${room.roomName} Absolute Feuchtigkeit`
    });

    createState(`${room.roomName}.outsideAbsoluteHumidity`, {
        type: `number`,
        read: true,
        write: false,
        unit: `g/m^3`,
        name: `${room.roomName} Absolute Feuchtigkeit Außen`
    });

    createState(`${room.roomName}.ventilationRecommendation`, {
        type: `boolean`,
        read: true,
        write: false,
        name: `${room.roomName} Lüftungsempfehlung`
    });

    createState(`${room.roomName}.alexaTriggerLuftfeuchtigkeit`, {
        type: `boolean`,
        read: true,
        write: true,
        role: `button`,
        name: `${room.roomName} Alexa Trigger Luftfeuchtigkeit`,
        smartName: {
            de: `${room.roomName} Alexa Trigger Luftfeuchtigkeit`
        }
    });

    triggersAlexa.push(`javascript.${javaScriptInstance}.${room.roomName}.alexaTriggerLuftfeuchtigkeit`);
    triggersInsideHumidity.push(room.insideHumidityState);
} // endFor

on({id: triggersAlexa, change: `any`}, obj => {
    if (logging) log(`Alexa ventilation check triggered`, `info`);
    const room = rooms[triggersAlexa.indexOf(obj.id)];
    const ventilate = getState(`${room.roomName}.ventilationRecommendation`).val;
    const randomState = getRandomArbitrary(1, 2);
    let text;
    
    if(ventilate) {
        switch (randomState) {
            case 1:
                text = `Du solltest lüften, da es draußen trockener ist`;
                break;
            case 2:
                text = `Lüfte, es ist so feucht hier drin`;
                break;
        } // endSwitch
    } else {
        switch (randomState) {
            case 1:
                text = `Du solltest nicht lüften`;
                break;
            case 2:
                text = `Bitte nicht lüften`;
                break;
        } // endSwitch
    } // endElse
    
    // Get serial number of last used echo device, maybe timeout is unnecessary with new adapter version
    setTimeout(() => {
        const serialNumber = getState(`alexa2.0.History.serialNumber`).val;
        setState(`alexa2.0.Echo-Devices.${serialNumber}.Commands.speak`, text, false);
    }, 300);
});

on({id: triggersInsideHumidity, change: `any`}, obj => {
    const room = rooms[triggersInsideHumidity.indexOf(obj.id)];
    // Get inside and outside humidity and temperature
    const relHumidityOutdside = getState(room.outsideHumidityState).val;
    const temperatureOutside = getState(room.outsideTemperatureState).val;
    const relHumidityInside = getState(room.insideHumidityState).val;
    const temperatureInside = getState(room.insideTemperatureState).val;
    // Calc ventilation recommendation and absolute humidity inside and outside
    const jsonRes = ventilateRoom(relHumidityInside, temperatureInside, relHumidityOutdside, 
                        temperatureOutside, room.humidityThreshold, room.minHumidity);
    // Set states
    setState(`${room.roomName}.absoluteHumidity`, jsonRes.insideAbsoluteHumidity, true);
    setState(`${room.roomName}.outsideAbsoluteHumidity`, jsonRes.outsideAbsoluteHumidity, true);
    setState(`${room.roomName}.ventilationRecommendation`, jsonRes.ventilate, true);
});

/* Internals */

function calcAbsoluteHumidity(relHumidity, temperature) {
    const res = ((6.112 * Math.pow(Math.E, ((17.67 * temperature) / (temperature + 243.5))) * relHumidity * 2.1674)) / (273.15 + temperature);
    return Math.round(res * 100) / 100;
} // endCalcAbsoluteHumidity

function ventilateRoom(relHumidityInside, tempInside, relHumidityOutside, tempOutside, 
                threshold=2.0, minHumidity=50.0) {
    const res = {};
    res.insideAbsoluteHumidity = calcAbsoluteHumidity(relHumidityInside, tempInside);
    res.outsideAbsoluteHumidity = calcAbsoluteHumidity(relHumidityOutside, tempOutside);
    res.diff = Math.round((res.insideAbsoluteHumidity - res.outsideAbsoluteHumidity) * 100) / 100;
    
    if (res.diff > threshold && relHumidityInside > minHumidity)
        res.ventilate = true;
    else 
        res.ventilate = false;
    return res;
} // endVentilateRoom

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * ((max + 0.4) - (min - 0.4)) + (min - 0.4));
} // endGetRandomArbitrary
