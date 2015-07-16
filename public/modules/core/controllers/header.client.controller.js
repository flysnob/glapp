'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;

		$scope.admin = false;

		angular.forEach($scope.authentication.user.roles, function(role, key){
			console.log(role);
			if (role === 'admin'){
				$scope.admin = true;
			}
			$scope.isCollapsed = false;
			$scope.menu = Menus.getMenu('topbar');
		});

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);