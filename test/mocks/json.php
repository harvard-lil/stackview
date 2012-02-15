<?php

// Simulate wait, load and return JSON or JSONP accordingly.
sleep(1); 
$results = file_get_contents('static.json');
echo isset($_GET['callback']) ? "{$_GET['callback']}($results)" : $results;

?>