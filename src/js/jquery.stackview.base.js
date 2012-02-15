/*!
	Stack View - The jQuery virutal stack plugin
	by The Harvard Library Innovation Lab
	
	Dual licensed under MIT and GPL.
*/
(function($, window, document, undefined) {
	var plugin = 'stackview',
	    StackView,
	    events;
	
	events = {
		init: 'stackview.init',
		page_load: 'stackview.pageload'
	};
	
	/*
	   PRIVATE
	*/
	
	var get_heat = function(scaled_value) {
		return scaled_value === 100 ? 10 : Math.floor(scaled_value / 10);
	};





	/*
	   PUBLIC
	*/
	
	/* StackView constructor, set up instance properties and call init. */
	StackView = function(elem, opts) {
		this.element = elem;
		this.$element = $(elem);
		this.options = $.extend({}, this.defaults, opts);
		this.init();
	};
	
	/* The defaults are a static property of the class. */
	$.extend(StackView, {
		defaults: {
			url: 'basic.json',
			data: '',
			jsonp: false,
			books_per_page: 10,
			threshold: 1000,
			page_multiple: 0.11,
			height_multiple: 12,
			search_type: 'keyword',
			query: '',
			ribbon: 'Stack View',
			
			min_pages: 200,
			max_pages: 540,
			min_book_height: 20,
			max_book_height: 39,
			cache_ttl: 60,
			
			selectors: {
				item_list: '.stack-items',
				ribbon: '.ribbon-body'
			}
		}
	});
	
	/* StackView public methods */
	$.extend(true, StackView.prototype, {
		init: function() {
//			this.$element.html(tmpl(StackView.templates.scroller, {}))
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
	$.fn[plugin] = function(arg) {
		var response;
		
		this.each(function(el) {
			var $el = $(el),
			    obj = $(el).data('stackviewObject');
			
			if (!obj) {
				$el.data('stackviewObject', new StackView(el, arg));
			}
			else if (obj[arg]) {
				var methodResponse = obj[arg].apply(
					obj,
					Array.prototype.slice.call(arguments, 1)
				);
				
				if (response === undefined && methodResponse !== undefined) {
					response = methodResponse;
				}
			}
		});
		
		return response === undefined ? this : response;
	};
	
	window.StackView = StackView;
})(jQuery, window, document);