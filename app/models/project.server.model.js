'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Project Schema
 */
var ProjectSchema = new Schema({
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
	description: {
		type: String,
		default: '',
		trim: true
	},
	entity: {
		type: String,
		default: '',
		trim: true
	},
	subject: {
		type: Schema.Types.Mixed,
		default: '',
		required: 'Please make a selection.'
	},
	version: {
		type: Schema.Types.Mixed,
		default: '',
		required: 'Please make a selection.'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Project', ProjectSchema);
