<?php
	date_default_timezone_set('America/Chicago');//change this to your timezone (http://php.net/manual/en/timezones.php)
	
	//change the path of this line to point to the JSON file downloaded from Firebase
	$string = file_get_contents("./my-firebase-json-data.json");
	
	//where you want to save output CSV file
	$output = fopen("./my-firebase-json-data.csv", "w");

	//do not modify anything below this line	
	$json = json_decode($string, true);
	fwrite($output, "workerId;timestamp;ipAddress\n");

	$consent = $json['consent'];
	$results = array();
	foreach($consent as $workerId => $consentData){
		foreach($consentData as $cd){
			fwrite($output, $workerId . ";");
			fwrite($output, date('Y-m-d H:i:s', $cd['timestamp']/1000) . ";");
			if(isset($cd['ipAddress'])){
				fwrite($output, $cd['ipAddress'] . "\n");
			} else {
				fwrite($output, "\n");
			}
		}
	}
	fclose($output);
?>
