(function($, undefined) {
	var $d = $(document),
	    infinite;
	
	$.extend(StackView.defaults, {
		infiniteScrollDistance: 100
	});
	
	infinite = function(event) {
		var $stack = $(event.target),
		    stack = $stack.data('stackviewObject'),
		    $items, opts, lastItemTop, triggerPoint, downCheck, upCheck;
		
		if (!stack) return;
		
		opts = stack.options;
		$items = $stack.find(opts.selectors.item_list);
		lastItemTop = $items.find(opts.selectors.item).last().position().top;
		lastItemTop += $items.scrollTop();
		triggerPoint = lastItemTop - $stack.height() - opts.infiniteScrollDistance;
		
		downCheck = function() {
			if ($items.scrollTop() >= triggerPoint) {
				$items.unbind('scroll.stackview', downCheck);
				$stack.stackview('next_page');
			}
		};
		
		upCheck = function() {
			if ($items.scrollTop() <= opts.infiniteScrollDistance) {
				$items.unbind('scroll.stackview', upCheck);
				$stack.stackview('prev_page');
			}
		}
		
		$items.bind('scroll.stackview', downCheck);
		$items.bind('scroll.stackview', upCheck);
		scrollCheck();
	};
	
	$d.delegate('.stackview', 'stackview.pageload', infinite);
})(jQuery);