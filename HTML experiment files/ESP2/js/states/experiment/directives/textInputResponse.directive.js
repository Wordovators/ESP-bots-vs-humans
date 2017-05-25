(function(){
	'use strict';

	angular.module('speechInNoiseApp')
	.directive('textInputResponse', textInputResponse);

	function textInputResponse(){
		var d = new Date();
		var directive = {
			restrict: 'EA',
			scope: {
				item: '=',
				response: '=',
				responseInputsDisabled: '=',
				enterClicked: '&'
			},
			controller: textInputResponseController,
			controllerAs: 'textInputResponseCtrl',
			bindToController: true,
			templateUrl: 'js/states/experiment/directives/textInputResponse.template.html?d=' + d.getTime()
		}
		return directive;
	}


	textInputResponseController.$inject = ['$timeout', '$scope'];
	function textInputResponseController($timeout, $scope){
		var vm = this;
		vm.showError = false;

		//focus textInput field
		$scope.$watch(angular.bind(this, function () {
			return vm.responseInputsDisabled;
		}), function (newVal, oldVal) {
			if (vm.responseInputsDisabled == false) {
					$timeout(function() { document.getElementById('textResponseInput').focus(); });
			}
		});

		//handle key presses on textInput field
		vm.onKeyUp = function(event){
			if(event.keyCode == 13){
				if(vm.response!=null && vm.response!=''){
					vm.showError = false;
					vm.enterClicked();
				} else {
					vm.showError = true;
				}
			}
		}

	}


})();
