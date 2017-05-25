(function(){
	'use strict';

	angular.module('espApp')
	.controller('ExperimentController', ExperimentController);

	ExperimentController.$inject = ['$location', 'distributionService', 'nextItemService' , 'expId', 'workerId', '$http', '$timeout', '$rootScope'];
	function ExperimentController($location, distributionService, nextItemService,  expId, workerId, $http, $timeout, $rootScope){
		var vm = this;
		vm.ready = false;
		vm.espState;
		vm.robotStatus;
		vm.nextItemService = nextItemService;
		vm.response;
		vm.feedbackText;
		vm.feedbackTextColor;
		vm.score;
		vm.equalSign;
		vm.robotDelay;


		//init
		function init(){
			vm.score = 0;
			distributionService.getList(expId)
			.then(nextItemService.init)
			.then(function(result){
				nextItemService.getNextItem();
				vm.ready = true;
			})

			//warning before window close or change URL
			window.onbeforeunload = function(){
				return "Are you sure you want to leave this page?";
			}

			//prevent this route from going back to the any previous route (i.e. disable back button)
			//only allowed path is from this route to the 'postGameQuestionnaire' route
			$rootScope.$on('$routeChangeStart', function(event, next, current){
				if(current!=undefined && current.$$route.originalPath == "/experiment" && next.$$route.originalPath != "/postGameQuestionnaire" ){
					event.preventDefault();
				}
			})
		}
		init();

		//next button for instructions and after feedback state for esp phase
		vm.nextClicked = function(){
			nextItemService.getNextItem()
			.then(espPause);
		}

		//response button for response items
		vm.responseButtonClicked = function(response){
			vm.response = response;
			nextItemService.storeResponse(vm.response, expId, workerId);

			if(nextItemService.frame.phase == "esp"){
				if(vm.robotStatus == "thinking"){
					vm.espState = 'show';
				} else {
					vm.espState = 'feedback';
					showFeedback();
					//console.log(response);
				}
			} else {
				vm.espState = 'select';
				nextItemService.getNextItem()
				.then(espPause);
				//console.log(response);
			}
		}

		function espPause(){
			if(nextItemService.frame.phase == "esp"){
				if(nextItemService.index == 1 && nextItemService.parameters.espPause != null){
					nextItemService.frame.phase = "espPause";
					$timeout(function(){
						nextItemService.frame.phase = "esp";
						setupEsp();
					}, nextItemService.parameters.espPause.value)
				} else {
					setupEsp();
				}
			}
		}

		function setupEsp(){
			if(nextItemService.frame.phase == "esp"){
				vm.espState = 'select'
				vm.robotStatus = "thinking";

				if(angular.isUndefined(nextItemService.frame.robotDelay) == false){
					vm.robotDelay = nextItemService.frame.robotDelay;
				} else {
					if(angular.isUndefined(nextItemService.parameters.robotDelay) == true){
						vm.robotDelay = 3000;
					} else {
						vm.robotDelay = nextItemService.parameters.robotDelay.value;
					}
				}
				//console.log(vm.robotDelay);

				$timeout(function(){
					vm.robotStatus = "ready";
					if(vm.espState == 'show'){
						vm.espState = "feedback";
						showFeedback();
					}
				}, vm.robotDelay);
			}
		}

		function showFeedback(){
			if(nextItemService.parameters.gameplay.value == "agree"){
				if(vm.response == nextItemService.frame.robotSelects){
					vm.equalSign = "=";
					//award points
					vm.feedbackText = nextItemService.parameters.rewardAmount.value  + " Points. Well Done!"
					vm.feedbackTextColor = "green";
					vm.score += nextItemService.parameters.rewardAmount.value;
				} else {
					vm.equalSign = "≠";
					//no points
					vm.feedbackText = "No points. Try to pick the same word as player 2";
					vm.feedbackTextColor = "red";
				}
			} else {
				if(vm.response == nextItemService.frame.robotSelects){
					vm.equalSign = "=";
					//no points
					vm.feedbackText = "No points. Try to pick a different word from player 2";
					vm.feedbackTextColor = "red";
				} else {
					vm.equalSign = "≠";
					//award points
					vm.feedbackText = nextItemService.parameters.rewardAmount.value  + " Points. Well Done!"
					vm.feedbackTextColor = "green";
					vm.score += nextItemService.parameters.rewardAmount.value;
				}
			}
		}

	}
})()
