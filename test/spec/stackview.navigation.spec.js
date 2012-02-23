var opts = StackView.defaults;

describe('Stack View Navigation', function() {
	var distance, $stack, $up, $down, $num, $items;
	
	beforeEach(function() {
		loadFixtures('default.html');
		$stack = $('#stack').stackView({
			data: inlineData
		});
		$up = $stack.find(opts.selectors.upstream);
		$down = $stack.find(opts.selectors.downstream);
		$num = $stack.find(opts.selectors.num_items);
		$items = $stack.find(opts.selectors.item_list);
		distance = $stack.height() * opts.navigationPercent / 100;
	});
	
	it('should inject the navigation structure into the stack', function() {
		expect($up).toExist();
		expect($down).toExist();
		expect($num).toExist();
	});
	
	it('should fill in the number of found items', function() {
		expect($num).toHaveText('50');
	});
	
	it('should scroll down on downstream click', function() {
		runs(function() {
			$down.click();
		});
		
		waits(opts.transitionDuration + 100);
		
		runs(function() {
			expect($items.scrollTop()).toEqual(distance);
		});
	});
	
	it('should scroll up on upstream click', function() {
		runs(function() {
			$down.click();
			$down.click();
		});
		
		waits(opts.transitionDuration * 2 + 100);
		
		runs(function() {
			expect($items.scrollTop()).toEqual(distance * 2);
			$up.click();
		});
		
		waits(opts.transitionDuration + 100);
		
		runs(function() {
			expect($items.scrollTop()).toEqual(distance);
		});
	});
});