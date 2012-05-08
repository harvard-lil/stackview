(function($, window, undefined) {
	/*
	   Extend StackView defaults to include options for this item type.

	   selectors.soundrecording
	      Item selector specific to the soundrecording type.
	*/
	$.extend(true, window.StackView.defaults, {
		selectors: {
			soundrecording: '.stack-soundrecording'
		}
	});

	window.StackView.register_type({
		name: 'soundrecording',

		match: function(item) {
			return item.format === 'Sound Recording';
		},

		adapter: function(item, options) {
			return {
				heat: window.StackView.utils.get_heat(item.shelfrank),
				link: '#',
				title: item.title,
				year: item.pub_date
			};
		},

		template: '\
			<li class="stack-item stack-soundrecording heat<%= heat %>">\
				<a href="<%= link %>" target="_blank">\
						<span class="spine-text">\
							<span class="spine-title"><%= title %></span>\
						</span>\
						<span class="spine-year"><%= year %></span>\
						<span class="sound-edge"></span>\
						<span class="sound-cover"></span>\
				</a>\
			</li>'
	});
})(jQuery, window);