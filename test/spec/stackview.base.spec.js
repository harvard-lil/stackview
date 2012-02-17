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
				}, 'pageload event not firing', 5000);
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
		
		describe('with AJAX loaded data', function() {
			it('needs specs', function() {
				expect('implemented').toBeFalsy();
			});
		});
	});
	
	describe('#next_page()', function() {
		describe('data source independent behavior', function() {
			it('needs specs', function() {
				expect('implemented').toBeFalsy();
			});
		});
		
		describe('with static inline data', function() {
			beforeEach(function() {
				$stack.stackview({
					data: inlineData
				});
				spyOnEvent($stack, 'stackview.pageload');
			});
			
			it('should do nothing', function() {
				$stack.stackview('next_page');
				expect('stackview.pageload').not.toHaveBeenTriggeredOn($stack);
			});
		});
	});
});