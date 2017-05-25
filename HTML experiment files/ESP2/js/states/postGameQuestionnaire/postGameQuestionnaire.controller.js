(function(){

'use strict';

angular.module('espApp')
.controller('PostGameQuestionnaireController', PostGameQuestionnaireController);

PostGameQuestionnaireController.$inject = ['$location', '$q', '$http', 'expId', 'SweetAlert', 'workerId',  '$rootScope'];
function PostGameQuestionnaireController($location, $q, $http, expId, SweetAlert, workerId,  $rootScope){
	var vm = this;
	vm.allQuestionnaires;
	vm.questionnaireIndex;

	function init(){
		vm.questionnaireIndex = -1;
		vm.allQuestionnaires = [];
		$q.all([getPostGameQuestionnaire()]).then(
			function(result){
				for(var k=0;k<result[0].length;k++){
					vm.allQuestionnaires.push(result[0][k]);
				}
				nextQuestionnaire();
			}
		);

		//prevent this route from going back to the any previous route (i.e. disable back button)
		//only allowed path is from this route to the 'end' route
		$rootScope.$on('$routeChangeStart', function(event, next, current){
			if(current!=undefined && current.$$route.originalPath == "/postGameQuestionnaire" && next.$$route.originalPath != "/end" ){
				event.preventDefault();
			}
		})
	}
	init();

	function nextQuestionnaire(){
		vm.questionnaireIndex += 1;
		if(vm.questionnaireIndex >= vm.allQuestionnaires.length){
			//end of post game questionnaires
			$location.path('/end');
		}
	}

	function getPostGameQuestionnaire(){
		var def = $q.defer();

		$http.get('experiments/' + expId + '/postGameQuestionnaires/postGameQuestionnaireOrder.json?d=' + (new Date()).getTime())
		.then(function(result){
			var promises = [];
			for(var k=0;k<result.data.length;k++){
				promises.push($http.get('experiments/' + expId + '/postGameQuestionnaires/' + result.data[k].postGameQuestionnaire + '?d=' + (new Date()).getTime()))
			}
			$q.all(promises).then(function(result){
				var returnArray = [];
				for(var k=0;k<result.length;k++){
					returnArray.push(
						{
							id:k,
							postGameQuestionnaire:result[k].data
						}
					);
				}
				def.resolve(returnArray);
			},
			function(error){
				def.reject(error);
			})
		})
		return(def.promise);
	}

	vm.onSubmit = function(questionnaireForm){
		if(questionnaireForm.$valid == true){
			var ref = firebase.database().ref().child(expId).child('survey').child(workerId);
			ref.push(vm.allQuestionnaires[vm.questionnaireIndex].model);
			//console.log(vm.allSurveys[vm.surveyIndex].model);
			nextQuestionnaire();
		}
	}


}

})();
