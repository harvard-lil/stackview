<?php	

require_once('keys.php');

$q = $_GET['query'];
$offset = $_GET['start'];
$count = $_GET['limit'];
$callback = $_GET['callback'];
	
$json = array();
	
// Translate Stack View's number of items to Amazon's results page number
$itemPage = 1;
if($offset > 0)
	$itemPage = ($offset + 10) / 10;
	
// Send request to Amazon API
$pxml = aws_signed_request("com", array("Operation"=>"ItemSearch","SearchIndex"=>"Books","Keywords"=>$q,"ResponseGroup"=>"Large","ItemPage"=>$itemPage), $amazon_public_key, $amazon_private_key, $amazon_assoc_id);
   	
$hits = (string) $pxml->Items->TotalResults;
  	
$books_fields = array('title','creator','measurement_page_numeric','measurement_height_numeric', 'shelfrank', 'pub_date', 'link');

foreach($pxml->Items->Item as $item) {
  	$img_url = $item->ASIN;
  	$rank = (int) $item->SalesRank;
  	$rank = salesRank_to_shelfrank($rank);
  	$title_parts = (string) $item->ItemAttributes->Title[0];
  	$title_parts = explode(':', $title_parts);
  	$title = $title_parts[0];
  	$link = (string) $item->DetailPageURL;
  	$author = (string) $item->ItemAttributes->Creator;
  	if($author == '')
  		$author = (string)$item->ItemAttributes->Author;
  	$height_cm = (string) $item->ItemAttributes->PackageDimensions->Length;
  	$pages = (string) $item->ItemAttributes->NumberOfPages;
  	$year = (string) $item->ItemAttributes->PublicationDate;
  	$year = substr($year, 0, 4);

	$creator = array();

	array_push($creator, $author);
		
	$height_cm = $height_cm / 100;
	$height_cm = round($height_cm * 2.54);
		
	$shelfrank = $rank;

	$books_data   = array($title, $creator, $pages, $height_cm, $shelfrank, $year, $link);
	$temp_array  = array_combine($books_fields, $books_data);
	array_push($json, $temp_array);
}

$last = $offset;
	
if(count($json) == 0 || $offset == -1) {
	echo $callback . ' ({"start": "0", "num_found": "0", "limit": "0", "docs": ""})'; 
}
else {
	echo $callback . '({"start": ' . $last. ', "limit": "' . $count . '", "num_found": "' . $hits . '", "docs": ' . json_encode($json) . '})'; 
}

function salesRank_to_shelfrank($scaled_value) {
    if ($scaled_value >= 1 && $scaled_value < 1000) {
        return 100;
    }
    if ($scaled_value >= 1001 && $scaled_value < 3000) {
        return 90;
    }
    if ($scaled_value >= 3001 && $scaled_value < 7000) {
        return 80;
    }
    if ($scaled_value >= 7001 && $scaled_value < 10000) {
        return 70;
    }
    if ($scaled_value >= 10001 && $scaled_value < 15000) {
        return 60;
    }
    if ($scaled_value >= 15001 && $scaled_value < 20000) {
        return 50;
    }
    if ($scaled_value >= 20001 && $scaled_value < 25000) {
        return 40;
    }
    if ($scaled_value >= 25001 && $scaled_value < 30000) {
        return 30;
    }
    if ($scaled_value >= 30001 && $scaled_value < 40000) {
        return 20;
    }
    if ($scaled_value >= 40001 || $scaled_value < 1) {
        return 10;
    }
}

function aws_signed_request($region, $params, $public_key, $private_key, $assoc_id)
{
    /*
    Copyright (c) 2009 Ulrich Mierendorff

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
    */
    
    /*
    Parameters:
        $region - the Amazon(r) region (ca,com,co.uk,de,fr,jp)
        $params - an array of parameters, eg. array("Operation"=>"ItemLookup",
                        "ItemId"=>"B000X9FLKM", "ResponseGroup"=>"Small")
        $public_key - your "Access Key ID"
        $private_key - your "Secret Access Key"
    */

    // some paramters
    $method = "GET";
    $host = "ecs.amazonaws.".$region;
    $uri = "/onca/xml";
    
    // additional parameters
    $params["Service"] = "AWSECommerceService";
    $params["AWSAccessKeyId"] = $public_key;
    // GMT timestamp
    $params["Timestamp"] = gmdate("Y-m-d\TH:i:s\Z");
    // API version
    $params["Version"] = "2009-08-01";
    
    $params["AssociateTag"] = $assoc_id; 

    // sort the parameters
    ksort($params);
    
    // create the canonicalized query
    $canonicalized_query = array();
    foreach ($params as $param=>$value)
    {
        $param = str_replace("%7E", "~", rawurlencode($param));
        $value = str_replace("%7E", "~", rawurlencode($value));
        $canonicalized_query[] = $param."=".$value;
    }
    $canonicalized_query = implode("&", $canonicalized_query);
    
    // create the string to sign
    $string_to_sign = $method."\n".$host."\n".$uri."\n".$canonicalized_query;
    
    // calculate HMAC with SHA256 and base64-encoding
    $signature = base64_encode(hash_hmac("sha256", $string_to_sign, $private_key, True));
    
    // encode the signature for the request
    $signature = str_replace("%7E", "~", rawurlencode($signature));
    
    // create request
    $request = "http://".$host.$uri."?".$canonicalized_query."&Signature=".$signature;
    
    // do request
    $response = @file_get_contents($request);
    
    if ($response === False)
    {
        return False;
    }
    else
    {
        // parse XML
        $pxml = simplexml_load_string($response);
        if ($pxml === False)
        {
            return False; // no xml
        }
        else
        {
            return $pxml;
        }
    }
}
?>