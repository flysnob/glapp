'use strict';

angular.module('pages').controller('PagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Pages',
	function($scope, $stateParams, $location, Authentication, Pages) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var page = new Pages({
				title: this.title,
				content: this.content,
				url: this.url
			});
			page.$save(function(response) {
				$location.path('pages/' + page.url);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(page) {
			if (page) {
				page.$remove();

				for (var i in $scope.pages) {
					if ($scope.pages[i] === page) {
						$scope.pages.splice(i, 1);
					}
				}
			} else {
				$scope.page.$remove(function() {
					$location.path('pages');
				});
			}
		};

		$scope.update = function() {
			console.log($scope.page);
			var page = $scope.page;

			page.$update(function() {
				$location.path('pages/' + page.url);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.pages = Pages.query();
		};

		$scope.findOne = function() {
			console.log($stateParams.pageId);
			Pages.get({
				pageId: $stateParams.pageId
			}).$promise.then(function(page){
			
				console.log(page);
				$scope.page = page;

			});
		};
	}
]);