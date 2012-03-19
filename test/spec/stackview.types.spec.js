var opts = StackView.defaults;

var fakeType = {
	name: 'fake',

	match: function(item) {
		return item.format === 'fake'
	},

	adapter: function(item, options) {
		item.value = item.value.toUpperCase();
		return item;
	},

	template: '<li class="stack-item fake-item"><%= value %></li>'
};

var fakeItem = {
	format: 'fake',
	value: 'I am a fake item.'
};

/*
   Register the type once, rather than in a beforeEach,
   since it's a static function.
*/
StackView.register_type(fakeType);

describe('Stack View Item Types', function() {
	var $stack;

	beforeEach(function() {
		loadFixtures('default.html');
	});

	describe('#register_type(object)', function() {
		it('should render the new item type', function() {
			$('#stack').stackView({
				data: [fakeItem]
			});
			expect($('.fake-item')).toExist();
		});

		it('should not render objects that do not match a type', function() {
			$('#stack').stackView({
				data: [{
					format: 'not-a-fake-item',
					value: 'I should never appear'
				}]
			});
			expect($('.fake-item')).not.toExist();
			expect($(opts.selectors.item).length).toEqual(0);
		});

		it('should run item objects through an adapter function', function() {
			$('#stack').stackView({
				data: [fakeItem]
			});
			expect($('.fake-item')).toHaveText('I AM A FAKE ITEM.');
		});
	});

	describe('Book type', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({
				data: [realItems.book]
			});
		});

		it('should contain an item of the book type', function() {
			expect($stack.find(opts.selectors.book).length).toEqual(1);
		});

		it('should give heights to the books', function() {
			var height = $stack.find(opts.selectors.book).height(),
			    min = opts.book.min_pages * opts.book.page_multiple - 1,
			    max = opts.book.max_pages * opts.book.page_multiple + 1;
			
			expect(height).toBeGreaterThan(min);
			expect(height).toBeLessThan(max);
		});
		
		it('should give widths to the books', function() {
			var listWidth = $stack.find(opts.selectors.item_list).width() - scrollbarWidth(),
			    width = $stack.find(opts.selectors.book).width(),
			    min = Math.floor(listWidth * opts.book.min_height_percentage / 100) - 1,
			    max = Math.floor(listWidth * opts.book.max_height_percentage / 100) + 1;
			
			expect(width).toBeGreaterThan(min);
			expect(width).toBeLessThan(max);
		});
	});

	describe('Videofilm type', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({
				data: [realItems.videofilm]
			});
		})

		it('should contain an item of the videofilm type', function() {
			expect($stack.find(opts.selectors.videofilm).length).toEqual(1);
		});
	});

	describe('Serial type', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({
				data: [realItems.serial]
			});
		});

		it('should contain an item of the serial type', function() {
			expect($stack.find(opts.selectors.serial).length).toEqual(1);
		});
	});

	describe('Webpage type', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({
				data: [realItems.webpage]
			});
		});

		it('should contain an item of the webpage type', function() {
			expect($stack.find(opts.selectors.webpage).length).toEqual(1);
		});
	});

	describe('Soundrecording type', function() {
		beforeEach(function() {
			$stack = $('#stack').stackView({
				data: [realItems.soundrecording]
			});
		});

		it('should contain an item of the soundrecording type', function() {
			expect($stack.find(opts.selectors.soundrecording).length).toEqual(1);
		});
	});	
});