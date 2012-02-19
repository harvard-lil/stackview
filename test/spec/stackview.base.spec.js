var opts = StackView.defaults;
// "inlineData" defined in mocks/static.js

describe('StackView Base', function() {
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
				returned = $stack.stackview({
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

			it('should return the jQuery object for chaining', function() {
				expect(returned).toEqual($stack);
			});
		})
		
		describe('with static inline data', function() {
			beforeEach(function() {
				$stack.stackview({
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
				$stack.stackview({
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
			// NONE, YET
		});
		
		describe('with static inline data', function() {
			beforeEach(function() {
				$stack.stackview({
					data: inlineData
				});
				spyOnEvent($stack, 'stackview.pageload');
			});
			
			it('should do nothing', function() {
				var oldLength = $stack.find(opts.selectors.item);
				
				$stack.stackview('next_page');
				expect($stack.find(opts.selectors.item)).toEqual(oldLength);
				expect('stackview.pageload').not.toHaveBeenTriggeredOn($stack);
			});
		});
		
		describe('with AJAX/PHP loaded data', function() {
			var ipp = 13,
			    loadCount;
			
			beforeEach(function() {
				loadCount = 0;
				$stack.stackview({
					url: 'mocks/json.php',
					items_per_page: ipp
				});
				$stack.bind('stackview.pageload', function() {
					loadCount++;
				});
			});
			
			it('should fire the pageload event', function() {
				$stack.stackview('next_page');
				waitsFor(function() {
					return loadCount === 2;
				}, 'pageload event to fire', 5000);
			});
			
			it('should load the next page of items', function() {
				runs(function() {
					$stack.stackview('next_page');
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
					$stack.stackview('next_page'); // 26
					$stack.stackview('next_page'); // 39
					$stack.stackview('next_page'); // end (50)
				});
				
				waitsFor(function() {
					return loadCount === 4;
				}, 'all pages to load', 5000);
				
				runs(function() {
					expect($stack.find(opts.selectors.item).length).toEqual(50);
					$stack.stackview('next_page'); // do nothing!
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
					$stack.stackview('next_page');
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