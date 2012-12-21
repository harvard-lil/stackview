(function(undefined) {
	StackView.templates = {
		scaffold: '\
			<div class="ribbon"><%= ribbon %></div>\
			<ul class="stack-items" />',
		
		navigation: '\
			<div class="stack-navigation<%= empty ? " empty" : ""%>">\
				<div class="upstream">Up</div>\
				<div class="num-found">\
					<span></span><br />items\
				</div>\
				<div class="downstream">Down</div>\
			</div>',
		
		book: '\
			<li class="stack-item stack-book heat<%= heat %>" style="width:<%= book_height %>; height:<%= book_thickness %>;">\
				<a href="<%= link %>" target="_newtab">\
					<span class="spine-text">\
						<span class="spine-title"><%= title %></span>\
						<span class="spine-author"><%= author %></span>\
					</span>\
					<span class="spine-year"><%= year %></span>\
					<span class="stack-pages" />\
					<span class="stack-cover" />\
				</a>\
			</li>',

		empty: '<li class="stack-item-empty"><%= message %></li>',
		
		placeholder: '<li class="stackview-placeholder"></li>'
	}
})();