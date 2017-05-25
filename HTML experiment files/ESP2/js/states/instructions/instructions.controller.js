(function(){
	'use strict';

	angular.module('espApp')
	.controller('InstructionsController', InstructionsController);

	InstructionsController.$inject = ['$http', '$location', 'SweetAlert', 'expId', 'getInstructionsService', 'instructionsFile'];
	function InstructionsController($http, $location, SweetAlert, expId, getInstructionsService, instructionsFile){
		var vm = this;
		vm.expId = expId;
		vm.instructions = [];
		vm.instructionsIndex = 0;
		vm.title = "";
		vm.currentInstructions = [];

		function init(){
			//get instructions
			var promise = getInstructionsService.getInstructions(expId, instructionsFile);
			promise.then(function(result) {
				vm.instructions = result.data;
				//console.log(vm.instructions.length);
				vm.instructionsIndex = 0;
				vm.title = vm.instructions[vm.instructionsIndex].title;
				vm.currentInstructions = vm.instructions[vm.instructionsIndex].instructions;
			});
		}
		init();


		vm.prevClicked = function(){
			vm.instructionsIndex -=1;
			if(vm.instructionsIndex < 0){
				vm.instructionsIndex = 0;
			}
			vm.title = vm.instructions[vm.instructionsIndex].title
			vm.currentInstructions = vm.instructions[vm.instructionsIndex].instructions;
		}

		vm.nextClicked = function(){
			vm.instructionsIndex +=1;
			if(vm.instructionsIndex >= vm.instructions.length){
				vm.instructionsIndex = vm.instructions.length - 1;
				if($location.path() == "/"){
					$location.path('/consent');
				} else if($location.path() == "/instructions2"){
					$location.path('/experiment');
				} else {
					SweetAlert.swal({
								title: "Path error",
								text: "Try clicking the 'NEXT' button again. If this problem persists, please contact the requester.",
								type: "error"
							});
				}

			} else {
				vm.title = vm.instructions[vm.instructionsIndex].title
				vm.currentInstructions = vm.instructions[vm.instructionsIndex].instructions;
			}
		}
	}
})()
