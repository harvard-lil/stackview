/*!
	Stack View - The jQuery virutal stack plugin
	by The Harvard Library Innovation Lab
	
	Dual licensed under MIT and GPL.
*/
(function($, window, document, undefined) {
	var plugin = 'stackview',
	    StackView,
	    uid = +new Date(),
	    offset = 0;
	
	/*
	   PRIVATE
	*/
	
	var get_heat = function(scaled_value) {
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
	};





	var render_page = function(that, elem, data, params, mode, done) {
		var rstart = parseInt(data.start, 10) + parseInt(data.limit, 10);
		var roffset = data.num_found - data.start - data.limit;
		
		if(roffset <= 0) {
			roffset = -1;
		}
		if((!data.docs || !data.docs.length) && data.start !== 0) {
			that.$element
				.find(this.options.selectors.scrollerPage)
				.find('ul:last')
				.after(tmpl(StackView.templates.bookEnd, {}));
			done(false);
			return;
		}

		data.start = rstart;

		stackCache.set(params, data, that.options.cache_ttl); // cache set to 60 seconds, increase for production use!
		var books = $.extend([], data.docs);

		var $stack = $(tmpl(StackView.templates.emptyStack, {}));


		if(that.options.search_type !== 'loc_sort_order') {
			that.$wrapper.find(that.options.selectors.numFound)
				.html(data.num_found)
				.removeClass(that.options.classes.empty);
		} else {
			that.$wrapper.find(that.options.selectors.numFound)
				.html('')
				.addClass(that.options.classes.empty);
		}

		// This probably shouldn't be necessary!
		$.each(books, function (i, v) {
			if(!v.title) {
				v.title = 'NULL';
			}

			var pages = '';
			if(v.measurement_page_numeric) {
				pages = v.measurement_page_numeric;
			}
			if(pages === "" || pages < that.options.min_pages || !pages) {
				pages = that.options.min_pages;
			}
			if(pages > that.options.max_pages) {
				pages = that.options.max_pages;
			}

			var height = '';
			if(v.measurement_height_numeric) {
				height = v.measurement_height_numeric;
			}
			if(height === "" || height < that.options.min_height || !height) {
				height = that.options.min_height;
			}
			if(height > that.options.max_height) {
				height = that.options.max_height;
			}

			var pub_date = '';
			if(v.pub_date) {
				pub_date = v.pub_date;
			}

			var anchor = false;

			if(parseInt(v.loc_sort_order, 10) === parseInt(that.options.loc_sort_order, 10) && mode === 'center') {
				anchor = true;
			}

			var creator = '';
			if(v.creator && v.creator.length > 0) {
				creator = v.creator[0];
				if(/^([^,]*)/.test(creator)) {
					creator = creator.match(/^[^,]*/);
				}
			}

			//workaround for link construction from LibraryCloud
			if(v.title_link_friendly) {
				v.link = '../shelflife/book/' + v.title_link_friendly + '/' + v.id;
			}

			$stack.append(tmpl(StackView.templates.book, {
				anchor: anchor,
				heat: get_heat(v.shelfrank),
				bookHeight: height * that.options.height_multiple,
				bookWidth: pages * that.options.page_multiple,
				link: v.link,
				title: v.title,
				author: creator,
				year: pub_date
			}));

		});

		elem.empty().attr('id', 'stackview' + uid++) // stack-view.js workaround
			.data('scroller', data).append($stack);

		if(parseInt(data.start, 10) < 0) {
			that.$element
				.find(that.options.selectors.scrollerPage)
				.find('ul:last')
				.after(tmpl(StackView.templates.bookEnd, {}));
			that.$element
				.find(that.options.selectors.scrollerLoadingNext)
				.remove();
			that.$element.infiniteScroller();
			return;
		}else {
			done(elem);
		}
	};





	var get_page = function (that, elem, loc_sort_order, mode, offset, query, done) {
		var is_sort_order = that.options.search_type === 'loc_sort_order',
		num_books = that.options.books_per_page  * 0.5;
		
		if(is_sort_order && mode === 'downstream') {
			that.options.query = '[' + loc_sort_order + '%20TO%20' + (loc_sort_order + num_books) + ']';
		}
		if(is_sort_order && mode === 'upstream') {
			that.options.query = '[' + (loc_sort_order - num_books) + '%20TO%20' + loc_sort_order + ']';
		}
		if(is_sort_order && mode === 'center') {
			that.options.query = '[' + (loc_sort_order - 6) + '%20TO%20' + (loc_sort_order + num_books - 6) + ']';
		}

		var params = $.param({
			id: that.options.id,
			limit: that.options.books_per_page * (mode !== 'center' ? 1 : 0.5),
			mode: mode,
			query: that.options.query,
			start: offset,
			search_type: that.options.search_type
		}),
		tmp = stackCache.get(params);

		if(tmp) {
			render_page(that, elem, tmp, params, mode, done);
		} else {
			var ext = that.options.url.split('.').pop();
			if(that.options.data !== '') {
				render_page(that, elem, that.options.data, params, mode, done);
			} else if(that.options.jsonp && ext !== 'json') {
				var geturl = that.options.url;
				if(geturl.indexOf("?") !== -1) {
					geturl += '&callback=?';
				}
				else {
					geturl += '?callback=?';
				}
				$.getJSON(geturl, params, function(data) {
					render_page(that, elem, data, params, mode, done);
				});
			} else {
				$.getJSON(that.options.url, params, function(data) {
					render_page(that, elem, data, params, mode, done);
				});
			}
		}
	};




	/*
	   PUBLIC
	*/
	StackView = function(elem, opts) {
		this.element = elem;
		this.$element = $(elem);
		this.$wrapper = $('<div id="' + $.element.id + '-wrapper" />');
		this.options = $.extend({}, this.defaults, opts);
		this.init(opts === false);
	};
	
	$.extend(true, StackView.prototype, {
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
			
			mousewheel_multiple: 75,
			stream_height: 475,
			min_pages: 200,
			max_pages: 540,
			min_height: 20,
			max_height: 39,
			cache_ttl: 60,
			
			classes: {
				scroller: 'scroller',
				empty: 'empty'
			},
			
			selectors: {
				upstream: '.upstream',
				downstream: '.downstream',
				scrollerPage: '.scroller-page',
				numFound: '.num-found span',
				scrollerLoadingNext: '.scroller-loading-next'
			}
		},
		
		init: function(destroy) {
			var that = this,
			    data = this.$element.data('scroller');
			
			if(destroy) {
				this.$element.unbind('.infiniteScroller');
				this.$element.replaceWith(data.clone);
				return;
			}
			
			this.$element
				.addClass(this.options.classes.scroller)
				.html(tmpl(StackView.templates.scroller, {}))
				.wrap(this.$wrapper)
				.bind('mousewheel', function(event, delta) {
					$(this).trigger('move-by', -delta * this.options.mousewhel_multiple);
					return false;
				});

			this.$wrapper
				.prepend(tmpl(StackView.templates.ribbon, {
					ribbon: this.options.ribbon
				}))
				.prepend(tmpl(StackView.templates.navigation, {}))
				.delegate(this.options.selectors.upstream, 'click', function() {
					that.$element.trigger('move-by', -that.options.stream_height);
					return false;
				})
				.delegate(this.options.selectors.downstream, 'click', function() {
					that.$element.trigger('move-by', that.options.stream_height);
					return false;
				});
			
			if(!data) {
        this.$element.data('scroller', data = {
          clone: this.$element.clone(),
          options: this.options
        });
      }

			if(this.options.search_type === 'loc_sort_order') {
				get_page(this, this.$element.find(this.options.selectors.scrollerPage), parseFloat(this.options.loc_sort_order), 'center', 0, '', function () {

					that.$element.infiniteScroller({
						search_type: that.options.search_type,
						axis: that.options.axis,
						threshold: that.options.threshold,
						fetch: function (dir, done) {
							var data = this.data('scroller'),
							mode = dir === 1 ? 'downstream' : 'upstream',
							loc_sort_order = data.docs[dir === 1 ? data.docs.length - 1 : 0].loc_sort_order[0] + 1;

							get_page(
								that,
								$('<div/>').appendTo('body'), // appendTo is a stack-view.js workaround
								loc_sort_order, mode, offset, that.options.query, done
							);
						},
						pagechange: function (prev) {
							var books = this.data('scroller').docs;
							data.loc_sort_order = books[parseInt(books.length / 2, 10)].loc_sort_order[0];
						}
					});
				});
			} else {
				get_page(that, that.$element.find(that.options.selectors.scrollerPage), that.options.id, 'downstream', 0, that.options.query, function () {

					that.$element.infiniteScroller({
						search_type: that.options.search_type,
						axis: that.options.axis,
						threshold: that.options.threshold,
						fetch: function (dir, done) {
							var data = this.data('scroller'),
							mode = 'downstream',
							id = that.options.id,
							query = that.options.query,
							offset = data.start;

							get_page(
								that,
								$('<div/>').appendTo('body'), // appendTo is a stack-view.js workaround
								id, mode, offset, query, done
							);
						}
					});
				});
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