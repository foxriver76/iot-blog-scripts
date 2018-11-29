//  Adapter Update Notification Script
/*
*   @author Moritz Heusinger <moritz.heusinger@gmail.com>
*   The scripts checks for adapter upgrades, everyday at 06:00 p.m., if there 
*   are upgrades available it will send an E-Mail to the configured receiverMail.
*
*   Requirement: Running instance of the E-Mail adapter; Admin >= 3.6
*
*   logging:        if true, information will be logged
*   senderMail:     mail address of the sender
*   receiverMail:   target mail address
*/

const logging = true;

const senderMail = 'john.doe@femail.com';
const receiverMail = 'jane.doe@mail.com';

on({id: 'admin.0.info.updatesJson', ack: true, change: 'ne'}, (obj) => {
    if(!getState('admin.0.info.newUpdates').val) return;
    if (logging) log('New adapter updates are available', 'info');
    let upgradeable = JSON.parse(obj.state.val);
    let text = 'Die folgenden Adapter sind aktualisierbar:\n';
    for (let adapter in upgradeable) {
        text += 'Adapter ' + JSON.stringify(adapter) + ' kann von ' + 
            upgradeable[adapter].installedVersion + ' auf ' + 
            upgradeable[adapter].availableVersion + ' aktualisiert werden.\n';
    } // endFor
    sendTo('email', {
            from:    senderMail,
            to:      receiverMail,
            subject: 'Es sind neue Adapter Updates für deinen Rock64 verfügbar',
            text:    text
    });
});
