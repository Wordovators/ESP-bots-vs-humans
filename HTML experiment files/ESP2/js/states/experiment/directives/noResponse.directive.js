(function(){
	'use strict';

	angular.module('speechInNoiseApp')
	.directive('noResponse', noResponse);

	function noResponse(){
		var d = new Date();
		var directive = {
			restrict: 'EA',
			scope: {
				item: '='
			},
			controller: noResponseController,
			controllerAs: 'noResponseCtrl',
			bindToController: true,
			templateUrl: 'js/states/experiment/directives/noResponse.template.html?d=' + d.getTime()
		}
		return directive;
	}


	function noResponseController(){
		var vm = this;
	}


})();
