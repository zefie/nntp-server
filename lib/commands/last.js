// https://tools.ietf.org/html/rfc3977#section-7.1
//
'use strict';


const status     = require('../status');
const CMD_RE = /^LAST$/i;


module.exports = {
  head:     'LAST',
  validate: CMD_RE,

  run(session) {
	let lastArticle = session.server._getLast(session);
	if (typeof lastArticle === 'string') {
		if (Object.entries(status).find((e) => e = lastArticle)) return lastArticle; // raw response
		else return status._422_NO_LAST_ARTICLE; // unknown response
	} else {
		if (!lastArticle) return status._422_NO_LAST_ARTICLE; // null response
		if ((!lastArticle.articleNumber  && !lastArticle.articleNumber !== 0)|| !lastArticle.message_id) return status._422_NO_LAST_ARTICLE; // missing response
		return `${status._223_ARTICLE_EXISTS} ${lastArticle.articleNumber} ${lastArticle.message_id}`;
	}	
  }
};
