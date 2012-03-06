/*
   Stack View navigation module

   Adds clickable navigation to scroll through the stack, as well as
   a # of items indicator.
*/
(function($, undefined) {
	var $d = $(document),
	    StackView = window.StackView;
	
	$.extend(true, StackView.defaults, {
		transitionDuration: 200,
		navigationPercent: 80,
		selectors: {
			downstream: '.downstream',
			upstream: '.upstream',
			num_items: '.num-found span'
		}
	});
	
	$d.delegate('.stackview', 'stackview.init', function(event) {
		var $stack = $(event.target),
		    stack = $stack.data('stackviewObject'),
		    $items = $stack.find(stack.options.selectors.item_list),
		    delta = $stack.height() * stack.options.navigationPercent / 100;
		
		$stack.prepend(tmpl(StackView.templates.navigation, {
			empty: stack.options.search_type === 'loc_sort_order'
		}));
		
		$stack
			.delegate(stack.options.selectors.downstream, 'click', function() {
				$items.animate({
					scrollTop: '+=' +  delta
				}, stack.options.transitionDuration);
				return false;
			})
			.delegate(stack.options.selectors.upstream, 'click', function() {
				$items.animate({
					scrollTop: '-=' +  delta
				}, stack.options.transitionDuration);
				return false;
			});
			
	}).delegate('.stackview', 'stackview.pageload', function(event, data) {
		var $stack = $(event.target),
		    stack = $stack.data('stackviewObject'),
		    num_found = data.num_found ? data.num_found : data.length;
		
		$stack.find(stack.options.selectors.num_items).text(num_found);
		
	}).delegate(
		'.stackview',
		'stackview.itemadded stackview.itemremoved',
		function(event) {
			var $stack = $(event.target),
			    stack = $stack.data('stackviewObject'),
			    $items = $stack.find(stack.options.selectors.item);
		
			if (stack.options.data) {
				$stack.find(stack.options.selectors.num_items).text($items.length);
			}
		}
	);
	
	
})(jQuery);