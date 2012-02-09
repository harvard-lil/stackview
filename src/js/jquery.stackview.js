/*
	Stack View - The jQuery virutal stack plugin
	by The Harvard Library Innovation Lab
	
	Dual licensed under MIT and GPL.
*/

(function ($) {

  // Tell jQuery to list each paramter in URL:
  // filter=something&filter=somethingelse...
  jQuery.ajaxSettings.traditional = true;

  var uid = +new Date(); // stack-view.js workaround
  var offset = 0;

  $.fn.stackView = function (options) {
    if(options !== false) {
      options = $.extend({
        url: 'basic.json',
        data: '',
        jsonp: false,
        books_per_page: 10,
        threshold: 1000,
        page_multiple: 0.11,
        height_multiple: 12,
        search_type: 'keyword',
        query: '',
        ribbon: 'Stack View'
      }, options);
    }

    return this.each(function () {
      var scroller = $(this),
        data = scroller.data('scroller'),
        vertical;
      
      axis = 'y';

      scroller.addClass('scroller');
      scroller.html('<div class="scroller-content"><div class="scroller-loading scroller-loading-prev" /><div class="scroller-page" /><div class="scroller-loading scroller-loading-next" /></div>');

      var scrollerId = scroller.attr('id');
      var wrapperId = scrollerId + '-wrapper';
      scroller.wrap('<div id="' + wrapperId + '" />');
      $('#' + wrapperId).prepend('<div class="navigation"><div class="upstream" /><div class="num-found" /><div class="downstream" /></div><div class="ribbon"><div class="ribbonBody" /><div class="ribbonBehind" /></div>');

      $('#' + scrollerId).bind('mousewheel', function (event, delta) {
        $('#' + scrollerId).trigger('move-by', -delta * 75);
        return false;
      });

      $('#' + wrapperId + ' .upstream').live('click', function () {
        $('#' + scrollerId).trigger('move-by', -475);
        return false;
      });

      $('#' + wrapperId + ' .downstream').live('click', function () {
        $('#' + scrollerId).trigger('move-by', 475);
        return false;
      });

      $('.scroller-page ul li').live('click', function () {
        window.open($(this).attr('link'), '_newtab');
      });

      $('#' + wrapperId + ' .ribbonBody').text(options.ribbon);

      if(options === false) {
        // Destroy!
        scroller.unbind('.infiniteScroller');
        scroller.replaceWith(data.clone);
        return;
      }

      if(!data) {
        scroller.data('scroller', data = {
          clone: scroller.clone(),
          options: options
        });
      }

      function get_page(elem, loc_sort_order, mode, offset, query, done) {
      	var is_sort_order = options.search_type === 'loc_sort_order',
      	num_books = options.books_per_page  * 0.5;
        if(is_sort_order && mode === 'downstream') 
        	options.query = '[' + loc_sort_order + '%20TO%20' + (loc_sort_order + num_books) + ']';
        if(is_sort_order && mode === 'upstream') 
        	options.query = '[' + (loc_sort_order - num_books) + '%20TO%20' + loc_sort_order + ']';
        if(is_sort_order && mode === 'center') 
        	options.query = '[' + (loc_sort_order - 6) + '%20TO%20' + (loc_sort_order + num_books - 6) + ']';

        var params = $.param({
          id: options.id,
          limit: options.books_per_page * (mode !== 'center' ? 1 : 0.5),
          mode: mode,
          query: options.query,
          start: offset,
          search_type: options.search_type
        }),
          tmp;

        if(tmp = stackCache.get(params)) {
          render_page(tmp);
        } else {
            var ext = options.url.split('.').pop();
            if(options.data !== '') {
              render_page(options.data);
            } else if(options.jsonp && ext !== 'json') {
                var geturl = options.url;
                if(geturl.indexOf("?") != -1) geturl += '&callback=?';
                else geturl += '?callback=?';
                $.getJSON(geturl, params, render_page);
                
            } else {
                $.getJSON(options.url, params, function(data) {
                    render_page(data);
                });
            }
        }

        function render_page(data) {

          var rstart = parseInt(data.start) + parseInt(data.limit);
          var roffset = data.num_found - data.start - data.limit;
          if(roffset <= 0) roffset = -1;

          if((!data.docs || !data.docs.length) && data.start !== 0) {
            $('#' + scrollerId).find('.scroller-page ul:last').after('<div class="book-end" />');
            done(false);
            return;
          }

          data.start = rstart;

          stackCache.set(params, data, 60); // cache set to 60 seconds, increase for production use!
          var books = $.extend([], data.docs);

          var $stack = $('<ul class="stack" />');

          function get_heat(scaled_value) {
            if(scaled_value >= 0 && scaled_value < 10) {
              return 1;
            }
            if(scaled_value >= 10 && scaled_value < 20) {
              return 2;
            }
            if(scaled_value >= 20 && scaled_value < 30) {
              return 3;
            }
            if(scaled_value >= 30 && scaled_value < 40) {
              return 4;
            }
            if(scaled_value >= 40 && scaled_value < 50) {
              return 5;
            }
            if(scaled_value >= 50 && scaled_value < 60) {
              return 6;
            }
            if(scaled_value >= 60 && scaled_value < 70) {
              return 7;
            }
            if(scaled_value >= 70 && scaled_value < 80) {
              return 8;
            }
            if(scaled_value >= 80 && scaled_value < 90) {
              return 9;
            }
            if(scaled_value >= 90 && scaled_value <= 100) {
              return 10;
            }
          }

          if(options.search_type !== 'loc_sort_order') {
            $('#' + wrapperId + ' .num-found').html(data.num_found + '<br />items').removeClass('empty');
          } else {
            $('#' + wrapperId + ' .num-found').html('').addClass('empty');
          }

          // This probably shouldn't be necessary!
          $.each(books, function (i, v) {

            if(!v.title) {
              v.title = 'NULL';
            }

            var pages = '';
            if(v.measurement_page_numeric) pages = v.measurement_page_numeric;
            if(pages === "" || pages < 200 || !pages) pages = 200;
            if(pages > 540) pages = 540;

            var height = '';
            if(v.measurement_height_numeric) height = v.measurement_height_numeric;
            if(height === "" || height < 20 || !height) height = 20;
            if(height > 39) height = 39;

            var pub_date = '';
            if(v.pub_date) pub_date = v.pub_date;

            var home = '';

            if(parseInt(v.loc_sort_order) === parseInt(options.loc_sort_order) && mode === 'center') home = ' anchorbook';

            var creator = '';
            if(v.creator && v.creator.length > 0) {
              creator = v.creator[0];
              if(/^([^,]*)/.test(creator)) {
                creator = creator.match(/^[^,]*/);
              }
            }
            
            //workaround for link construction from LibraryCloud
            if(v.title_link_friendly)
            v.link = '../shelflife/book/' + v.title_link_friendly + '/' + v.id;

            $stack.append($('<div class="itemContainer' + home + '" />').html($('<span class="cover heat' + get_heat(v.shelfrank) + '" />').css('width', height * options.height_multiple + 2)).append($('<span class="pages heat' + get_heat(v.shelfrank) + '" />').css('margin-left', height * options.height_multiple + 35).css('margin-bottom', -pages * options.page_multiple - 11).css('height', pages * options.page_multiple + 5)).append($('<li link="' + v.link + '" class="heat' + get_heat(v.shelfrank) + ' spine" />').html('<p class="spine-text"><span class="title">' + v.title + '</span><span class="author">' + creator + '</span></p><span class="spine-year">' + pub_date + '</span>').css('width', height * options.height_multiple).css('height', pages * options.page_multiple)));

            $stack.append($('<div style="clear:both;" />'));

          });

          elem.empty().attr('id', 'stackview' + uid++) // stack-view.js workaround
          .data('scroller', data).append($stack);

          if(parseInt(data.start) < 0) {
            $('#' + scrollerId).find('.scroller-page ul:last').after('<div class="book-end" />');
            $('#' + scrollerId).find('.scroller-loading-next').remove();
            scroller.infiniteScroller();
            return;
          }else {
            done(elem);
          }
        }
      };
      if(options.search_type === 'loc_sort_order') {
        get_page(scroller.find('.scroller-page'), parseFloat(options.loc_sort_order), 'center', 0, '', function () {

          scroller.infiniteScroller({
            search_type: options.search_type,
            axis: options.axis,
            threshold: options.threshold,
            fetch: function (dir, done) {
              var data = this.data('scroller'),
                mode = dir === 1 ? 'downstream' : 'upstream',
                loc_sort_order = data.docs[dir === 1 ? data.docs.length - 1 : 0].loc_sort_order[0] + 1;

              get_page(
              $('<div/>').appendTo('body'), // appendTo is a stack-view.js workaround
              loc_sort_order, mode, offset, options.query, done);
            },
            pagechange: function (prev) {
              var books = this.data('scroller').docs;
              data.loc_sort_order = books[parseInt(books.length / 2)].loc_sort_order[0];
            }
          });

        });
      } else {
        get_page(scroller.find('.scroller-page'), options.id, 'downstream', 0, options.query, function () {

          scroller.infiniteScroller({
          	search_type: options.search_type,
            axis: options.axis,
            threshold: options.threshold,
            fetch: function (dir, done) {
              var data = this.data('scroller'),
                mode = 'downstream',
                id = options.id,
                query = options.query,
                offset = data.start;

              get_page(
              $('<div/>').appendTo('body'), // appendTo is a stack-view.js workaround
              id, mode, offset, query, done);
            }
          });

        });
      }

    });
  };
})(jQuery);

var stackCache = (function(window,undefined){
  
  var cache = {},
    
    // "Borrowed" from Modernizr
    use_localStorage = window.JSON && (function(){
      try {
        return ( 'localStorage' in window ) && window.localStorage !== null;
      } catch(e) {
        return false;
      }
    })();
  
  // Expose these methods.
  return {
    set: set,
    get: get,
    remove: remove
  };
  
  // Set a key-value pair with optional TTL.
  function set( key, value, ttl ) {
    var expires = ttl && new Date( +new Date() + ttl * 1000 ),
      obj = {
        expires: +expires,
        value: value
      };
    
    if ( use_localStorage ) {
      try {
        localStorage[ key ] = JSON.stringify( obj );
      } catch(e) {
        return e;
      }
    } else {
      cache[ key ] = obj;
    }
  };
  
  // Get a value if it exists and hasn't expired.
  function get( key ) {
    var obj,
      val;
    
    if ( use_localStorage ) {
      obj = localStorage[ key ];
      if ( obj ) {
        obj = JSON.parse( obj );
      }
    } else {
      obj = cache[ key ];
    }
    
    if ( obj ) {
      if ( obj.expires && obj.expires < +new Date() ) {
        remove( key );
      } else {
        val = obj.value;
      }
    }
    
    return val;
  };
  
  // Remove a key-value pair.
  function remove( key ) {
    if ( use_localStorage ) {
      localStorage.removeItem( key );
    } else {
      delete cache[ key ];
    }
  };
  
})(window);