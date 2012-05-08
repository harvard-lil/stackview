var opts = StackView.defaults;

describe('Stack View Mini Stack', function() {
	var $stack;

	beforeEach(function() {
		loadFixtures('default.html');
		$('#stack').css('width', opts.ministack.breakpoint);
		$stack = $('#stack').stackView({
			data:inlineData
		});
	});
	
	it('should add the ministack class to the stack element', function() {
		expect($stack).toHaveClass(opts.classes.ministack);
	});

	it('should not add the ministack class to larger elements', function() {
		loadFixtures('default.html');
		$stack = $('#stack').stackView({
			data:inlineData
		});
		expect($stack).not.toHaveClass(opts.classes.ministack);
	});

	it('should use the ministack page multiplier for books', function() {
		var stack = $stack.data('stackviewObject');
		expect(stack.options.book.page_multiple).toEqual(opts.ministack.page_multiple);
	});

	it('should use the ministack min height percentage for books', function() {
		var stack = $stack.data('stackviewObject');
		expect(stack.options.book.min_height_percentage).toEqual(opts.ministack.min_height_percentage);
	});

	it('should use the ministack max height percentage for books', function() {
		var stack = $stack.data('stackviewObject');
		expect(stack.options.book.max_height_percentage).toEqual(opts.ministack.max_height_percentage);
	});
});