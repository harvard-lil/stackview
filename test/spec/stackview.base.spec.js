var opts = StackView.defaults;
// "inlineData" defined in mocks/static.js

describe('Stack View Base', function() {
	var $stack,
	    returned;
	
	beforeEach(function() {
		loadFixtures('default.html');
		$stack = $('#stack');
	});
	
	describe('#init()', function() {
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
			
			it('should give heights to the items', function() {
				var height = $stack.find(opts.selectors.item).height(),
				    min = opts.min_pages * opts.page_multiple - 1,
				    max = opts.max_pages * opts.page_multiple + 1;
				
				expect(height).toBeGreaterThan(min);
				expect(height).toBeLessThan(max);
			});
			
			it('should give widths to the items', function() {
				var width = $stack.find(opts.selectors.item).width(),
				    min = opts.min_item_height * opts.height_multiple - 1,
				    max = opts.max_item_height * opts.height_multiple + 1;
				
				expect(width).toBeGreaterThan(min);
				expect(width).toBeLessThan(max);
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
					$stack.data('stackviewObject').options.beacon = true;
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
});