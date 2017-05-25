<?php
	date_default_timezone_set('America/Chicago');//change this to your timezone (http://php.net/manual/en/timezones.php)
	
	//change the path of this line to point to the JSON file downloaded from Firebase
	$string = file_get_contents("./my-firebase-json-data.json");
	$json = json_decode($string, true);

	//do not modify anything below this line
	print "group;workerId;totalResponses\n";

	//responses
	$data = $json['data'];
	$results = array();
	foreach($data as $workerId => $workerResponses){
		foreach($workerResponses as $response){
			$group = $response['group'];
			break;
		}
		$obj = new stdClass();
		$obj->group = $group;
		$obj->workerId = $workerId;
		$obj->totalResponses = count($workerResponses);				
		array_push($results, $obj);
	}

	//ksort($results, SORT_NUMERIC);
	usort($results, "cmp");
	

	foreach($results as $key => $r){
		print $r->group . " " .  $r->workerId . " " . $r->totalResponses . "\n";
	}
	
	
	
	//sort function
	function cmp($a, $b)
	{
    	return strnatcmp($a->group, $b->group);
	}



?>
