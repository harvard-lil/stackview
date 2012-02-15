(function($, undefined) {
	StackView.templates = {
		scroller: '\
			<div class="scroller-content">\
				<div class="scroller-loading scroller-loading-prev" />\
				<div class="scroller-page" />\
				<div class="scroller-loading scroller-loading-next" />\
			</div>',
		
		navigation: '\
			<div class="navigation">\
				<div class="upstream" />\
				<div class="num-found" />\
					<span></span><br />items\
				</div>\
				<div class="downstream" />\
			</div>',
		
		ribbon: '\
			<div class="ribbon">\
				<div class="ribbonBody"><%= ribbon %></div>\
				<div class="ribbonBehind" />\
			</div>',
		
		book: '\
			<div class="itemContainer<%=(anchor ? " anchorbook" : "")%>">\
				<span class="cover heat<%= heat %>" style="width:<%= bookHeight+2 %>;" />\
				<span class="pages heat<%= heat %>" style="margin-left:<%= bookHeight+35 %>; margin-bottom:<%= -bookWidth-11 %>; height:<%= bookWidth+5 %>;" />\
				<li link="<%= link %>" class="heat<%= heat %> spine" style="width:<%= bookHeight %>; height:<%= bookWidth %>;">\
					<p class="spine-text">\
						<span class="title"><%= title %></span>\
						<span class="author"><%= author %></span>\
					</p>\
					<span class="spine-year"><%= year %></span>\
				</li>\
			</div>\
			<div style="clear:both;" />',
		
		bookEnd: '<div class="book-end" />',
		emptyStack: '<ul class="stack" />'
	}
})();