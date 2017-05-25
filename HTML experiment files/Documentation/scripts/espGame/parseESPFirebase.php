<?php
	//note: all arrays in the json data file will be converted to a single string separated by the & character
	
	date_default_timezone_set('America/Chicago');//change this to your timezone (http://php.net/manual/en/timezones.php)
	
	//change the path in these two lines to point your input and output files
      $string = file_get_contents("./espSampleDat.json");//source - JSON file 
                        
 //where you want to save output CSV file
  	$output = fopen("./espSampleOut.txt", "w");

	//list of keys that you wish to retrieve from the source JSON file
	//workerId will always be the first column
	//enteredResponse will always be the second column
	//$columns = array("response","group","reactionTime","timestamp","class","contrast","group","intended","list","production", //"target","task","type");	
 
 	$columns = array("blockTrial","timestamp","botRegRate","category","filename","jsonList","keySelection","peerCondition","phase","regLevel","response","robotDelay","robotSelects","selections","sensibility","sentenceFrame","settingID","strongPast","target","targetAv","verbListNo","verbStatus","weakPast");	
		
	//do not modify anything below this line
	$json = json_decode($string, true);
	
	//headers
	fwrite($output, "workerId;enteredResponse;");
	foreach($columns as $column){
		fwrite($output, $column . ";");
	}
	fwrite($output, "\n");

	//responses
	$data = $json['data'];
	foreach($data as $workerId => $workerResponses){
		foreach($workerResponses as $response){
			//this line removes punctuation from the participants response - generally only useful for free text inputs
			$response['enteredResponse'] = str_replace(array(".",",",";"), "", $response['enteredResponse']);
			
			//write workerId and enteredResponse
			fwrite($output, $workerId . ";". $response['enteredResponse'] . ";");
						
			//write all other columns
			foreach($columns as $column){
				if($column == "timestamp"){
					$response[$column] = date('Y-m-d H:i:s', $response[$column]/1000);
				}
				//flatten any arrays
				if(is_array($response[$column])){
					$response[$column] = implode("&", $response[$column]);
				}
				fwrite($output, $response[$column] . ";");
			}
			fwrite($output, "\n");
		}
	}
	fclose($output);


?>
