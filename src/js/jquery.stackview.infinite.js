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
		    opts = stack.options,
		    $items, opts, lastItemTop, triggerPoint, scrollCheck;

		$items = $stack.find(opts.selectors.item_list);
		lastItemTop = $items.find(opts.selectors.item).last().position().top;
		lastItemTop += $items.scrollTop();
		triggerPoint = lastItemTop - $stack.height() - opts.infiniteScrollDistance;
		
		scrollCheck = function() {
			if (opts.search_type === 'loc_sort_order' &&
			    $items.scrollTop() <= opts.infiniteScrollDistance) {
				$items.unbind('scroll.stackview');
				$stack.stackView('prev_page');
			}
			else if ($items.scrollTop() >= triggerPoint) {
				$items.unbind('scroll.stackview');
				$stack.stackView('next_page');
			}
		};
		
		$items.bind('scroll.stackview', scrollCheck);
		scrollCheck();
	};
	
	$d.delegate('.stackview', 'stackview.pageload', infinite);
})(jQuery);