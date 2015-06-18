'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	comments = require('../../app/controllers/comments.server.controller');

module.exports = function(app) {
	// Comment Routes
	app.route('/comments')
		.get(comments.list)
		.post(users.requiresLogin, comments.create);

	app.route('/comments/:commentId')
		.get(comments.read)
		.put(users.requiresLogin, comments.hasAuthorization, comments.update)
		.delete(users.requiresLogin, comments.hasAuthorization, comments.delete);

	// Finish by binding the comment middleware
	app.param('commentId', comments.commentByID);
};