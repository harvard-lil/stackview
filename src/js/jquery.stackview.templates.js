(function($, undefined) {
	StackView.templates = {
		scaffold: '\
			<div class="ribbon">\
				<div class="ribbonBody"><%= ribbon %></div>\
				<div class="ribbonBehind" />\
			</div>\
			<ul class="stack-items" />',
		
		navigation: '\
			<div class="navigation">\
				<div class="upstream" />\
				<div class="num-found" />\
					<span></span><br />items\
				</div>\
				<div class="downstream" />\
			</div>',
		
		book: '\
			<li class="stack-book heat<%= heat %>" style="width:<%= book_height %>; height:<%= book_thickness %>;">\
				<a href="<%= link %>" target="_newtab">\
					<span class="spine-title"><%= title %></span>\
					<span class="spine-author"><%= author %></span>\
					<span class="spine-year"><%= year %></span>\
				</a>\
			</li>',
		
		bookEnd: '<div class="book-end" />'
	}
})();