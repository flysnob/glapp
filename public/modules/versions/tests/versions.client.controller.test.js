'use strict';

(function() {
	// Versions Controller Spec
	describe('VersionsController', function() {
		// Initialize global variables
		var VersionsController,
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

			// Initialize the Versions controller.
			VersionsController = $controller('VersionsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one version object fetched from XHR', inject(function(Versions) {
			// Create sample version using the Versions service
			var sampleVersion = new Versions({
				title: 'An Version about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample versions array that includes the new version
			var sampleVersions = [sampleVersion];

			// Set GET response
			$httpBackend.expectGET('versions').respond(sampleVersions);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.versions).toEqualData(sampleVersions);
		}));

		it('$scope.findOne() should create an array with one version object fetched from XHR using a versionId URL parameter', inject(function(Versions) {
			// Define a sample version object
			var sampleVersion = new Versions({
				title: 'An Version about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.versionId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/versions\/([0-9a-fA-F]{24})$/).respond(sampleVersion);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.version).toEqualData(sampleVersion);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Versions) {
			// Create a sample version object
			var sampleVersionPostData = new Versions({
				title: 'An Version about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample version response
			var sampleVersionResponse = new Versions({
				_id: '525cf20451979dea2c000001',
				title: 'An Version about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Version about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('versions', sampleVersionPostData).respond(sampleVersionResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the version was created
			expect($location.path()).toBe('/versions/' + sampleVersionResponse._id);
		}));

		it('$scope.update() should update a valid version', inject(function(Versions) {
			// Define a sample version put data
			var sampleVersionPutData = new Versions({
				_id: '525cf20451979dea2c000001',
				title: 'An Version about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock version in scope
			scope.version = sampleVersionPutData;

			// Set PUT response
			$httpBackend.expectPUT(/versions\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/versions/' + sampleVersionPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid versionId and remove the version from the scope', inject(function(Versions) {
			// Create new version object
			var sampleVersion = new Versions({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new versions array and include the version
			scope.versions = [sampleVersion];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/versions\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleVersion);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.versions.length).toBe(0);
		}));
	});
}());