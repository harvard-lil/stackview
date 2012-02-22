<?php

require_once('keys.php');

$q = $_GET['query'];
$q = urlencode($q);
$offset = $_GET['start'];
$count = $_GET['limit'];
	
$json = array();

$url = "https://www.googleapis.com/books/v1/volumes?q=$q&maxResults=$count&startIndex=$offset&fields=items(volumeInfo(authors%2CaverageRating%2CcanonicalVolumeLink%2Cdimensions%2CindustryIdentifiers%2CpageCount%2CpublishedDate%2CratingsCount%2Csubtitle%2Ctitle))%2CtotalItems&pp=1&key=$gkey";
	
$contents = fetch_page($url);
	
$book_data = json_decode($contents, true);

$hits = $book_data['totalItems'];

$items = $book_data['items'];
	
$books_fields = array('title','creator','measurement_page_numeric','measurement_height_numeric', 'shelfrank', 'pub_date', 'link');
	
foreach($items as $item) {
    $item = $item['volumeInfo'];

	$title = '';
	$author = '';

	$link = $item['canonicalVolumeLink'];
    $rating = (int) $item['averageRating'];
	$shelfrank = rating_to_shelfrank($rating);

  	$creator = $item['authors'];
    $title = $item['title'];
    /*if($item['subtitle'])
        $title .= ': ' . $item['subtitle'];*/
    $height_cm = $item['dimensions']['height'];
    if(!$height_cm) $height_cm = rand(20, 33);
    $pages = $item['pageCount'];
    $year = $item['publishedDate'];
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
	echo '{"start": ' . $last. ', "limit": "' . $count . '", "num_found": "' . $hits . '", "docs": ' . json_encode($json) . '}'; 
}

function rating_to_shelfrank($scaled_value) {
    if ($scaled_value >= 0 && $scaled_value < .5) {
        return 10;
    }
    if ($scaled_value >= .5 && $scaled_value < 1) {
        return 20;
    }
    if ($scaled_value >= 1 && $scaled_value < 1.5) {
        return 30;
    }
    if ($scaled_value >= 1.5 && $scaled_value < 2) {
        return 40;
    }
    if ($scaled_value >= 2 && $scaled_value < 2.5) {
        return 50;
    }
    if ($scaled_value >= 2.5 && $scaled_value < 3) {
        return 60;
    }
    if ($scaled_value >= 3 && $scaled_value < 3.5) {
        return 70;
    }
    if ($scaled_value >= 3.5 && $scaled_value < 4) {
        return 80;
    }
    if ($scaled_value >= 4 && $scaled_value < 4.5) {
        return 90;
    }
    if ($scaled_value >= 4.5) {
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