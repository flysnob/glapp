'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Version Schema
 */
var VersionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	versionId: {
		type: String,
		default: '',
		trim: true
	},
	versionCode: {
		type: String,
		default: '',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	subject: {
		type: String,
		default: '',
		trim: true
	},
	effective: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	decisionMethod: {
		type: String,
		default: '',
		trim: true
	},
	versionJson: {
		type: Schema.Types.Mixed,
		default: '',
		required: 'Version JSON required.'
	},
	testJson: {
		type: Schema.Types.Mixed,
		default: ''
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Version', VersionSchema);
