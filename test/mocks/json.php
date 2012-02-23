<?php
$offset = $_GET['start'];
$limit = $_GET['limit'];

// Simulate wait, load and return JSON or JSONP accordingly.
sleep(1); 

$results = file_get_contents('static.json');
$json = json_decode($results, true);
$slice = $offset == -1 ? $json['docs'] : array_slice($json['docs'], $offset, $limit);
$numfound = count($slice);

$json['start'] = $numfound < $limit ? -1 : $offset;
$json['limit'] = $limit;
$json['num_found'] = 50;
$json['docs'] = $slice;
$results = json_encode($json);

echo isset($_GET['callback']) ? "{$_GET['callback']}($results)" : $results;

?>