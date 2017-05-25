(function(){
	'use strict';

	angular.module('espApp')
	.factory('workerIdService', workerIdService);

	workerIdService.$inject = ['$q', 'experimentInfoService', '$route'];
	function workerIdService($q, experimentInfoService, $route){
		var workerIdService = {};

		workerIdService.getWorkerId = function(){
			var defer = $q.defer();
			var d = new Date();
			experimentInfoService.getInfo('mode').then(
				function(result){
					if(result == "debug"){
						defer.resolve("debug");
					} else {
						defer.resolve($route.current.params.workerId);
					}

				}
			)
			return(defer.promise);
		}
		return(workerIdService)
	}


})()
