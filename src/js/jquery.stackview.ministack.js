(function($, undefined) {
	var $d = $(document),
	    StackView = window.StackView;

	$.extend(true, StackView.defaults, {
		classes: {
			ministack: 'stackview-mini'
		},

		ministack: {
			breakpoint: 220,
			max_height_percentage: 100,
			min_height_percentage: 80,
			page_multiple: .08
		}
	});

	$d.delegate('.stackview', 'stackview.init', function(event) {
		var $stack = $(event.target),
		    stack = $stack.data('stackviewObject');

		if ($stack.width() <= stack.options.ministack.breakpoint) {
			$stack.addClass(stack.options.classes.ministack);
			$.each([
				'max_height_percentage',
				'min_height_percentage',
				'page_multiple'
			], function(i, el) {
				stack.options.book[el] = stack.options.ministack[el];
			});
		}
	});
})(jQuery);