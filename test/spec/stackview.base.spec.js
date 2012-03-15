var opts = StackView.defaults;
var item = {
	title: "Lorem Ipsum",
	creator: [ "Cicero" ],
	measurement_page_numeric: 345,
	measurement_height_numeric: 33,
	shelfrank: 50,
	pub_date: 1997,
	link: "http://www.example.org"
};
// "inlineData" defined in mocks/static.js

// Helper, adapted from:
// http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
function scrollbarWidth() { 
	var div = $('<div style="width:50px;height:50px;overflow:scroll;position:absolute;top:-200px;left:-200px;"><div style="height:10px;"></div>');
	$('body').append(div); 
	var x = div.innerWidth() - $('div', div).innerWidth();
	div.remove(); 
	return x; 
}

describe('Stack View Base', function() {
	var $stack,
	    returned;
	
	beforeEach(function() {
		loadFixtures('default.html');
		$stack = $('#stack');
	});
	
	describe('#init(options)', function() {
		beforeEach(function() {
			spyOnEvent($stack, 'stackview.init');
		});
		
		describe('data source independent behaviors', function() {
			var pageload_fired;
			
			beforeEach(function() {
				pageload_fired = false;
				$stack.bind('stackview.pageload', function() {
					pageload_fired = true;
				});
				returned = $stack.stackView({
					data: inlineData
				});
			});
			
			it('should construct the empty DOM scaffolding', function() {
				expect($stack.find(opts.selectors.item_list)).toExist();
			});

			it('should fill in ribbon text', function() {
				expect($stack.find(opts.selectors.ribbon)).toHaveText(opts.ribbon);
			});

			it('should fire the init event', function() {
				expect('stackview.init').toHaveBeenTriggeredOn($stack);
			});
			
			it('should fire a pageload event (async)', function() {
				waitsFor(function() {
					return pageload_fired;
				}, 'pageload event to fire', 5000);
			});
			
			it('should add a stackview class to the element for style scoping', function() {
				expect($stack).toHaveClass('stackview');
			});

			it('should return the jQuery object for chaining', function() {
				expect(returned).toEqual($stack);
			});
		})
		
		describe('with static inline data', function() {
			beforeEach(function() {
				$stack.stackView({
					data: inlineData // defined in mocks/static.js
				});
			});
			
			it('should render all the items in the docs array', function() {
				var stackLength = $stack.find(opts.selectors.item).length;
				expect(stackLength).toEqual(inlineData.docs.length);
			});
		});
		
		describe('with AJAX/PHP loaded data', function() {
			beforeEach(function() {
				$stack.stackView({
					url: 'mocks/json.php'
				});
			});
			
			it('should load the first page', function() {
				waitsFor(function() {
					return $stack.find(opts.selectors.item).length;
				}, 'items to render', 5000);
				
				runs(function() {
					expect($stack.find(opts.selectors.item).length).toEqual(opts.items_per_page);
				});
			});
		});
	});
	
	describe('#next_page()', function() {
		describe('data source independent behavior', function() {
			it('should return the jQuery object for chaining', function() {
				$stack.stackView({
					data: inlineData
				});
				expect($stack.stackView('next_page')).toEqual($stack);
			});
		});
		
		describe('with static inline data', function() {
			beforeEach(function() {
				$stack.stackView({
					data: inlineData
				});
				spyOnEvent($stack, 'stackview.pageload');
			});
			
			it('should do nothing', function() {
				var oldLength = $stack.find(opts.selectors.item);
				
				$stack.stackView('next_page');
				expect($stack.find(opts.selectors.item)).toEqual(oldLength);
				expect('stackview.pageload').not.toHaveBeenTriggeredOn($stack);
			});
		});
		
		describe('with AJAX/PHP loaded data', function() {
			var ipp = 13,
			    loadCount;
			
			beforeEach(function() {
				loadCount = 0;
				$stack.stackView({
					url: 'mocks/json.php',
					items_per_page: ipp
				});
				$stack.bind('stackview.pageload', function() {
					loadCount++;
				});
			});
			
			it('should fire the pageload event', function() {
				$stack.stackView('next_page');
				waitsFor(function() {
					return loadCount === 2;
				}, 'pageload event to fire', 5000);
			});
			
			it('should load the next page of items', function() {
				runs(function() {
					$stack.stackView('next_page');
				});
				
				waitsFor(function() {
					return loadCount == 2;
				}, 'the next page to load', 5000);
				
				runs(function() {
					expect($stack.find(opts.selectors.item).length).toEqual(ipp * 2);
				});
			});
			
			it('should stop at the end', function() {
				runs(function() {
					$stack.stackView('next_page'); // 26
					$stack.stackView('next_page'); // 39
					$stack.stackView('next_page'); // end (50)
				});
				
				waitsFor(function() {
					return loadCount === 4;
				}, 'all pages to load', 5000);
				
				runs(function() {
					expect($stack.find(opts.selectors.item).length).toEqual(50);
					$stack.stackView('next_page'); // do nothing!
				});
				
				waits(1500);
				
				runs(function() {
					expect(loadCount).toEqual(4);
				});
			});
			
			it('should insert placeholder element, remove on load', function() {
				waitsFor(function() {
					return loadCount === 1;
				}, 'init load to finish');
				
				runs(function() {
					$stack.stackView('next_page');
					expect($('.stackview-placeholder')).toExist();
				});
				
				waitsFor(function() {
					return loadCount === 2;
				}, 'second page to finish loading', 5000);
				
				runs(function() {
					expect($('.stackview-placeholder')).not.toExist();
				});
			});
		});
	});

	describe('#add(item)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
			spyOnEvent($stack, 'stackview.itemadded')
			$stack.stackView('add', item);
		});
		
		it('render the item at the end (bottom) of the stack', function() {
			var $last = $stack.find(opts.selectors.item).last();
			expect($last).toHaveData('stackviewItem', item);
		});
		
		it('should fire the item-added event', function() {
			expect('stackview.itemadded').toHaveBeenTriggeredOn($stack);
		});
		
		it('should return the jQuery object for chaining', function() {
			expect($stack.stackView('add', item)).toEqual($stack);
		});
	});
	
	describe('#add(index, item)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
		});
		
		it('should add the item at the specified index', function() {
			$stack.stackView('add', 8, item);
			var $element = $stack.find(opts.selectors.item).eq(8);
			expect($element).toHaveData('stackviewItem', item);
		});

		it('should add to the end if index === item-list length', function() {
			var length = $stack.find(opts.selectors.item).length;
			$stack.stackView('add', length, item);
			var $element = $stack.find(opts.selectors.item).eq(length);
			expect($element).toHaveData('stackviewItem', item);
		});
		
		it('should do nothing if index is negative or too large', function() {
			$stack.stackView('add', 51, item);
			$stack.stackView('add', -1, item);
			expect($stack.find(opts.selectors.item).length).toEqual(50);
		});
	});
	
	describe('#remove(index)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
		});
		
		it('should remove the item at the specified index', function() {
			var el = $stack.find(opts.selectors.item).get(8);
			$stack.stackView('remove', 8);
			expect($stack.find(opts.selectors.item).get(8)).not.toEqual(el);
		});
		
		it('should do nothing if index is out of bounds', function() {
			var el = $stack.find(opts.selectors.item).get(8);
			$stack.stackView('remove', -1);
			$stack.stackView('remove', 999);
			expect($stack.find(opts.selectors.item).get(8)).toEqual(el);
		});
		
		it('should fire the item-removed event, passing the item object', function() {
			var data = $stack.find(opts.selectors.item).eq(8).data('stackviewItem'),
			    param;
			
			runs(function() {
				$stack.bind('stackview.itemremoved', function(event, item) {
					param = item;
				});
				$stack.stackView('remove', 8);
			});
			
			waitsFor(function() {
				return param != null;
			}, 5000);
			
			runs(function() {
				expect(data).toEqual(param);
			});
		});
		
		it('should return the removed jQuery object', function() {
			var el = $stack.find(opts.selectors.item).get(8);
			expect($stack.stackView('remove', 8).get(0)).toEqual(el);
		});
	});
	
	describe('#remove(item)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
		});
		
		it('should remove the element corresponding to the item object', function() {
			var $el = $stack.find(opts.selectors.item).eq(8);
			$stack.stackView('remove', $el.data('stackviewItem'));
			expect($stack.find(opts.selectors.item).get(8)).not.toEqual($el.get(0));
		});
		
		it('should do nothing if the object is not in the stack', function() {
			var $el = $stack.find(opts.selectors.item).eq(8);
			$stack.stackView('remove', {});
			expect($stack.find(opts.selectors.item).get(8)).toEqual($el.get(0));
		});
	});

	describe('#remove(element)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
		});

		it('should remove the item corresponding to the element', function() {
			var $el = $stack.find(opts.selectors.item).eq(8);
			$stack.stackView('remove', $el.get(0));
			expect($stack.find(opts.selectors.item).get(8)).not.toEqual($el.get(0));
		});
	});

	describe('#remove(jQuery)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
		});

		it('should remove the item corresponding to the jQuery object', function() {
			var $el = $stack.find(opts.selectors.item).eq(8);
			$stack.stackView('remove', $el);
			expect($stack.find(opts.selectors.item).get(8)).not.toEqual($el.get(0));
		});
	});
	
	describe('#getData()', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
			$stack.stackView('add', item);
		});
		
		it('should return an array of all the item objects', function() {
			var data = $stack.stackView('getData');
			expect(data.length).toEqual(inlineData.docs.length + 1);
			expect(data[data.length - 1]).toEqual(item);
		});
	});
	
	describe('#zIndex(reverse?)', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({ data: inlineData });
		});
		
		it('should give items a z-index in descending order', function() {
			$stack.find(opts.selectors.item).eq(1).remove();
			$stack.stackView('zIndex');
			var $items = $stack.find(opts.selectors.item);
			for (var i = $items.length - 1, z = 0; i >= 0; i--, z++) {
				expect(parseInt($items.eq(i).css('z-index'), 10)).toEqual(z);
			}
		});

		it('should give items a z-index in ascending order if passed true', function() {
			$stack.stackView('zIndex', true);
			var $items = $stack.find(opts.selectors.item);
			for (var i = 0, len = $items.length; i < $items.length; i++) {
				expect(parseInt($items.eq(i).css('z-index'), 10)).toEqual(i);
			}
		});

		it('should return the jQuery object for chaining', function() {
			expect($stack.stackView('zIndex')).toEqual($stack);
		});
	});
});