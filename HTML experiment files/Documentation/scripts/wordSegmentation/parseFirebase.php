<?php
	//change the path in these two lines to point your input and output files
	$string = file_get_contents("../word-segmentation-2-export.json");//source - JSON file 
	$output = fopen("../word-segmentation-2-export.csv", "w");//where you want to save output CSV file

	//list of keys that you wish to retrieve from the source JSON file
	//workerId will always be the first column
	$columns = array("list", "face_1","face_2","face_order","item","morph","morph_gender","morphblock","name_1","name_2","script_position", "index", "selectedFace","selectedFacePosition", "selectedName", "stimID", "structure", "token_gender", "timestamp");
		
	//-- don't modify anything below this line --	
	date_default_timezone_set('America/Chicago');
	$json = json_decode($string, true);
	
	//headers
	fwrite($output, "workerId;");
	foreach($columns as $column){
		fwrite($output, $column . ";");
	}
	fwrite($output, "\n");

	//responses
	$data = $json['data'];
	foreach($data as $workerId => $workerResponses){
		foreach($workerResponses as $response){
			//write workerId and enteredResponse
			fwrite($output, $workerId . ";");
						
			//write all other columns
			foreach($columns as $column){
				if($column == "timestamp"){
					$response[$column] = date('Y-m-d H:i:s', $response[$column]/1000);
				}
				fwrite($output, $response[$column] . ";");
			}
			fwrite($output, "\n");
		}
	}
	fclose($output);


?>
