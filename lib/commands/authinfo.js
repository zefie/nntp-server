// https://tools.ietf.org/html/rfc4643
//
'use strict';


const status = require('../status');


const CMD_RE = /^AUTHINFO (.+) (.+)$/i;


module.exports = {
  head:     'AUTHINFO',
  validate: CMD_RE,

  run(session, cmd) {
	  var command = cmd.match(CMD_RE)[1].toUpperCase()
	  switch (command) {
		  case "USER":
			if (session.authenticated) return status._400_TEMP_UNAVAIL;

			if (!session.server.options.secure &&
				!session.secure) {
				return status._483_NOT_SECURE;
			}

			session.authinfo_user = cmd.match(CMD_RE)[2];

			return status._381_AUTH_NEED_PASS;
			break;
			
		  case "PASS":
		    if (session.authenticated) return status._400_TEMP_UNAVAIL;

			if (!session.authinfo_user) return status._482_AUTH_OUT_OF_SEQ;

			session.authinfo_pass = cmd.match(CMD_RE)[2];

			return session.server._authenticate(session)
				.then(success => {
				if (!success) {
					session.authinfo_user = null;
					session.authinfo_pass = null;
					return status._481_AUTH_REJECTED;
				}

				session.authenticated = true;
				return status._281_AUTH_ACCEPTED;
			});
			break;
			
		   default:
			 return status._400_TEMP_UNAVAIL
	  }
  },

  capability(session, report) {
    if (!session.authenticated &&
        (session.server.options.secure || session.secure)) {
      report.push([ 'AUTHINFO', 'USER' ]);
    }
  }
};
