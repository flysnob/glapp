'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Subject Schema
 */
var SubjectSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	name: {
		type: String,
		default: '',
		trim: true,
		required: 'Name cannot be blank'
	},
	subjectType: {
		type: String,
		default: '',
		trim: true
	},
	prefix: {
		type: String,
		default: '',
		trim: true,
		required: 'Prefix cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	subjectCode: {
		type: String,
		default: '',
		trim: true
	},
	subjectStartNode: {
		type: String,
		default: '',
		trim: true
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	testStatus: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Subject', SubjectSchema);
