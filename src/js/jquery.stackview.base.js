/*!
	Stack View - The jQuery virtual stack plugin
	by The Harvard Library Innovation Lab
	
	Dual licensed under MIT and GPL.
*/
(function($, window, document, undefined) {
	var events,
	    plugin = 'stackView',
	    StackView,
	    utils = {};
	
	events = {
		init: 'stackview.init',
		page_load: 'stackview.pageload'
	};
	
	/*
	   #translate(number, number, number, number, number) - Private
	
	   Takes a value (the first argument) and two ranges of numbers. Translates
	   this value from the first range to the second range.  E.g.:
	
	   translate(0, 0, 10, 50, 100) returns 50.
	   translate(10, 0, 10, 50, 100) returns 100.
	   translate(5, 0, 10, 50, 100) returns 75.
	
	   http://stackoverflow.com/questions/1969240/mapping-a-range-of-values-to-another
	*/
	utils.translate = function(value, start_min, start_max, end_min, end_max) {
		var start_range = start_max - start_min,
		    end_range = end_max - end_min,
		    scale = (value - start_min) / (start_range);
		
		return end_min + scale * end_range;
	};
	

	/*
	   #get_heat(number) - Private
	
	   Takes a value between 0 and 100 and returns a number to be used with
	   heat classes to indicate popularity.
	*/
	utils.get_heat = function(scaled_value) {
		return scaled_value === 100 ? 10 : Math.floor(scaled_value / 10) + 1;
	};
	
	/*
	   #get_height(StackView, object) - Private
	
	   Takes a StackView instance and a book object. Returns a normalized
	   book height percentage, taking into account the minimum height,
	   maximum height, height multiple, and translating them onto the
	   percentage range specified in the stack options.
	*/
	utils.get_height = function(stack, book) {
		var opts = stack.options,
		    height = parseInt(book.measurement_height_numeric, 10),
		    min = opts.min_item_height,
		    max = opts.max_item_height;
		
		if (isNaN(height)) {
			height = min;
		}
		height = Math.min(Math.max(height, min), max);
		height = utils.translate(
			height,
			opts.min_item_height, opts.max_item_height,
			opts.min_height_percentage, opts.max_height_percentage
		);
		return height + '%';
	};
	
	/*
	   #get_thickness(StackView, object) - Private
	
	   Takes a StackView instance and a book object. Returns a normalized
	   book thickness using the number of book pages, taking into account
	   the minimum pages, maximum pages, and pages multiple.
	*/
	utils.get_thickness = function(stack, book) {
		var thickness = parseInt(book.measurement_page_numeric, 10),
		    min = stack.options.min_pages,
		    max = stack.options.max_pages,
		    multiple = stack.options.page_multiple;
		
		if (isNaN(thickness)) {
			thickness = min;
		}
		thickness = Math.min(Math.max(thickness, min), max) * multiple;
		return thickness + 'px';
	};
	
	/*
	   #normalize_link(object) - Private
	
	   Takes an item and returns the item's link, taking into account
	   workarounds that may come from inconsistent data structure.
	*/
	utils.normalize_link = function(item) {
		//workaround for link construction from LibraryCloud
		return item.title_link_friendly ?
			'../shelflife/book/' + item.title_link_friendly + '/' + item.id :
			item.link;
	};
	
	/*
	   #get_author(object) - Private
	
	   Takes an item and returns the item's author, taking the first
	   author if an array of authors is defined.
	*/
	utils.get_author = function(item) {
		var author = item.creator && item.creator.length ? item.creator[0] : '';
		
		if(/^([^,]*)/.test(author)) {
			author = author.match(/^[^,]*/);
		}
		
		return author;
	};
	
	/*
	   #render_items(StackView, array [, jQuery]) - Private
	
	   Takes a StackView instance, an array of result items, and an optional
	   jQuery object.  Renders a DOM element for each of the items and
	   appends it to the stack's item list. If [placeholder] is passed in the
	   items take the its spot in the DOM.
	*/
	utils.render_items = function(stack, docs, $placeholder) {
		var action = $placeholder ? 'before' : 'append',
		    $pivot = $placeholder ?
		             $placeholder :
		             stack.$element.find(stack.options.selectors.item_list);
		    
		
		$.each(docs, function(i, item) {
			var $item = $(tmpl(StackView.templates.book, {
				heat: utils.get_heat(item.shelfrank),
				book_height: utils.get_height(stack, item),
				book_thickness: utils.get_thickness(stack, item),
				link: utils.normalize_link(item),
				title: item.title,
				author: utils.get_author(item),
				year: item.pub_date
			}));
			
			$item.data('stackviewItem', item);
			$pivot[action]($item);
		});
		
		if ($placeholder) {
			$placeholder.remove();
		}
	};
	
	/*
	   #calculate_params(StackView) - Private
	
	   Takes a StackView instance and returns the parameters for the next page.
	   If the Stack uses loc_sort_order, this adjusts the query for that case.
	   Returns a plain object with key:value params to be used by $.param.
	*/
	utils.calculate_params = function(stack) {
		var opts = stack.options,
		    params;
		
		params = {
			start: stack.page * stack.options.items_per_page,
			limit: stack.options.items_per_page,
			search_type: stack.options.search_type,
			query: stack.options.query
		};
		
		if (params.search_type === 'loc_sort_order') {
			params.start = 0;
			
			if (stack.page === 0) {
				stack.loc = {
					low: opts.id - Math.floor(opts.items_per_page / 2),
					high: opts.id + Math.floor(opts.items_per_page / 2)
				};
				params.query = [
					'[',
					stack.loc.low,
					'%20TO%20',
					stack.loc.high,
					']'
				].join('');
			}
			else if (stack.direction === 'down') {
				params.query = [
					'[',
					stack.loc.high + 1,
					'%20TO%20',
					stack.loc.high + opts.items_per_page + 1,
					']'
				].join('');
				stack.loc.high = stack.loc.high + opts.items_per_page + 1;
			}
			else if (stack.direction === 'up') {
				params.query = [
					'[',
					stack.loc.low - opts.items_per_page - 1,
					'%20TO%20',
					stack.loc.low - 1,
					']'
				].join('');
				stack.loc.low = stack.loc.low - opts.items_per_page - 1;
			}
		}
		
		return params;
	};

	/*
	   #fetch_page(StackView, function) - Private
	
	   Takes a StackView instance and a callback function.  Retrieves the
	   next page according to the URL and other options of the StackView
	   instance.  When the page is finished fetching, the callback is
	   invoked, passing in the array of items.
	*/
	utils.fetch_page = function(stack, callback) {
		var params = utils.calculate_params(stack),
				querystring = $.param(params),
				cachedResult;

		stack.page++;
		cachedResult = window.stackCache.get(stack.options.url + querystring);
		
		if (cachedResult) {
			callback(cachedResult);
		}
		else {
			$.ajax({
				url: stack.options.url,
				data: querystring,
				dataType: stack.options.jsonp ? 'jsonp' : 'json',
				success: function(data) {
					window.stackCache.set(
						stack.options.url + params,
						data,
						stack.options.cache_ttl
					);	
					callback(data);
				}
			});
		}
	};
	
	/*
	   #reverse_flow(StackView) - Private
	
	   Takes all items in a StackView instance and gives them a descending
	   z-index.This makes them overlap in the reverse order of normal page
	   flow. Items that appear first in source (higher on the stack) overlap
	   those that appear later.
	*/
	utils.reverse_flow = function(stack) {
		var $items = stack.$element.find(stack.options.selectors.item);
		
		for (var i = $items.length - 1, z = 0; i >= 0; i--, z++) {
			$items.eq(i).css('z-index', z);
		}
	};



	
	/* StackView constructor, set up instance properties and call init. */
	StackView = function(elem, opts) {
		this.element = elem;
		this.$element = $(elem);
		this.options = $.extend({}, StackView.defaults, opts);
		this.page = 0;
		this.finished = {
			up: false,
			down: false
		};
		this.loc = {
			low: null,
			high: null
		};
		this.direction = 'down';
		this.init();
	};
	
	/*
	   The default options for a StackView instance.
	
	   url
	      The URL to send requests to for item data.
	   data
	      An alternative to URL, used for static data. Accepts a typical
	      URL response object or a simple array of item objects.
	   jsonp
	      If true, the URL will expect a JSONP request. callback=? will be
	      added to the request parameters.
	   items_per_page
	      The number of items to request each page.
	   page_multiple
	      A number that when multiplied by the number of pages in a book
	      gives us the total pixel height to be rendered.
	   search_type
	      The type of search to be performed by the script at URL. This is
	      passed to the script as the search_type parameter.
	   query
	      The query passed to the script at URL.  Passed as the
	      query parameter.
	   ribbon
	      The text of the ribbon at the top of the stack.
	   id
	      When using a search type of loc_sort_order, this is the id of
	      the item that the search centers around.
	   min_pages
	      The minimum number of pages that a book will render as,
	      regardless of the true number of pages.
	   max_pages
	      The maximum number of pages that a book will render as,
	      regardless of the true number of pages.
	   min_item_height
	      The minimum height in centimeters that an item will render as,
	      regardless of the true height of the item.
	   max_item_height
	      The maximum height in centimeters that an item will render as,
	      regardless of the true height of the item.
	   min_height_percentage
	      Books with the minimum height will render as this percentage
	      width in the stack.
	   max_height_percentage
	      Books with the maximum height will render as this percentage
	      width in the stack.
	   cache_ttl
	      How long a request will stay in cache.
	   selectors
	      A number of selectors that are frequently used by the code to
	      identify key structures.
	*/
	$.extend(StackView, {
		defaults: {
			url: 'basic.json',
			data: '',
			jsonp: false,
			items_per_page: 10,
			page_multiple: 0.20,
			height_multiple: 12.5,
			search_type: 'keyword',
			query: '',
			ribbon: 'Stack View',
			id: null,
			min_pages: 200,
			max_pages: 540,
			min_item_height: 20,
			max_item_height: 39,
			min_height_percentage: 59,
			max_height_percentage: 100,
			cache_ttl: 60,
			selectors: {
				item: '.stack-item',
				item_list: '.stack-items',
				ribbon: '.ribbon'
			}
		}
	});
	
	/*
	   StackView public methods
	*/
	$.extend(true, StackView.prototype, {
		
		/*
		   #init()
		
		   Sets up the initial states of a stack.  Including:
		     - Creating the HTML skeleton.
		     - Binding reverse_flow to the pageload event.
		     - Loading the first page.
		     - Firing the init event.
		*/
		init: function() {
			var that = this;
			
			this.$element
				.html(tmpl(StackView.templates.scaffold, {
					ribbon: this.options.ribbon
				}))
				.addClass('stackview')
				.bind(events.page_load, function() {
					utils.reverse_flow(that);
				});
			
			this.$element.data('stackviewObject', this);
			this.$element.trigger(events.init);
			this.next_page();
		},
		
		/*
		   #next_page()
		
		   Loads the next page of stack items.  If we've already hit the
		   last page, this function does nothing.
		*/
		next_page: function() {
			var $placeholder = $(tmpl(StackView.templates.placeholder, {})),
			    that = this,
			    opts = this.options;
			
			if (this.finished.down) {
				return;
			}
			
			this.direction = 'down';
			if (opts.data) {
				utils.render_items(this, opts.data.docs ? opts.data.docs : opts.data);
				this.finished.down = true;
				this.$element.trigger(events.page_load, [opts.data]);
			}
			else if (opts.url) {
				this.$element
					.find(opts.selectors.item_list)
					.append($placeholder);
				utils.fetch_page(this, function(data) {
					utils.render_items(that, data.docs, $placeholder);
					if (parseInt(data.start, 10) === -1) {
						that.finished.down = true;
					}
					that.$element.trigger(events.page_load, [data]);
				});
			}
		},
		
		/*
		   #prev_page()
		
		   Loads the previous page of stack items.  If we've already hit the
		   first page this function does nothing.  This function only works
		   for stacks using the loc_sort_order search type.
		*/
		prev_page: function() {
			var $placeholder = $(tmpl(StackView.templates.placeholder, {})),
			    opts = this.options,
			    that = this,
			    $oldMarker = that.$element.find(opts.selectors.item).first();
			
			if (opts.search_type !== 'loc_sort_order' || this.finished.up) {
				return;
			}
			
			this.direction = 'up';
			this.$element.find(opts.selectors.item_list).prepend($placeholder);
			utils.fetch_page(this, function(data) {
				var oldTop = $oldMarker.position().top;
				
				utils.render_items(that, data.docs, $placeholder);
				if (that.page > 1) {
					that.$element.find(opts.selectors.item_list).animate({
						'scrollTop': '+=' + ($oldMarker.position().top - oldTop)
					}, 0);
				}
				if (parseInt(data.start, 10) === -1) {
					that.finished.up = true;
				}
				that.$element.trigger(events.page_load, [data]);
			});
		}
	});
	
	/*
	   If .stackView has not been called on an element, the first call will
	   initialize the plugin. Subsequent calls expect a method from the
	   StackView class. Any method that returns undefined is assumed to
	   chain. If the method returns a value, only the value from the first
	   element in the jQuery set will be returned, the same as other getters
	   in jQuery.
	*/
	$.fn[plugin] = function(method) {
		var response,
		    args = Array.prototype.slice.call(arguments, 1);
		
		this.each(function(i, el) {
			var $el = $(el),
			    obj = $el.data('stackviewObject');
			
			if (!obj) {
				new StackView(el, method);
			}
			else if (obj[method]) {
				var methodResponse = obj[method](args);
				
				if (response === undefined && methodResponse !== undefined) {
					response = methodResponse;
				}
			}
		});
		
		return response === undefined ? this : response;
	};
	
	/* Expose the StackView class for extension */
	window.StackView = StackView;
})(jQuery, window, document);