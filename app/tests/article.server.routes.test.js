'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Ticket = mongoose.model('Ticket'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, ticket;

/**
 * Ticket routes tests
 */
describe('Ticket CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new ticket
		user.save(function() {
			ticket = {
				title: 'Ticket Title',
				content: 'Ticket Content'
			};

			done();
		});
	});

	it('should be able to save an ticket if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new ticket
				agent.post('/tickets')
					.send(ticket)
					.expect(200)
					.end(function(ticketSaveErr, ticketSaveRes) {
						// Handle ticket save error
						if (ticketSaveErr) done(ticketSaveErr);

						// Get a list of tickets
						agent.get('/tickets')
							.end(function(ticketsGetErr, ticketsGetRes) {
								// Handle ticket save error
								if (ticketsGetErr) done(ticketsGetErr);

								// Get tickets list
								var tickets = ticketsGetRes.body;

								// Set assertions
								(tickets[0].user._id).should.equal(userId);
								(tickets[0].title).should.match('Ticket Title');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save an ticket if not logged in', function(done) {
		agent.post('/tickets')
			.send(ticket)
			.expect(401)
			.end(function(ticketSaveErr, ticketSaveRes) {
				// Call the assertion callback
				done(ticketSaveErr);
			});
	});

	it('should not be able to save an ticket if no title is provided', function(done) {
		// Invalidate title field
		ticket.title = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new ticket
				agent.post('/tickets')
					.send(ticket)
					.expect(400)
					.end(function(ticketSaveErr, ticketSaveRes) {
						// Set message assertion
						(ticketSaveRes.body.message).should.match('Title cannot be blank');
						
						// Handle ticket save error
						done(ticketSaveErr);
					});
			});
	});

	it('should be able to update an ticket if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new ticket
				agent.post('/tickets')
					.send(ticket)
					.expect(200)
					.end(function(ticketSaveErr, ticketSaveRes) {
						// Handle ticket save error
						if (ticketSaveErr) done(ticketSaveErr);

						// Update ticket title
						ticket.title = 'WHY YOU GOTTA BE SO MEAN?';

						// Update an existing ticket
						agent.put('/tickets/' + ticketSaveRes.body._id)
							.send(ticket)
							.expect(200)
							.end(function(ticketUpdateErr, ticketUpdateRes) {
								// Handle ticket update error
								if (ticketUpdateErr) done(ticketUpdateErr);

								// Set assertions
								(ticketUpdateRes.body._id).should.equal(ticketSaveRes.body._id);
								(ticketUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of tickets if not signed in', function(done) {
		// Create new ticket model instance
		var ticketObj = new Ticket(ticket);

		// Save the ticket
		ticketObj.save(function() {
			// Request tickets
			request(app).get('/tickets')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single ticket if not signed in', function(done) {
		// Create new ticket model instance
		var ticketObj = new Ticket(ticket);

		// Save the ticket
		ticketObj.save(function() {
			request(app).get('/tickets/' + ticketObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('title', ticket.title);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete an ticket if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new ticket
				agent.post('/tickets')
					.send(ticket)
					.expect(200)
					.end(function(ticketSaveErr, ticketSaveRes) {
						// Handle ticket save error
						if (ticketSaveErr) done(ticketSaveErr);

						// Delete an existing ticket
						agent.delete('/tickets/' + ticketSaveRes.body._id)
							.send(ticket)
							.expect(200)
							.end(function(ticketDeleteErr, ticketDeleteRes) {
								// Handle ticket error error
								if (ticketDeleteErr) done(ticketDeleteErr);

								// Set assertions
								(ticketDeleteRes.body._id).should.equal(ticketSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete an ticket if not signed in', function(done) {
		// Set ticket user 
		ticket.user = user;

		// Create new ticket model instance
		var ticketObj = new Ticket(ticket);

		// Save the ticket
		ticketObj.save(function() {
			// Try deleting ticket
			request(app).delete('/tickets/' + ticketObj._id)
			.expect(401)
			.end(function(ticketDeleteErr, ticketDeleteRes) {
				// Set message assertion
				(ticketDeleteRes.body.message).should.match('User is not logged in');

				// Handle ticket error error
				done(ticketDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Ticket.remove().exec();
		done();
	});
});