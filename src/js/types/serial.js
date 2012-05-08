(function($, window, undefined) {
	/*
	   Extend StackView defaults to include options for this item type.

	   selectors.serial
	      Item selector specific to the serial type.
	*/
	$.extend(true, window.StackView.defaults, {
		selectors: {
			serial: '.stack-serial'
		}
	});

	window.StackView.register_type({
		name: 'serial',

		match: function(item) {
			return item.format === 'Serial';
		},

		adapter: function(item, options) {
			return {
				heat: window.StackView.utils.get_heat(item.shelfrank),
				title: item.title,
				link: item.link
			};
		},

		template: '\
			<li class="stack-item stack-serial heat<%= heat %>">\
				<a href="<%= link %>" target="_blank">\
					<span class="spine-text">\
						<span class="spine-title"><%= title %></span>\
					</span>\
					<span class="serial-edge" />\
					<span class="serial-cover" />\
				</a>\
			</li>'
	});
})(jQuery, window);