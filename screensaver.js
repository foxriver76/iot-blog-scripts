/*
    Screensaver
    
    Switch to defined screensaver view, if no mousemovement or 
    click event detected for the defined seconds
*/
let screensaverView = 'screensaver';
let prevScreensaverView = 'home';
let screensaverSeconds = 120;
let debounce;

let activateScreensaver = function () {
    screensaverTimeout = null;
    if (vis.activeView !== screensaverView) {
        // screensaver not active yet
        console.log('Enabled screensaver');
        prevScreensaverView = vis.activeView;
        vis.changeView(screensaverView);
    }
};

let handleScreensaverEvents = function () {
    if (debounce) {
        return;
    }
    
    // debounce mousemove/touchmove events
    debounce = setTimeout(function () {
        debounce = null;
    }, 500);

    // clear timer if already running
    if (screensaverTimeout) {
        clearTimeout(screensaverTimeout);
    }
    
    if (screensaverView === vis.activeView) {
        // screensaver active and clicked -> disable
        console.log('Disable screensaver');
        vis.changeView(prevScreensaverView);
    }
    
    // restart timer
    screensaverTimeout = setTimeout(activateScreensaver, screensaverSeconds * 1000);
};

let screensaverTimeout = setTimeout(activateScreensaver, screensaverSeconds * 1000);

document.addEventListener('click', handleScreensaverEvents);
document.body.addEventListener('mousemove', handleScreensaverEvents);
document.addEventListener('touchmove', handleScreensaverEvents);
