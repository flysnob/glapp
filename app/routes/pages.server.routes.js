'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	pages = require('../../app/controllers/pages.server.controller');

module.exports = function(app) {
	// Page Routes
	app.route('/pages')
		.get(pages.list)
		.post(users.requiresLogin, pages.create);

	app.route('/pages/:pageId')
		.get(pages.read)
		.put(users.requiresLogin, pages.hasAuthorization, pages.update)
		.delete(users.requiresLogin, pages.hasAuthorization, pages.delete);

	// Finish by binding the page middleware
	app.param('pageId', pages.pageByID);
};