//  Debian Package Notification Script
/*
*   @author Moritz Heusinger <moritz.heusinger@gmail.com>
*   The script checks for apt upgrades, everyday at 06:00 p.m., if there are  new
*   upgrades available it will send an E-Mail to the configured receiverMail.
*
*   logging:        if true, information will be logged
*   senderMail:     mail address of the sender
*   receiverMail:   target mail address
*/

const logging = true;

const senderMail = 'moritz-iobroker@web.de';
const receiverMail = 'moritz.heusinger@gmail.com';

createState('javascript.0.system.debianUpgradeable', {
    type: 'string',
    write: true,
    read: true
});

    exec('apt update >/dev/null || sudo apt update >/dev/null && apt list --upgradeable', (err, stdout, stderr) => {
        let upgradeable = stdout.split('...')[1];
        if (logging) log('Checking for updates via apt ...', 'info');
        if (stderr && !stdout) return log(`Error checking for updates via apt: ${stderr}`, `error`);
        if (upgradeable.length <= 8) upgradeable = null;
        if (upgradeable) {
            let upgradeableArrayString = JSON.stringify(upgradeable.split('\n').filter(element => element !== ''));
            if(getState('javascript.0.system.debianUpgradeable').val !== upgradeableArrayString) {
                setState('javascript.0.system.debianUpgradeable', upgradeableArrayString, true);
                if(logging) log('The following upgrades are available:\n' + upgradeable, 'info');
                 sendTo('email', {
                        from:    senderMail,
                        to:      receiverMail,
                        subject: 'Es sind neue Updates für deinen Rock64 verfügbar',
                        text:    `Die folgenden Updates sind verfügbar:\n ${upgradeable}`
                 });
            } else {
                if (logging) log('There are available dbpkg updates, but non of them are new.', 'info');
            } // endElse
        } else {
            if(logging) log('No new updates available', 'info');
            setState('javascript.0.system.debianUpgradeable', '[]', true);
        } // endElse
    });
