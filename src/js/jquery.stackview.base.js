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
	   PRIVATE
	*/
	
	/*
	   #get_heat(number)
	
	   Takes a value between 0 and 100 and returns a number to be used with
	   heat classes to indicate popularity.
	*/
	utils.get_heat = function(scaled_value) {
		return scaled_value === 100 ? 10 : Math.floor(scaled_value / 10) + 1;
	};
	
	/*
	   #get_height(StackView, object)
	
	   Takes a StackView instance and a book object. Returns a normalized
	   book height, taking into account the minimum height, maximum height,
	   and height multiple.
	*/
	utils.get_height = function(stack, book) {
		var height = parseInt(book.measurement_height_numeric, 10),
		    min = stack.options.min_book_height,
		    max = stack.options.max_book_height,
		    multiple = stack.options.height_multiple;
		
		height = Math.min(Math.max(height, min), max) * multiple;
		return height + 'px';
	};
	
	/*
	   #get_thickness(StackView, object)
	
	   Takes a StackView instance and a book object. Returns a normalized
	   book thickness using the number of book pages, taking into account
	   the minimum pages, maximum pages, and pages multiple.
	*/
	utils.get_thickness = function(stack, book) {
		var thickness = parseInt(book.measurement_page_numeric, 10),
		    min = stack.options.min_pages,
		    max = stack.options.max_pages,
		    multiple = stack.options.pages_multiple;
		
		thickness = Math.min(Math.max(thickness, min), max) * multiple;
		return thickness + 'px';
	};
	
	/*
	   #normalize_link(object)
	
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
	   #get_author(object)
	
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
	   Takes a StackView instance and array of result items.  Renders a
	   DOM element for each of the items and appends it to the stack's
	   item list.
	*/
	utils.render_items = function(stack, docs) {
		var $list = stack.$element.find(stack.options.selectors.item_list);
		
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
			$list.append($item);
		});
	};





	/*
	   PUBLIC
	*/
	
	/* StackView constructor, set up instance properties and call init. */
	StackView = function(elem, opts) {
		this.element = elem;
		this.$element = $(elem);
		this.options = $.extend({}, StackView.defaults, opts);
		this.page = 0;
		this.finished = false;
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
			page_multiple: 0.11,
			height_multiple: 12,
			search_type: 'keyword',
			query: '',
			ribbon: 'Stack View',
			
			min_pages: 200,
			max_pages: 540,
			min_item_height: 20,
			max_item_height: 39,
			cache_ttl: 60,
			
			selectors: {
				item: '.stack-item',
				item_list: '.stack-items',
				ribbon: '.ribbon-body'
			}
		}
	});
	
	/* StackView public methods */
	$.extend(true, StackView.prototype, {
		
		/*
		   #init()
		
		   Sets up the initial states of a stack.  Including:
		     - Creating the HTML skeleton.
		     - Loading the first page.
		     - Firing the init event.
		*/
		init: function() {
			this.$element.html(tmpl(StackView.templates.scaffold, {
				ribbon: this.options.ribbon
			}));
			
			this.next_page();
			this.$element.trigger(events.init);
		},
		
		/*
		   #next_page()
		
		   Loads the next page of stack items.  If we've already hit the
		   last page, this function does nothing.
		*/
		next_page: function(arg) {
			if (this.finished) return;
			
			if (this.options.data) {
				utils.render_items(this, this.options.data.docs);
				this.finished = true;
				this.$element.trigger(events.page_load);
			}
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
				$el.data('stackviewObject', new StackView(el, method));
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