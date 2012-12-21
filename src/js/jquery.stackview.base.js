/*!
	Stack View - The jQuery virtual stack plugin
	by The Harvard Library Innovation Lab
	
	Dual licensed under MIT and GPL.
*/
(function($, window, document, undefined) {
	var events,
	    plugin = 'stackView',
	    StackView,
	    types = {};
	
	events = {
		init: 'stackview.init',
		item_added: 'stackview.itemadded',
		item_removed: 'stackview.itemremoved',
		page_load: 'stackview.pageload'
	};
	
	/*
	   #get_type
	*/
	var get_type = function(item) {
		var type;

		$.each(types, function(key, val) {
			if (val.match(item)) {
				type = val;
				return false;
			}
		});

		return type;
	};
	
	/*
	   #render_items(StackView, array [, jQuery]) - Private
	
	   Takes a StackView instance, an array of result items, and an optional
	   jQuery object.  Renders a DOM element for each of the items and
	   appends it to the stack's item list. If [placeholder] is passed in the
	   items take the its spot in the DOM.
	*/
	var render_items = function(stack, docs, $placeholder) {
		var action = $placeholder ? 'before' : 'append',
		    $pivot = $placeholder ?
		             $placeholder :
		             stack.$element.find(stack.options.selectors.item_list);
		
		$.each(docs, function(i, item) {
			var type = get_type(item),
			    $item;

			if (type == null) {
				return true;
			}

			$item = $(tmpl(type.template, type.adapter(item, stack.options)));
			$item.data('stackviewItem', item);
			$pivot[action]($item);
		});

		if ($placeholder) {
			$placeholder.remove();
		}
	};

	/*
		 #check_empty(StackView, number) - Private

		 If count is 0, check_empty renders the empty message to the stack
		 passed in.
	*/
	var check_empty = function(stack, count) {
		if (count) return;

		stack.$element.find(stack.options.selectors.item_list).append(
			tmpl(StackView.templates.empty, {
				message: stack.options.emptyMessage
			})
		);
	};
	
	/*
	   #calculate_params(StackView) - Private
	
	   Takes a StackView instance and returns the parameters for the next page.
	   If the Stack uses loc_sort_order, this adjusts the query for that case.
	   Returns a plain object with key:value params to be used by $.param.
	*/
	var calculate_params = function(stack) {
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
	var fetch_page = function(stack, callback) {
		var params = calculate_params(stack),
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
	
	/* Static properties and functions */
	$.extend(true, StackView, {

			/*
		   The default options for a StackView instance.
		
		   cache_ttl
		      How long a request will stay in cache.

		   data
		      An alternative to URL, used for static data. Accepts a typical
		      URL response object or a simple array of item objects.

		   emptyMessage
		   		Text shown to users when the stack contains no items.

		   id
		      When using a search type of loc_sort_order, this is the id of
		      the item that the search centers around.

		   items_per_page
		      The number of items to request each page.

		   jsonp
		      If true, the URL will expect a JSONP request. callback=? will be
		      added to the request parameters.

		   query
		      The query passed to the script at URL.  Passed as the
		      query parameter.

		   ribbon
		      The text of the ribbon at the top of the stack.

		   search_type
		      The type of search to be performed by the script at URL. This is
		      passed to the script as the search_type parameter.

		   selectors
		      A number of selectors that are frequently used by the code to
		      identify key structures.

		      item
		         A single item in the stack.

		      item_list
		         Container around all of the stack items.

		      ribbon
		         The text ribbon at the top of the stack.

		   url
		      The URL to send requests to for item data.
		*/
		defaults: {
			cache_ttl: 60,
			data: '',
			emptyMessage: 'No items found.',
			id: null,
			items_per_page: 10,
			jsonp: false,
			query: '',
			ribbon: 'Stack View',
			search_type: 'keyword',
			selectors: {
				item: '.stack-item',
				item_list: '.stack-items',
				ribbon: '.ribbon'
			},
			url: 'basic.json'
		},

		/*
	     StackView.get_heat(number)
	
	      Takes a value between 0 and 100 and returns a number to be used with
	      heat classes to indicate popularity.
		*/
		utils: {
			get_heat: function(scaled_value) {
				return scaled_value === 100 ? 10 : Math.floor(scaled_value / 10) + 1;
			}
		},

		/*
		   StackView.register_type(object)

		   Registers an item type to be used by the stack. A Type object
		   has the following properties:

		   name: string
		     A unique, identifying name of the item type.

		   match: function(obj) -> obj
		     A function that takes a stack item and returns true if the
		     item matches this type. Example:

		       match: function(item) { return item.type === 'book' }

		   adapter: function(obj, obj) -> obj
		     This function allows the user to make transformations to the
		     item data before rendering it to the template.  It takes as
		     parameters a raw item that matches the match function and the
		     options from the StackView instance.  It should return an object
		     to render against "template."  If no changes to the raw data need
		     to be made, the simplest value for this can be:

		       adapter: function(item) { return item; }

		   template: string
		     A microtemplating template to render for this type in the stack.
		     Receives as its data the return value from "adapter."

		*/
		register_type: function(obj) {
			types[obj.name] = obj;
		},

		/*
		   StackView.get_types()

		   Returns the hash of item types.
		*/
		get_types: function() {
			return types;
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
		     - Binding zIndex ordering to the pageload event.
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
					that.zIndex();
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
				if (opts.data.docs) {
					render_items(this, opts.data.docs);
					check_empty(this, opts.data.num_found);
				}
				else {
					render_items(this, opts.data);
					check_empty(this, opts.data.length);
				}
				this.finished.down = true;
				this.$element.trigger(events.page_load, [opts.data]);
			}
			else if (opts.url) {
				this.$element
					.find(opts.selectors.item_list)
					.append($placeholder);
				fetch_page(this, function(data) {
					check_empty(that, data.num_found);
					render_items(that, data.docs, $placeholder);
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
			fetch_page(this, function(data) {
				var oldTop = $oldMarker.position().top;
				
				render_items(that, data.docs, $placeholder);
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
		},
		
		/*
		   #add([number,] object)
		
		   Adds the specified item object to the stack, at the given index if
		   provided or at the end (bottom) of the stack if index is not given.
		*/
		add: function() {
			var $items = this.$element.find(this.options.selectors.item),
			    index, item, type, action, $pivot, $item;
			
			if (typeof(arguments[0]) === 'number') {
				index = arguments[0];
				item = arguments[1];
			}
			else {
				index = $items.length;
				item = arguments[0];
			}

			if (index > $items.length || index < 0) {
				return;
			}
			else if (index === $items.length) {
				$pivot = $items.last();
				action = 'after';
			}
			else {
				$pivot = $items.eq(index);
				action = 'before';
			}
			
			type = get_type(item);
			if (type == null) {
				return;
			}
			$item = $(tmpl(type.template, type.adapter(item, this.options)));

			$item.data('stackviewItem', item);
			$pivot[action]($item);
			this.zIndex();
			this.$element.trigger(events.item_added);
		},
		
		/*
		   #remove(number | object)
		
		   If a number is given, it removes the item at that index. If an
		   object is given, this method finds the element that represents that
		   item and removes it.
		*/
		remove: function(arg) {
			var $items = this.$element.find(this.options.selectors.item),
			    $found, data, index;
			
			if (typeof(arg) === 'number') {
				$found = $items.eq(arg);
			}
			else if (arg.nodeType || arg.jquery){
				$found = $(arg);
			}
			else {
				$items.each(function(i, el) {
					var $el = $(el);
					
					if ($el.data('stackviewItem') === arg) {
						$found = $el;
						return false;
					}
				});
			}
			
			if ($found == null || !$found.length) {
				return;
			}
			
			$found.detach();
			data = $found.data('stackviewItem');
			this.$element.trigger(events.item_removed, [data]);
			return $found;
		},
		
		
		/*
		   #getData()
		
		   Returns an array of all the item objects currently in the stack.
		*/
		getData: function() {
			var data = [];
			
			this.$element.find(this.options.selectors.item).each(function() {
				data.push($(this).data('stackviewItem'));
			});
			
			return data;
		},
		
		/*
		   #zIndex(boolean)
		
		   Reverses the natural flow order of the stack items by giving those
		   earlier in the source (higher on the stack) a higher z-index.  If
		   passed true, it will instead assign z-indexes in normal flow order.
		*/
		zIndex: function(reverse) {
			var $items = this.$element.find(this.options.selectors.item),
			    length = $items.length,
			    i = 0,
			    z = reverse ? 0 : $items.length - 1;
			
			while (i < length) {
				$items.eq(i).css('z-index', z);
				z = z + (reverse ? 1 : -1);
				i++;
			}
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
				var methodResponse = obj[method].apply(obj, args);
				
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