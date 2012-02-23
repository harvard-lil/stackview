/*
   Stack View infinite scroll module:

   This module uses the scroll position of a stack to determine when
   to fire the base methods of next_page and prev_page.
*/
(function($, undefined) {
	var $d = $(document),
	    infinite;
	
	/* Extend defaults */
	$.extend(StackView.defaults, {
		infiniteScrollDistance: 100
	});
	
	infinite = function(event) {
		var $stack = $(event.target),
		    stack = $stack.data('stackviewObject'),
		    $items, opts, lastItemTop, triggerPoint, downCheck, upCheck;
		
		if (!stack) return; // See if this can be removed now
		
		opts = stack.options;
		$items = $stack.find(opts.selectors.item_list);
		lastItemTop = $items.find(opts.selectors.item).last().position().top;
		lastItemTop += $items.scrollTop();
		triggerPoint = lastItemTop - $stack.height() - opts.infiniteScrollDistance;
		
		downCheck = function() {
			if ($items.scrollTop() >= triggerPoint) {
				$items.unbind('scroll.stackview', downCheck);
				$stack.stackView('next_page');
			}
		};
		
		upCheck = function() {
			if ($items.scrollTop() <= opts.infiniteScrollDistance) {
				$items.unbind('scroll.stackview', upCheck);
				$stack.stackView('prev_page');
			}
		}
		
		$items.bind('scroll.stackview', downCheck);
		$items.bind('scroll.stackview', upCheck);
		downCheck();
		upCheck();
	};
	
	$d.delegate('.stackview', 'stackview.pageload', infinite);
})(jQuery);