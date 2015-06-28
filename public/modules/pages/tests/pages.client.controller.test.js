'use strict';

(function() {
	// Pages Controller Spec
	describe('PagesController', function() {
		// Initialize global variables
		var PagesController,
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

			// Initialize the Pages controller.
			PagesController = $controller('PagesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one page object fetched from XHR', inject(function(Pages) {
			// Create sample page using the Pages service
			var samplePage = new Pages({
				title: 'An Page about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample pages array that includes the new page
			var samplePages = [samplePage];

			// Set GET response
			$httpBackend.expectGET('pages').respond(samplePages);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.pages).toEqualData(samplePages);
		}));

		it('$scope.findOne() should create an array with one page object fetched from XHR using a pageId URL parameter', inject(function(Pages) {
			// Define a sample page object
			var samplePage = new Pages({
				title: 'An Page about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.pageId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/pages\/([0-9a-fA-F]{24})$/).respond(samplePage);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.page).toEqualData(samplePage);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Pages) {
			// Create a sample page object
			var samplePagePostData = new Pages({
				title: 'An Page about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample page response
			var samplePageResponse = new Pages({
				_id: '525cf20451979dea2c000001',
				title: 'An Page about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Page about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('pages', samplePagePostData).respond(samplePageResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the page was created
			expect($location.path()).toBe('/pages/' + samplePageResponse._id);
		}));

		it('$scope.update() should update a valid page', inject(function(Pages) {
			// Define a sample page put data
			var samplePagePutData = new Pages({
				_id: '525cf20451979dea2c000001',
				title: 'An Page about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock page in scope
			scope.page = samplePagePutData;

			// Set PUT response
			$httpBackend.expectPUT(/pages\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/pages/' + samplePagePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid pageId and remove the page from the scope', inject(function(Pages) {
			// Create new page object
			var samplePage = new Pages({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new pages array and include the page
			scope.pages = [samplePage];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/pages\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(samplePage);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.pages.length).toBe(0);
		}));
	});
}());