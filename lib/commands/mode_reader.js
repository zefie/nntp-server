// https://tools.ietf.org/html/rfc3977#section-3.4.2
//
// Just a stub to not return errors on "MODE READER"
//
'use strict';


const status = require('../status');


module.exports = {
  head:     'MODE READER',
  validate: /^MODE READER$/i,

  run(session) {
    return (session.server.options.allow_posting) ? status._200_SRV_READY_RW : status._201_SRV_READY_RO;
  },

  capability(session, report) {
    report.push('READER');
  }
};
