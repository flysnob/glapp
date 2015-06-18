'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Question Schema
 */
var QuestionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	questionId: {
		type: String,
		default: '',
		required: 'Question ID cannot be blank'
	},
	sort: {
		type: Number,
		default: ''
	},
	question: {
		type: String,
		default: '',
		trim: true,
		required: 'Question cannot be blank'
	},
	type: {
		type: String,
		default: '',
		trim: true
	},
	subject: {
		type: String,
		default: '',
		trim: true
	},
	summary: {
		type: String,
		default: '',
		trim: true
	},
	reportSummary: {
		type: String,
		default: '',
		trim: true
	},
	help: {
		type: String,
		default: '',
		trim: true
	},
	faq: {
		type: String,
		default: '',
		trim: true
	},
	asc: {
		type: String,
		default: '',
		trim: true
	},
	examples: {
		type: String,
		default: '',
		trim: true
	},
	conclusion_1: {
		type: String,
		default: '',
		trim: true
	},
	conclusion_2: {
		type: String,
		default: '',
		trim: true
	},
	conclusion_3: {
		type: String,
		default: '',
		trim: true
	},
	failResponse: {
		type: String,
		default: '',
		trim: true
	},
	decisionNodeId: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Question', QuestionSchema);
