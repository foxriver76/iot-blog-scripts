//  Debian Package Notification Script
/*
*   @author Moritz Heusinger <moritz.heusinger@gmail.com>
*   The scripts checks for apt upgrades, everyday at 06:00 p.m., if there are upgrades
*   available it will send an E-Mail to the configured receiverMail.
*
*   Requirement: An active instance of the Mail adapter
*
*   logging:        if true, information will be logged
*   senderMail:     mail address of the sender
*   receiverMail:   target mail address
*/

const logging = true;

const senderMail = 'john.doe@femail.com';
const receiverMail = 'jane.doe@mail.com';

schedule('0 18 * * *', () => {
    exec('apt update >/dev/null && apt list --upgradeable', (err, stdout, stderr) => {
        let upgradeable = stdout.split('...')[1];
        if(upgradeable.length <= 8) upgradeable = null; 
        if(logging) log('Checking for updates via apt ...', 'info');
        if(upgradeable) {
            if(logging) log('The following upgrades are available:\n' + upgradeable, 'info');
             sendTo('email', {
                    from:    senderMail,
                    to:      receiverMail,
                    subject: 'Es sind neue Updates für deinen Rock64 verfügbar',
                    text:    'Die folgenden Updates sind verfügbar:\n' + upgradeable
             });
        } else if(logging) log('No new updates available', 'info');
    });
});
