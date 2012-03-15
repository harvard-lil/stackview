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
		    $itemList, $items, opts, lastItemTop, triggerPoint, scrollCheck;

		$itemList = $stack.find(opts.selectors.item_list);
		$items = $stack.find(opts.selectors.item);

		lastItemTop = $items.length ? $items.last().position().top : 0;
		lastItemTop += $itemList.scrollTop();
		triggerPoint = lastItemTop - $stack.height() - opts.infiniteScrollDistance;
		
		scrollCheck = function() {
			if (opts.search_type === 'loc_sort_order' &&
			    $itemList.scrollTop() <= opts.infiniteScrollDistance) {
				$itemList.unbind('scroll.stackview');
				$stack.stackView('prev_page');
			}
			else if ($itemList.scrollTop() >= triggerPoint) {
				$itemList.unbind('scroll.stackview');
				$stack.stackView('next_page');
			}
		};
		
		$itemList.bind('scroll.stackview', scrollCheck);
		scrollCheck();
	};
	
	$d.delegate('.stackview', 'stackview.pageload', infinite);
})(jQuery);