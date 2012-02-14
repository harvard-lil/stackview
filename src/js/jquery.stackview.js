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
	
	StackView = function(elem, opts) {
		this.element = elem;
		this.$element = $(elem);
		this.$wrapper = $('<div id="' + $.element.id + '-wrapper" />');
		this.init();
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
			ribbon: 'Stack View'
		},
		
		init: function(opts) {
			var that = this,
			    data = this.$element.data('scroller');
			
			this.options = $.extend({}, this.defaults, opts);
			
			this.$element
				.addClass('scroller')
				.html(tmpl(StackView.templates.scroller, {}))
				.wrap(this.$wrapper)
				.bind('mousewheel', function(event, delta) {
					$(this).trigger('move-by', -delta * 75);
					return false;
				});

			this.$wrapper
				.prepend(tmpl(StackView.templates.ribbon, {
					ribbon: this.options.ribbon
				}))
				.prepend(tmpl(StackView.templates.navigation, {}))
				.delegate('.upstream', 'click', function() {
					that.$element.trigger('move-by', -475);
					return false;
				})
				.delegate('.downstream', 'click', function() {
					that.$element.trigger('move-by', 475);
					return false;
				});
			
			if(opts === false) {
				// Destroy!
				this.$element.unbind('.infiniteScroller');
				this.$element.replaceWith(data.clone);
				return;
			}
			
			if(!data) {
        this.$element.data('scroller', data = {
          clone: this.$element.clone(),
          options: opts
        });
      }
			
			function get_page(elem, loc_sort_order, mode, offset, query, done) {
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
					render_page(tmp);
				} else {
					var ext = that.options.url.split('.').pop();
					if(that.options.data !== '') {
						render_page(that.options.data);
					} else if(that.options.jsonp && ext !== 'json') {
						var geturl = that.options.url;
						if(geturl.indexOf("?") !== -1) {
							geturl += '&callback=?';
						}
						else {
							geturl += '?callback=?';
						}
						$.getJSON(geturl, params, render_page);
					} else {
						$.getJSON(that.options.url, params, function(data) {
							render_page(data);
						});
					}
				}

				function render_page(data) {
					var rstart = parseInt(data.start, 10) + parseInt(data.limit, 10);
					var roffset = data.num_found - data.start - data.limit;
					
					if(roffset <= 0) {
						roffset = -1;
					}
					if((!data.docs || !data.docs.length) && data.start !== 0) {
						that.$element.find('.scroller-page ul:last').after('<div class="book-end" />');
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

					if(that.options.search_type !== 'loc_sort_order') {
						that.$wrapper.find('.num-found').html(data.num_found + '<br />items').removeClass('empty');
					} else {
						that.$wrapper.find('.num-found').html('').addClass('empty');
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
						if(pages === "" || pages < 200 || !pages) {
							pages = 200;
						}
						if(pages > 540) {
							pages = 540;
						}

						var height = '';
						if(v.measurement_height_numeric) {
							height = v.measurement_height_numeric;
						}
						if(height === "" || height < 20 || !height) {
							height = 20;
						}
						if(height > 39) {
							height = 39;
						}

						var pub_date = '';
						if(v.pub_date) {
							pub_date = v.pub_date;
						}

						var home = '';

						if(parseInt(v.loc_sort_order, 10) === parseInt(that.options.loc_sort_order, 10) && mode === 'center') {
							home = ' anchorbook';
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
							home: home,
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
						that.$element.find('.scroller-page ul:last').after('<div class="book-end" />');
						that.$element.find('.scroller-loading-next').remove();
						that.$element.infiniteScroller();
						return;
					}else {
						done(elem);
					}
				}
			}
			
			if(this.options.search_type === 'loc_sort_order') {
				get_page(this.$element.find('.scroller-page'), parseFloat(this.options.loc_sort_order), 'center', 0, '', function () {

					that.$element.infiniteScroller({
						search_type: that.options.search_type,
						axis: that.options.axis,
						threshold: that.options.threshold,
						fetch: function (dir, done) {
							var data = this.data('scroller'),
							mode = dir === 1 ? 'downstream' : 'upstream',
							loc_sort_order = data.docs[dir === 1 ? data.docs.length - 1 : 0].loc_sort_order[0] + 1;

							get_page(
								$('<div/>').appendTo('body'), // appendTo is a stack-view.js workaround
								loc_sort_order, mode, offset, that.options.query, done
							);
						},
						pagechange: function (prev) {
							var books = this.data('scroller').docs;
							data.loc_sort_order = books[parseInt(books.length / 2)].loc_sort_order[0];
						}
					});
				});
			} else {
				get_page(that.$element.find('.scroller-page'), that.options.id, 'downstream', 0, that.options.query, function () {

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
					Array.prototype.slice.call(arguments), 1
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