'use strict';

// Configuring the Versions module
angular.module('versions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Versions', 'versions', 'dropdown', '/versions(/create)?');
		//Menus.addSubMenuItem('topbar', 'versions', 'List Versions', 'versions');
		//Menus.addSubMenuItem('topbar', 'versions', 'New Version', 'versions/create');
	}
]);