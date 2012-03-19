(function($, window, undefined) {
	/*
	   Extend StackView defaults to include options for this item type.

	   selectors.videofilm
	      Item selector specific to the videofilm type.
	*/
	$.extend(true, window.StackView.defaults, {
		selectors: {
			videofilm: '.stack-videofilm'
		}
	});

	/*
	   #normalize_link(object) - Private
	
	   Takes an item and returns the item's link, taking into account
	   workarounds that may come from inconsistent data structure.
	*/
	var normalize_link = function(item) {
		// TODO: How should this be normalized? Can we just drop normalization
		// in favor of other systems modifying or redefining types?
		return item.title ? item.title : '#'
	};

	window.StackView.register_type({
		name: 'videofilm',

		match: function(item) {
			return item.format === 'Video\/Film';
		},

		adapter: function(item, options) {
			return {
				heat: window.StackView.utils.get_heat(item.shelfrank),
				/* TODO: How should video widths be calculated? */
				height: '65%',
				title: item.title,
				year: item.pub_date,
				link: normalize_link(item)
			};
		},

		template: '\
			<li class="stack-item stack-videofilm heat<%= heat %>" style="width:<%= height %>;">\
				<a href="<%= link %>" target="_blank">\
					<span class="spine-text">\
						<span class="spine-title"><%= title %></span>\
					</span>\
					<span class="spine-year"><%= year %></span>\
					<span class="videofilm-edge" />\
					<span class="videofilm-cover" />\
				</a>\
			</li>'
	});
})(jQuery, window);