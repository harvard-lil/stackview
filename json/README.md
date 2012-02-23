# /json

The files in this directory serve as examples of the JSON format used by Stack View.  This JSON can be passed directly to Stack View as `data`:

```js
var data = {
  "start": "-1",
  "limit": "0",
  "num_found": "2",
  "docs": [
    {
      "title": "Blankets",
      "creator": [
        "Craig Thompson"
      ],
      "measurement_page_numeric": 582,
      "measurement_height_numeric": 25,
      "shelfrank": 13,
      "pub_date": "2003",
      "link": "http://holliscatalog.harvard.edu/?itemid=|library/m/aleph|009189638"
    },
    {
      "title": "Persepolis",
      "creator": [
        "Marjane Satrapi"
       ],
      "measurement_page_numeric": 153,
      "measurement_height_numeric": 24,
      "shelfrank": 64,
      "pub_date": "2003",
      "link": "http://holliscatalog.harvard.edu/?itemid=|library/m/aleph|009098946"
    }
  ]
};

$('#stackview').stackView({ data: data });
```

...or passed as a URL to a static file...

$('#static-stack').stackView({
  url: 'static.json'
});