// https://tools.ietf.org/html/rfc3977#section-7.1
//
'use strict';


const status     = require('../status');
const CMD_RE = /^NEXT$/i;


module.exports = {
  head:     'NEXT',
  validate: CMD_RE,

  run(session) {
	let nextArticle = session.server._getNext(session);	
	if (typeof nextArticle === 'string') {
		if (Object.entries(status).find((e) => e = nextArticle)) return nextArticle; // raw response
		else return status._421_NO_NEXT_ARTICLE; // unknown response
	} else {
		if (!nextArticle) return status._421_NO_NEXT_ARTICLE; // null response
		if ((!nextArticle.articleNumber  && !nextArticle.articleNumber !== 0) || !nextArticle.message_id) return status._421_NO_NEXT_ARTICLE; // missing response
		return `${status._223_ARTICLE_EXISTS} ${nextArticle.articleNumber} ${nextArticle.message_id}`;
	}	
  }
};
