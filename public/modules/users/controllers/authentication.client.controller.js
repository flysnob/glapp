'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'vcRecaptchaService',
	function($scope, $http, $location, Authentication, vcRecaptchaService) {
		$scope.authentication = Authentication;
		$scope.response = null;
        $scope.widgetId = null;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.model = {
            key: '6LfTogoTAAAAALwBT4dpOZSCtUO9dmLayA86yYMw'
        };
        $scope.showSubmit = false;
        $scope.setResponse = function (response) {
            console.info('Response available');
            console.log(response);
            $scope.response = response;
            $scope.showSubmit = true;
        };
        $scope.setWidgetId = function (widgetId) {
            console.info('Created widget ID: %s', widgetId);
            $scope.widgetId = widgetId;
        };
        $scope.cbExpiration = function() {
            console.info('Captcha expired. Resetting response object');
            $scope.response = null;
         };
        $scope.submit = function () {
            console.log('sending the captcha response to the server', $scope.response);
            $http.post('/auth/recaptcha', {response: $scope.response}).success(function(response) {
            	response = angular.fromJson(response);
                console.log('Success');
            	console.log(response);
                console.log(response.success);
                console.log(typeof response.success);
            	$scope.recaptchaDetails = null;
                if (response.success === true) {
                    $scope.signup();
                } else {
                    vcRecaptchaService.reload($scope.widgetId);
                }
            }).error(function(response) {
				console.log('Failed validation');
                // In case of a failed validation you need to reload the captcha
                // because each response can be checked just once
                vcRecaptchaService.reload($scope.widgetId);
			});
        };
	}
]);