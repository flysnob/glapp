'use strict';

(function() {
	// Questions Controller Spec
	describe('Questions Controller Tests', function() {
		// Initialize global variables
		var QuestionsController,
			scope,
			$httpBackend,
			$stateParams,
			$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Questions controller.
			QuestionsController = $controller('QuestionsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one question object fetched from XHR', inject(function(Questions) {
			// Create sample question using the Questions service
			var sampleQuestion = new Questions({
				title: 'An Question about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample questions array that includes the new question
			var sampleQuestions = [sampleQuestion];

			// Set GET response
			$httpBackend.expectGET('questions').respond(sampleQuestions);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.questions).toEqualData(sampleQuestions);
		}));

		it('$scope.findOne() should create an array with one question object fetched from XHR using a questionId URL parameter', inject(function(Questions) {
			// Define a sample question object
			var sampleQuestion = new Questions({
				title: 'An Question about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.questionId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/questions\/([0-9a-fA-F]{24})$/).respond(sampleQuestion);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.question).toEqualData(sampleQuestion);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Questions) {
			// Create a sample question object
			var sampleQuestionPostData = new Questions({
				title: 'An Question about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample question response
			var sampleQuestionResponse = new Questions({
				_id: '525cf20451979dea2c000001',
				title: 'An Question about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Question about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('questions', sampleQuestionPostData).respond(sampleQuestionResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the question was created
			expect($location.path()).toBe('/questions/' + sampleQuestionResponse._id);
		}));

		it('$scope.update() should update a valid question', inject(function(Questions) {
			// Define a sample question put data
			var sampleQuestionPutData = new Questions({
				_id: '525cf20451979dea2c000001',
				title: 'An Question about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock question in scope
			scope.question = sampleQuestionPutData;

			// Set PUT response
			$httpBackend.expectPUT(/questions\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/questions/' + sampleQuestionPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid questionId and remove the question from the scope', inject(function(Questions) {
			// Create new question object
			var sampleQuestion = new Questions({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new questions array and include the question
			scope.questions = [sampleQuestion];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/questions\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleQuestion);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.questions.length).toBe(0);
		}));
	});
}());