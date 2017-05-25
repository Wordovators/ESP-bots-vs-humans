(function(){
	'use strict';

	angular.module('speechInNoiseApp')
	.directive('verticalRadiosResponse', verticalRadiosResponse);

	function verticalRadiosResponse(){
		var d = new Date();
		var directive = {
			restrict: 'EA',
			scope: {
				item: '=',
				response: '=',
				responseInputsDisabled: '=',
				responseChanged: '&'
			},
			controller: verticalRadiosResponseController,
			controllerAs: 'verticalRadiosResponseCtrl',
			bindToController: true,
			templateUrl: 'js/states/experiment/directives/verticalRadiosResponse.template.html?d=' + d.getTime()
		}
		return directive;
	}


	function verticalRadiosResponseController(){
		var vm = this;

		vm.radioChanged = function(){
			vm.responseChanged({response:vm.response});
		}
	}


})();
