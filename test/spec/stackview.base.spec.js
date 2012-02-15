var opts = StackView.defaults;

describe('StackView Base', function() {
	var $stack;
	
	describe('#init()', function() {
		beforeEach(function() {
			loadFixtures('default.html');
			$stack = $('#stack');
			spyOnEvent($stack, 'stackview.init');
			$stack.stackview({
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
			expect('stackview.init').toBeHaveBeenTriggeredOn($stack);
		});
		
		it('should render the first page', function() {
			expect($stack.find(opts.selectors.item_list)).not.toBeEmpty();
		});
	});
	
	describe('options', function() {
		it('needs specs', function() {
			expect('implemented').toBeFalsy();
		});
	});
});