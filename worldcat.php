<?php

require_once('keys.php');

$q = $_GET['query'];
$q = urlencode($q);
$offset = $_GET['start'];
$count = $_GET['limit'];
$callback = $_GET['callback'];
	
$query = "srw.kw+all+%22$q%22";
	
$json = array();

$url = "http://www.worldcat.org/webservices/catalog/search/sru?query=$query&wskey=$wskey&sortKeys=Date,,0+relevance";
	
$contents = fetch_page($url);
	
$wxml = simplexml_load_string($contents);
$wxml->registerXPathNamespace('wc', 'http://www.loc.gov/MARC21/slim');
	
$hits = $wxml->numberOfRecords;
	
$books_fields = array('title','creator','measurement_page_numeric','measurement_height_numeric', 'shelfrank', 'pub_date', 'link');
	
foreach($wxml->xpath('//wc:record') as $record) {
	$title = '';
	$author = '';

	$oclcnum = $record->controlfield[0];
	$link = "http://www.worldcat.org/oclc/$oclcnum";
		
	//Total holdings, for ranking SLOW
	$holdingsurl = "http://www.worldcat.org/webservices/catalog/content/libraries/$oclcnum?wskey=$wskey&format=json&frbrGrouping=off";
		
	$holdings_contents = fetch_page($holdingsurl);
	$holdings_data = json_decode($holdings_contents, true);
	$total_holdings = (int) $holdings_data['totalLibCount'];
		
	$shelfrank = holdings_to_shelfrank($total_holdings);

  	$record->registerXPathNamespace('wc', 'http://www.loc.gov/MARC21/slim');
  	foreach( $record->xpath('wc:datafield[@tag="100" or @tag="245" or @tag="300" or @tag="260"]') as $datafield ) {
    	switch($datafield['tag']) {
      		case '100':
        		$author = (string) $datafield->subfield[0];
       	 		break;
      		case '245':
        		$title = (string) $datafield->subfield[0];
        		break;
        	case '300':
        		$dimensions = $datafield->subfield[2];
        		preg_match("/[0-9]+[\s,.]cm\./", $dimensions, $height);
        		$height_cm = str_replace(' cm.', '', $height[0]);
        		$page_subfield = $datafield->subfield[0];
        		preg_match("/[0-9]+[\s,.]p\./", $page_subfield, $page_count);
        		$pages = str_replace(' p.', '', $page_count[0]);
        		break;
      		case '260':
        		$year = $datafield->subfield[2];
				$year = preg_replace('/[^0-9-]*/','', $year);
				$year = substr($year, 0, 4);
        		break;
    	}
			
		$creator = array();
		array_push($creator, $author);
  	}
  	$books_data   = array($title, $creator, $pages, $height_cm, $shelfrank, $year, $link);
	$temp_array  = array_combine($books_fields, $books_data);
	array_push($json, $temp_array);
}
	
$last = $offset + 10;
	
if(count($json) == 0 || $offset == -1) {
	echo $callback . ' ({"start": "0", "num_found": "0", "limit": "0", "docs": ""})'; 
}
else {
	echo $callback . '({"start": ' . $last. ', "limit": "' . $count . '", "num_found": "' . $hits . '", "docs": ' . json_encode($json) . '})'; 
}

function holdings_to_shelfrank($scaled_value) {
    if ($scaled_value >= 0 && $scaled_value < 5) {
        return 10;
    }
    if ($scaled_value >= 6 && $scaled_value < 25) {
        return 20;
    }
    if ($scaled_value >= 26 && $scaled_value < 50) {
        return 30;
    }
    if ($scaled_value >= 51 && $scaled_value < 100) {
        return 40;
    }
    if ($scaled_value >= 101 && $scaled_value < 200) {
        return 50;
    }
    if ($scaled_value >= 201 && $scaled_value < 500) {
        return 60;
    }
    if ($scaled_value >= 501 && $scaled_value < 1000) {
        return 70;
    }
    if ($scaled_value >= 1001 && $scaled_value < 2000) {
        return 80;
    }
    if ($scaled_value >= 2001 && $scaled_value < 5000) {
        return 90;
    }
    if ($scaled_value >= 5001) {
        return 100;
    }
}

function fetch_page($url) {
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL,
	$url);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	$contents = curl_exec ($ch);
	
	curl_close ($ch);
	
	return $contents;
}
?>