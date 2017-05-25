<?php
	date_default_timezone_set('America/Chicago');//change this to your timezone (http://php.net/manual/en/timezones.php)
	
	//path to your experiments folder in the speechInNoise2 framework
	$rootPath = "/Applications/XAMPP/xamppfiles/htdocs/speechInNoise2/experiments/mySimpleExperiment/";
	
	//path to the the firebase json file you downloaded
	$firebaseJson = "./aa-MT-short/speech-in-noise-2-aa-MT-short-export.json";
	
	//this is where the flattened survey data is saved
	$outputFile = "./aa-MT-short/speech-in-noise-2-aa-MT-short-export.csv";
	
	//do not modify anything below this line
	$experimentInfo = json_decode(file_get_contents($rootPath . "experimentInfo.json"), true);
	if($experimentInfo['skipCoreSurvey'] == true){
		$surveyKeys = array();
	} else {
		$surveyKeys = array("gender", "ethnicity", "race", "age");	
	}
	
	//pre experiment survey	
	if (file_exists($rootPath . "surveys/surveyOrder.json")){
		$surveyOrder = json_decode(file_get_contents($rootPath . "surveys/surveyOrder.json"), true);
		foreach($surveyOrder as $surveyFile){
			$surveyData = json_decode(file_get_contents($rootPath . "surveys/" . $surveyFile['survey']), true);
			foreach($surveyData as $surveyItem){
				if($surveyItem['key']){
					array_push($surveyKeys, $surveyItem['key']);
				}
			}
		}
	}

	//post experiment survey
	if (file_exists($rootPath . "surveys/postTaskSurveyOrder.json")){
		$surveyOrder = json_decode(file_get_contents($rootPath . "surveys/postTaskSurveyOrder.json"), true);
		foreach($surveyOrder as $surveyFile){
			$surveyData = json_decode(file_get_contents($rootPath . "surveys/" . $surveyFile['survey']), true);
			foreach($surveyData as $surveyItem){
				if($surveyItem['key']){
					array_push($surveyKeys, $surveyItem['key']);
				}
			}
		}
	}	
	
	$data = json_decode(file_get_contents($firebaseJson), true);
	$surveyData = $data['survey'];
	$resultsData = array();
	foreach($surveyData as $workerId => $sd){
		foreach($sd as $answer){
			foreach($surveyKeys as $key){
				if($answer[$key]){
					$resultsData[$workerId][$key] = $answer[$key];
				} else {
					if($resultsData[$workerId][$key] == null){
						$resultsData[$workerId][$key] = "";
					}
				}
			}
		}
	}
	
	$output = fopen($outputFile, "w");
	fwrite($output, "workerId;");
	foreach($surveyKeys as $key){
		fwrite($output, $key . ";");
	}
	fwrite($output, "\n");
	foreach($resultsData as $workerId => $data){
		fwrite($output, $workerId . ";");
		foreach($data as $d){
			if(is_array($d)){
				foreach($d as $subdbkey => $subd){
					if($subd == true){
						fwrite($output, $subdbkey . "%");
					}
				}
				fwrite($output, ";");
			} else {
				fwrite($output, $d . ";");
			}
		}
		fwrite($output, "\n");
	}
?>