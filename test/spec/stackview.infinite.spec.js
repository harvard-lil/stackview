var opts = StackView.defaults,
    height = 300;

describe('Stack View Infinite Scroll', function() {
	var $stack,
	    loadCount,
	    $items;
	
	beforeEach(function() {
		runs(function() {
			loadFixtures('default.html');
			loadCount = 0;
			$stack = $('#stack')
				.css('height', height)
				.bind('stackview.pageload', function() {
					loadCount++;
				})
				.stackView({
					url: 'mocks/json.php'
				});
			$items = $stack.find(opts.selectors.item_list);
		});
		
		waitsFor(function() {
			return loadCount === 1;
		}, 'first load', 5000);
	});
	
	it('should load next page if user scrolls near the bottom', function() {
		var lastItemTop = $stack.find(opts.selectors.item).last().position().top,
		    stackHeight = $stack.height(),
		    distance = opts.infiniteScrollDistance,
		    triggerPoint = lastItemTop - stackHeight - distance;
		
		runs(function() {
			$items.scrollTop(triggerPoint - 1);
		});
		
		waits(1500);
		
		runs(function() {
			expect(loadCount).toEqual(1);
			$items.scrollTop(triggerPoint);
		});
		
		waitsFor(function() {
			return loadCount === 2;
		}, 'next page to load due to scroll', 5000);
	});
	
	it('should not load a second page if crossing the threshold twice quickly', function() {
		runs(function() {
			$items.scrollTop(9999);
		});
		
		waits(50);
		
		runs(function() {
			$items.scrollTop(0);
		});
		
		waits(50);
		
		runs(function() {
			$items.scrollTop(9999);
		});
		
		waitsFor(function() {
			return loadCount === 2;
		}, 'next page to load due to scroll', 5000);
		
		waits(1500);
		
		runs(function() {
			expect(loadCount).toEqual(2);
		});
	});
});