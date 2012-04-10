(function($, window, undefined) {
	/*
	   Extend StackView defaults to include options for this item type.

	   selectors.webpage
	      Item selector specific to the webpage type.
	*/
	$.extend(true, window.StackView.defaults, {
		selectors: {
			webpage: '.stack-webpage'
		}
	});

	window.StackView.register_type({
		name: 'webpage',

		match: function(item) {
			return item.format === 'webpage';
		},

		adapter: function(item, options) {
			return {
				heat: window.StackView.utils.get_heat(item.shelfrank),
				link: item.rsrc_value,
				publisher: item.publisher,
				title: item.title
			};
		},

		template: '\
			<li class="stack-item stack-webpage heat<%= heat %>">\
				<a href="<%= link %>" target="_blank">\
					<span class="url-bar">\
						<span class="url-publisher"><%= publisher %>:</span>\
						<span class="url-title"><%= title %></span>\
					</span>\
					<span class="webpage-top"></span>\
					<span class="webpage-edge"></span>\
				</a>\
			</li>'
	});
})(jQuery, window);