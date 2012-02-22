/*!
	Stack View - The jQuery virutal stack plugin
	by The Harvard Library Innovation Lab
	
	Dual licensed under MIT and GPL.
*/
(function($, window, document, undefined) {
	var events,
	    plugin = 'stackview',
	    StackView,
	    utils = {};
	
	events = {
		init: 'stackview.init',
		page_load: 'stackview.pageload'
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
	   book height, taking into account the minimum height, maximum height,
	   and height multiple.
	*/
	utils.get_height = function(stack, book) {
		var height = parseInt(book.measurement_height_numeric, 10),
		    min = stack.options.min_item_height,
		    max = stack.options.max_item_height,
		    multiple = stack.options.height_multiple;
		
		height = Math.min(Math.max(height, min), max) * multiple;
		return height + 'px';
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
		var action = $placeholder ? 'after' : 'append',
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
	
	utils.calculate_params = function(stack) {
		var params = {
			start: stack.page * stack.options.items_per_page,
			limit: stack.options.items_per_page,
			search_type: stack.options.search_type,
			query: stack.options.query
		}, $pivot, id;
		
		if (params.search_type === 'loc_sort_order') {
			params.start = '-1';
			if (stack.page === 0) {
				params.query = [
					'[',
					stack.options.id - Math.floor(stack.options.items_per_page / 2),
					'%20TO%20',
					stack.options.id + Math.floor(stack.options.items_per_page / 2),
					']'
				].join('');
			}
			else if (stack.direction === 'down') {
				$pivot = stack.$element.find(stack.options.selectors.item).last();
				id = $pivot.data('stackviewItem').loc_sort_order[0] + 1;
				params.query = [
					'[',
					id,
					'%20TO%20',
					id + stack.options.items_per_page,
					']'
				].join('');
			}
			else if (stack.direction === 'up') {
				$pivot = stack.$element.find(stack.options.selectors.item).first();
				id = $pivot.data('stackviewItem').loc_sort_order[0] + 1;
				params.query = [
					'[',
					id - stack.options.items_per_page,
					'%20TO%20',
					id,
					']'
				].join('');
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
		    cachedResult,
				querystring;

		if (stack.options.jsonp) {
			params.callback = '?';
		}
		querystring = $.param(params);

		stack.page++;
		cachedResult = window.stackCache.get(stack.options.url + querystring);
		
		if (cachedResult) {
			callback(cachedResult);
		}
		else {
			$.getJSON(stack.options.url, querystring, function(data) {
				window.stackCache.set(
					stack.options.url + params,
					data,
					stack.options.cache_ttl
				);
				
				callback(data);
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
		this.loc_sort_order = undefined;
		this.direction = 'down';
		this.init();
	};
	
	/* The defaults are a static property of the class. */
	$.extend(StackView, {
		defaults: {
			url: 'basic.json',
			data: '',
			jsonp: false,
			items_per_page: 10,
			threshold: 1000,
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
			cache_ttl: 60,
			
			selectors: {
				item: '.stack-item',
				item_list: '.stack-items',
				ribbon: '.ribbon'
			}
		}
	});
	
	/* StackView public methods */
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
				.addClass(plugin)
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
					console.log(events.page_load);
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
			    that = this;
			
			if (opts.search_type !== 'loc_sort_order' || this.finished.up) {
				return;
			}
			
			this.direction = 'up';
			this.$element.find(opts.selectors.item_list).prepend($placeholder);
			utils.fetch_page(this, function(data) {
				var $oldMarker = that.$element.find(opts.selectors.item).first();
				
				utils.render_items(that, data.docs, $placeholder);
				if (page > 1) {
					that.$element.find(opts.selectors.item_list).animate({
						'scrollTop': '+=' + $oldMarker.position().top
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
	   If .stackview has not been called on an element, the first call will
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