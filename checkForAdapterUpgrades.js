//  Adapter Update Notification Script
/*
*   @author Moritz Heusinger <moritz.heusinger@gmail.com>
*   The scripts checks for adapter upgrades, everyday at 06:00 p.m., if there 
*   are upgrades available it will send an E-Mail to the configured receiverMail.
*
*   Requirement: Running instance of the E-Mail adapter
*
*   logging:        if true, information will be logged
*   senderMail:     mail address of the sender
*   receiverMail:   target mail address
*/

const logging = true;

const senderMail = 'john.doe@femail.com';
const receiverMail = 'jane.doe@mail.com';

schedule('0 18 * * *', () => {
    exec('iobroker update | grep Updateable', (err, stdout, stderr) => {
        if(logging) log('Checking for adapter updates ', 'info');
        if(stdout) {
            if(logging) log('The following adapter upgrades are available:\n' + stdout, 'info');
             sendTo('email', {
                    from:    senderMail,
                    to:      receiverMail,
                    subject: 'Es sind neue Adapter Updates für deinen Rock64 verfügbar',
                    text:    'Die folgenden Adapter sind aktualisierbar:\n' + stdout
             });
        } else if(logging) log('No new adapter updates available', 'info'); // endIf
    });
});
