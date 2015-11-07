'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Issue Schema
 */
var IssueSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	content: {
		type: String,
		default: '',
		trim: true
	},
	type: {
		type: String,
		default: '',
		trim: true
	},
	nodeId: {
		type: String,
		default: '',
		trim: true
	},
	subjectCode: {
		type: String,
		default: '',
		trim: true
	},
	shortId: {
		type: String,
		default: '',
		trim: true
	},
	permission: {
		type: String,
		default: '',
		trim: true
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	closedDate: {
		type: Date
	},
	closedBy: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Issue', IssueSchema);