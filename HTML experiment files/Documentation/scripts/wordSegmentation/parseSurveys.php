<?php
	//path to your surveys folder in your local XAMPP application
	$rootPath = "/Applications/XAMPP/xamppfiles/htdocs/speechInNoise2/experiments/PerceptualAccent/surveys/";
	
	//path to the the firebase json file you downloaded
	$firebaseJson = "./my-firebase-json-data.json";
	
	//this is where the flattened survey data is saved
	$outputFile = ".//my-firebase-json-data.csv";

	date_default_timezone_set('America/Chicago');
	$surveyKeys = array("gender", "ethnicity", "race", "age");
	$surveyOrder = json_decode(file_get_contents($rootPath . "/surveyOrder.json"), true);
	foreach($surveyOrder as $surveyFile){
		$surveyData = json_decode(file_get_contents($rootPath . "/" . $surveyFile['survey']), true);
		foreach($surveyData as $surveyItem){
			if($surveyItem['key']){
				array_push($surveyKeys, $surveyItem['key']);
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