(function(){
	'use strict';

	angular.module('speechInNoiseApp')
	.directive('horizontalRadiosResponse', horizontalRadiosResponse);

	function horizontalRadiosResponse(){
		var d = new Date();
		var directive = {
			restrict: 'EA',
			scope: {
				item: '=',
				response: '=',
				responseInputsDisabled: '=',
				responseChanged: '&'
			},
			controller: horizontalRadiosResponseController,
			controllerAs: 'horizontalRadiosResponseCtrl',
			bindToController: true,
			templateUrl: 'js/states/experiment/directives/horizontalRadiosResponse.template.html?d=' + d.getTime()
		}
		return directive;
	}


	horizontalRadiosResponseController.$inject = ['$scope'];
	function horizontalRadiosResponseController($scope){
		var vm = this;
		vm.options = [];

		vm.radioChanged = function(){
			vm.responseChanged({response:vm.response});
		}

		//set up radio buttons
		$scope.$watch(angular.bind(this, function () {
			return vm.item;
		}), function (newVal, oldVal) {
			if(vm.item){
				vm.options = [];
				for(var k=1;k<=vm.item.length;k++){
					vm.options.push(k);
				}
			}
		});
	}



})();
