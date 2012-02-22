<?php

$q = $_GET['query'];
$q = urlencode($q);
$offset = $_GET['start'];
$limit = $_GET['limit'];
	
$json = array();

$url = "http://api.dp.la/dev/item/?search_type=keyword&query=$q&sort=subject_keyword%20desc&limit=$limit&start=$offset";
	
$contents = fetch_page($url);
	
$book_data = json_decode($contents, true);

$hits = $book_data['num_found'];

$items = $book_data['docs'];
	
$books_fields = array('title','creator','measurement_page_numeric','measurement_height_numeric', 'shelfrank', 'pub_date', 'link');
	
foreach($items as $item) {
	$title = '';
	$author = '';

	$link = $item['content_link'];
	$link = '#'; // workaround for dummy data
  $checkouts = (int) $item['checkouts'];
	$shelfrank = checkouts_to_shelfrank($checkouts);

  $creator = $item['creator'];
  $title = $item['title'];
  $height_cm = $item['height'];
  if($height_cm > 33 || $height_cm < 20) $height_cm = rand(20, 33);
  $pages = $item['page_count'];
  $year = $item['date'];
  $pattern = '/[^0-9]*/';
  $year = preg_replace($pattern,'', $year);
	$year = substr($year, 0, 4);
	
  $books_data   = array($title, $creator, $pages, $height_cm, $shelfrank, $year, $link);
	$temp_array  = array_combine($books_fields, $books_data);
	array_push($json, $temp_array);
}
	
$last = $offset + 10;
	
if(count($json) == 0 || $offset == -1) {
	echo '{"start": "-1", "num_found": "0", "limit": "0", "docs": ""}'; 
}
else {
	echo '{"start": ' . $last. ', "limit": "' . $limit . '", "num_found": "' . $hits . '", "docs": ' . json_encode($json) . '}'; 
}

function checkouts_to_shelfrank($scaled_value) {
    if ($scaled_value >= 0 && $scaled_value < 100) {
        return 10;
    }
    if ($scaled_value >= 100 && $scaled_value < 200) {
        return 20;
    }
    if ($scaled_value >= 200 && $scaled_value < 300) {
        return 30;
    }
    if ($scaled_value >= 300 && $scaled_value < 400) {
        return 40;
    }
    if ($scaled_value >= 400 && $scaled_value < 500) {
        return 50;
    }
    if ($scaled_value >= 500 && $scaled_value < 600) {
        return 60;
    }
    if ($scaled_value >= 600 && $scaled_value < 700) {
        return 70;
    }
    if ($scaled_value >= 700 && $scaled_value < 800) {
        return 80;
    }
    if ($scaled_value >= 800 && $scaled_value < 900) {
        return 90;
    }
    if ($scaled_value >= 900) {
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