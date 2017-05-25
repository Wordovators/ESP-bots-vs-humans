(function(){
	'use strict';

	angular.module('espApp')
	.factory('experimentInfoService', experimentInfoService);

	experimentInfoService.$inject = ['$http', 'SweetAlert', '$q', 'expIdService'];
	function experimentInfoService($http, SweetAlert, $q, expIdService){
		var experimentInfoService = {};

		//experimentInfoService.mode;

		experimentInfoService.getInfo = function(attribute){
			var defer = $q.defer();
			var d = new Date();
			expIdService.getExpId().then(
				function(result){
					var promise = $http.get('experiments/' + result + '/experimentInfo.json?' + d.getTime());
					promise.then(function(result){
						if(attribute == "mode"){
							defer.resolve(result.data.mode);
						} else if(attribute == "skipAudioTest"){
							defer.resolve(result.data.skipAudioTest);
						}else if(attribute == "skipCoreSurvey"){
							defer.resolve(result.data.skipCoreSurvey);
						} else {
							defer.reject();
						}

						//console.log(experimentInfoService.mode);
					})
					promise.error(function(data, status, headers, config){
						defer.reject();
						SweetAlert.swal({
									title: "Error!",
									text: "Could not get experiment info. Please contact the requester for more details.",
									type: "error"
								});
					})
				}
			)
			return(defer.promise);
		}



		return(experimentInfoService)
	}


})()
