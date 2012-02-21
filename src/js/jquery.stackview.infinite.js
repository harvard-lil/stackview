(function($, undefined) {
	var $d = $(document),
	    infinite;
	
	$.extend(StackView.defaults, {
		infiniteScrollDistance: 100
	});
	
	infinite = function(event) {
		var $stack = $(event.target),
		    stack = $stack.data('stackviewObject'),
		    $items, opts, lastItemTop, triggerPoint, scrollCheck;
		
		if (!stack) return;
		
		opts = stack.options;
		$items = $stack.find(opts.selectors.item_list);
		lastItemTop = $items.find(opts.selectors.item).last().position().top;
		lastItemTop += $items.scrollTop();
		triggerPoint = lastItemTop - $stack.height() - opts.infiniteScrollDistance;
		
		scrollCheck = function() {
			if ($items.scrollTop() >= triggerPoint) {
				$items.unbind('scroll.stackview', scrollCheck);
				$stack.stackview('next_page');
			}
		};
		
		$items.bind('scroll.stackview', scrollCheck);
		scrollCheck();
	};
	
	$d.delegate('.stackview', 'stackview.pageload', infinite);
})(jQuery);