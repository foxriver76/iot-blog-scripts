//  Program Ventilate Bedroom Check
/*
*   @author Moritz Heusinger <moritz.heusinger@gmail.com>
*   The program checks the absolute humidity of an inside room and outside.
*   If the difference is above a specified threshold, a ventilation recommendation
*   is set as state. The absolute humidity values are set as state too.
*   The script also contains a datapoint, which triggers speech output of the
*   last used Amazon Alexa device.
*/

createState('javascript.0.sleepingRoom.absoluteHumidity', {
   type: 'number',
   read: true,
   write: true,
   unit: 'g/m^3'
});

createState('javascript.0.garden.absoluteHumidity', {
   type: 'number',
   read: true,
   write: true,
   unit: 'g/m^3'
});

createState('javascript.0.sleepingRoom.ventilationRecommendation', {
   type: 'boolean',
   read: true,
   write: true
});

createState('javascript.0.alexaTriggerLuftfeuchtigkeit', {
    type: 'boolean',
    read: true,
    write: true
});

const logging = true;

on({id: 'javascript.0.alexaTriggerLuftfeuchtigkeit', change: 'any'}, obj => {
    
    if (logging) log('Alexa ventilation check triggered', 'info');
    
    const ventilate = getState('javascript.0.sleepingRoom.ventilationRecommendation').val;
    const randomState = getRandomArbitrary(1, 2);
    let text;
    
    if(ventilate) {
        switch (randomState) {
            case 1:
                text = 'Du solltest lüften, da es draußen trockener ist';
                break;
            case 2:
                text = 'Lüfte, es ist so feucht hier drin';
                break;
        } // endSwitch
    } else {
        switch (randomState) {
            case 1:
                text = 'Du solltest nicht lüften';
                break;
            case 2:
                text = 'Bitte nicht lüften';
                break;
        } // endSwitch
    } // endElse
    
    // Get serial number of last used echo device -> timeout maybe unnecessary with new adapter version
    setTimeout(() => {
        const serialNumber = getState('alexa2.0.History.serialNumber').val;
        setState('alexa2.0.Echo-Devices.' + serialNumber + '.Commands.speak', text, false);
    }, 300);
});

on({id: 'ID_OF_OUTSIDE_HUMIDITY_DATAPOINT', change: 'any'}, obj => {
    if (logging) log('Triggered ventilation recommendation script', 'info');
    // Get inside and outside humidity and temperature
    const relHumidityOutdside = getState('ID_OF_OUTSIDE_HUMIDITY_DATAPOINT').val;
    const temperatureOutside = getState('ID_OF_OUTSIDE_TEMP_DATAPOINT').val;
    const relHumidityInside = getState('ID_OF_INSIDE_HUMIDITY_DATAPOINT').val;
    const temperatureInside = getState('ID_OF_INSIDE_TEMP_DATAPOINT').val;
    // Calc ventilation recommendation and absolute humidity inside and outside
    const jsonRes = ventilateRoom(relHumidityInside, temperatureInside, relHumidityOutdside, temperatureOutside, threshold=2.0);
    // Set states
    setState('javascript.0.sleepingRoom.absoluteHumidity', jsonRes.insideAbsoluteHumidity, true);
    setState('javascript.0.garden.absoluteHumidity', jsonRes.outsideAbsoluteHumidity, true);
    setState('javascript.0.sleepingRoom.ventilationRecommendation', jsonRes.ventilate, true);
});

/* Internals */

function calcAbsoluteHumidity(relHumidity, temperature) {
    const res = ((6.112 * Math.pow(Math.E, ((17.67 * temperature) / (temperature + 243.5))) * relHumidity * 2.1674)) / (273.15 + temperature);
    return Math.round(res * 100) / 100;
} // endCalcAbsoluteHumidity

function ventilateRoom(relHumidityInside, tempInside, relHumidityOutside, tempOutside, threshold=2.0) {
    const res = {};
    res.insideAbsoluteHumidity = calcAbsoluteHumidity(relHumidityInside, tempInside);
    res.outsideAbsoluteHumidity = calcAbsoluteHumidity(relHumidityOutside, tempOutside);
    res.diff = Math.round((res.insideAbsoluteHumidity - res.outsideAbsoluteHumidity) * 100) / 100;
    
    if (res.diff > threshold)
        res.ventilate = true;
    else 
        res.ventilate = false;
    return res;
} // endVentilateRoom

function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * ((max + 0.4) - (min - 0.4)) + (min - 0.4));
} // endGetRandomArbitrary
