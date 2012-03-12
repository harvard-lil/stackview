var opts = StackView.defaults;

var fakeType = {
	name: 'fake',

	match: function(item) {
		return item.type === 'fake'
	},

	adapter: function(item) {
		item.value = item.value.toUpperCase();
		return item;
	},

	template: '<li class="stack-item fake-item"><%= value %></li>'
};

var fakeItem = {
	type: 'fake',
	value: 'I am a fake item.'
};

/*
   Register the type once, rather than in a beforeEach,
   since it's a static function.
*/
StackView.registerType(fakeType);

describe('Stack View Item Types', function() {
	beforeEach(function() {
		loadFixtures('default.html');
	});

	describe('#registerType(object)', function() {
		it('should render the new item type', function() {
			$('#stack').stackView({
				data: [fakeItem]
			});
			expect($('.fake-item')).toExist();
		});

		it('should not render objects that do not match a type', function() {
			$('#stack').stackView({
				data: [{
					type: 'not-a-fake-item',
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
});