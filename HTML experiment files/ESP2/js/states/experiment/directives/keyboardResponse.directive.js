(function(){
	'use strict';

	angular.module('speechInNoiseApp')
	.directive('keyboardResponse', keyboardResponse);

	function keyboardResponse(){
		var d = new Date();
		var directive = {
			restrict: 'EA',
			scope: {
				item: '=',
				response: '=',
				responseChanged: '&'
			},
			controller: keyboardResponseController,
			controllerAs: 'keyboardResponseCtrl',
			bindToController: true,
			templateUrl: 'js/states/experiment/directives/keyboardResponse.template.html?d=' + d.getTime()
		}
		return directive;
	}


	keyboardResponseController.$inject = ['$scope', 'hotkeys'];
	function keyboardResponseController($scope, hotkeys){
		var vm = this;

		//set up hot keys
		$scope.$watch(angular.bind(this, function () {
			return vm.item;
		}), function (newVal, oldVal) {
			if(vm.item.options){
				for(var k=0;k<vm.item.options.length;k++){
					hotkeys.bindTo($scope).add({
						combo: vm.item.options[k],
						callback: function(event, hotkey) {
							vm.response = event.key;
							vm.responseChanged({response:event.key});
						}
					});
				}
			}
		});

	}



})();
