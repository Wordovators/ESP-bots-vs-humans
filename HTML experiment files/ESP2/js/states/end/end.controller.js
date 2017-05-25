(function(){
	'use strict';

	angular.module('espApp')
	.controller('EndController', EndController);

	EndController.$inject = ['$routeParams', 'mode'];
	function EndController($routeParams, mode){
		var vm = this;

		function init(){
			window.onbeforeunload = null;

			//clear out local storage
			localStorage.removeItem('group');
			localStorage.removeItem('flattenedList');
			localStorage.removeItem('index');
		}
		init();

		vm.submitDisabled = false;

		if(mode == "debug"){
			vm.submitDisabled = true;
		}

		vm.submitUrl = $routeParams.turkSubmitTo + "/mturk/externalSubmit?assignmentId=" + $routeParams.assignmentId + "&score=0";

		//vm.replayClicked = function(){
		//	$location.path('/');
		//}
	}
})()
