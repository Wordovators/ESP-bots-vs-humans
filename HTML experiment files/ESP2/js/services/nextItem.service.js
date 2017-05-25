(function(){

'use strict';

angular.module('espApp')
.factory('nextItemService', nextItemService);

nextItemService.$inject = ['$http','$q','SweetAlert', 'shuffleService', 'distributionService', '$location'];
function nextItemService($http, $q, SweetAlert, shuffleService, distributionService, $location){
	var nextItemService = {};

	nextItemService.list;
	nextItemService.parameters;

	//counters
	nextItemService.index;
	nextItemService.presentationIndex;
	nextItemService.robotResponsesPrepped;
	nextItemService.progress;
	nextItemService.totalItems;

	nextItemService.init = function(list){
		var def = $q.defer();

		nextItemService.list = list;
		nextItemService.parameters = list.parameters;

		angular.forEach(nextItemService.parameters.lists, function(value, key){
			nextItemService.parameters.lists[key]['keySelectionsCount'] = 0;
		})
		nextItemService.frame;
		nextItemService.keySelections = 0;

		//shuffle items
		if(nextItemService.parameters.shuffleOrder == true){
			nextItemService.list.test = shuffleService.shuffleArray(nextItemService.list.test);
			nextItemService.list.postTest = shuffleService.shuffleArray(nextItemService.list.postTest);
			if(nextItemService.parameters.robotBehavior.value == "static"){
				nextItemService.list.esp = shuffleService.shuffleArray(nextItemService.list.esp);
			}
		}

		//count total items
		nextItemService.progress = 0;
		nextItemService.totalItems = 0;
		for(var k=0;k<nextItemService.list.presentationOrder.length;k++){
			nextItemService.totalItems += nextItemService.list[nextItemService.list.presentationOrder[k]].length;
		}

		//reset counters
		nextItemService.index = 0;
		nextItemService.presentationIndex = 0;
		nextItemService.robotResponsesPrepped = false;

		//resolve promise
		def.resolve();

		return(def.promise);
	}

	nextItemService.getNextItem = function(){
		var def = $q.defer();
		if(nextItemService.presentationIndex < nextItemService.list.presentationOrder.length){
			var presentationItem = nextItemService.list.presentationOrder[nextItemService.presentationIndex];
			if(nextItemService.index < nextItemService.list[presentationItem].length){
				if(presentationItem == "esp" && nextItemService.parameters.robotBehavior.value == "dynamic" && nextItemService.robotResponsesPrepped == false){
					prepRobotResponses();
				}

				if(presentationItem != "esp" && presentationItem != "test" && presentationItem != "postTest"){
					nextItemService.list[presentationItem][nextItemService.index]["phase"] = "instructions";
				} else {
					nextItemService.list[presentationItem][nextItemService.index]["phase"] = presentationItem;

					//shuffle buttons
					if(nextItemService.parameters.shuffleButtons == true){
						nextItemService.list[presentationItem][nextItemService.index]['selections'] = shuffleService.shuffleArray(nextItemService.list[presentationItem][nextItemService.index]['selections']);
					}
				}

				nextItemService.frame = nextItemService.list[presentationItem][nextItemService.index];

				//console.log(nextItemService.frame);

				nextItemService.index +=1;
				nextItemService.progress +=1;
			} else {
				nextItemService.index = 0;
				nextItemService.presentationIndex += 1;
				nextItemService.getNextItem();
			}
			def.resolve("continue");
		} else {
			$location.path('/postGameQuestionnaire');
			def.resolve("end");

		}

		return(def.promise);
	}

	nextItemService.storeResponse = function(response, expId, workerId){
		var def = $q.defer();

		//during test phase, we keep track of how many times the player selected the 'keySelection' option
		if(nextItemService.list.presentationOrder[nextItemService.presentationIndex] == "test" && nextItemService.frame.keySelection!=null && response == nextItemService.frame.keySelection){
			nextItemService.parameters.lists[nextItemService.frame.list]['keySelectionsCount'] +=1;
		}

		//push reponses to firebase
		var ref = firebase.database().ref().child(expId).child('data').child(workerId);
		nextItemService.frame.response = response;
		nextItemService.frame.timestamp = firebase.database.ServerValue.TIMESTAMP;
		nextItemService.frame.filename = distributionService.filename;
		ref.push(nextItemService.frame);

		def.resolve();
		return(def.promise);
	}

	function prepRobotResponses(){
		angular.forEach(nextItemService.parameters.lists, function(value, key){
			nextItemService.parameters.lists[key]['numberOfTimesToSelectKey'] = Math.round(nextItemService.parameters.lists[key]['keySelectionsCount'] + (nextItemService.parameters.lists[key]['dmm'] * nextItemService.parameters.lists[key]['keySelectionsCount']/100));
			nextItemService.parameters.lists[key]['numberOfTimesKeySelected'] = 0;
		});

		for(var k=0;k<nextItemService.list.esp.length;k++){
			if(nextItemService.parameters.lists[nextItemService.list.esp[k].list]['numberOfTimesKeySelected'] < nextItemService.parameters.lists[nextItemService.list.esp[k].list]['numberOfTimesToSelectKey']){
				nextItemService.list.esp[k].robotSelects = nextItemService.list.esp[k].keySelection;
				nextItemService.parameters.lists[nextItemService.list.esp[k].list]['numberOfTimesKeySelected'] +=1;
			} else {
				nextItemService.list.esp[k].robotSelects = nextItemService.list.esp[k].alternateSelection;
			}
		}

		if(nextItemService.parameters.shuffleOrder == true){
			nextItemService.list.esp = shuffleService.shuffleArray(nextItemService.list.esp);
		}

		nextItemService.robotResponsesPrepped = true;
	}


	return nextItemService;
}

})();
