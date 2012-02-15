var opts = StackView.defaults;

describe('StackView Base', function() {
	var $stack,
	    returned;
	
	beforeEach(function() {
		loadFixtures('default.html');
		$stack = $('#stack');
		spyOnEvent($stack, 'stackview.init');
	});
	
	describe('#init()', function() {
		beforeEach(function() {
			spyOnEvent($stack, 'stackview.init');
			spyOnEvent($stack, 'stackview.pageload');
		});
		
		describe('data source independent behaviors', function() {
			beforeEach(function() {
				returned = $stack.stackview({
					data: inlineData // defined in mocks/static.js
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
			
			it('should fire a pageloaded event', function() {
				expect('stackview.pageload').toHaveBeenTriggeredOn($stack);
			});

			it('should return the jQuery object for chaining', function() {
				expect(returned).toEqual($stack);
			});
		})
		
		describe('with static inline data', function() {
			beforeEach(function() {
				
				returned = $stack.stackview({
					data: inlineData // defined in mocks/static.js
				});
			});
			
			it('should render all the items in the docs array', function() {
				var stackLength = $stack.find(opts.selectors.item).length;
				expect(stackLength).toEqual(inlineData.docs.length);
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
			it('needs specs', function() {
				expect('implemented').toBeFalsy();
			});
		});
	});
});