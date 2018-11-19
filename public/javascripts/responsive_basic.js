var windowWidth;
$(function(){
	windowWidth = $(window).width();
	
	if(windowWidth  <= 1365){
		$('#createTodo').html("");
		$('#CreateEvent').html("");
		$('.createFeedBack').html("");
		$('#createTodo').html("<i class='fa fa-tasks' aria-hidden='true' style='color:white'></i>");
		$('#CreateEvent').html("<i class='fas fa-calendar-alt' style='color:white'></i>");
		$('.createFeedBack').html("<i class='far fa-comments' style='color:white'></i>");
		$('#createTodo').css('width', '45px');
		$('#CreateEvent').css('width', '48px');
		$('.createFeedBack').css('width', '48px');

	}
	if(windowWidth >= 1366){
		$('#createTodo').html("");
		$('#CreateEvent').html("");
		$('.createFeedBack').html("");
		$('#createTodo').html("<p><span>+</span> Task</p>");
		$('#CreateEvent').html("<p><span>+</span> Schedule</p>");
		$('.createFeedBack').html("<p><span>+</span> Feedback</p>");
		$('#createTodo').css('width','68px');
		$('#CreateEvent').css('width', '100px');
		$('.createFeedBack').css('width', '100px');
	}

	if(windowWidth <= 415){
		$('.menuforMobile').show();
		$('.filterMainContainer').css({
			'left': '0',
	    	'margin': '0px 0px 0px 0px',
	    	'width': '100%'
		});
		$('.filterItem .chooseTag').css({
			'width':'100%',
			'left':'0',
			'top':'173px'
		});
		$('.create-todo').css('width','48px');
	}else{
		$('.menuforMobile').hide();
		$('.filterMainContainer').css({
			'left': '225px',
	    	'margin': '0px',
	    	'width': '256px'
		});
		$('.filterItem .chooseTag').css({
			'width':'100%',
			'left':'256px',
			'top':'90px'
		});
		$('#hayvenSidebar').show();
	}


});

$(window).resize(function(){
	windowWidth = $(window).width();
	
	if(windowWidth  <= 1365){
		$('#createTodo').html("");
		$('#CreateEvent').html("");
		$('.createFeedBack').html("");
		$('#createTodo').html("<i class='fa fa-tasks' aria-hidden='true' style='color:white'></i>");
		$('#CreateEvent').html("<i class='fas fa-calendar-alt' style='color:white'></i>");
		$('.createFeedBack').html("<i class='far fa-comments' style='color:white'></i>");
		$('#createTodo').css('width', '45px');
		$('#CreateEvent').css('width', '48px');
		$('.createFeedBack').css('width', '48px');

	}
	if(windowWidth >= 1366){
		$('#createTodo').html("");
		$('#CreateEvent').html("");
		$('.createFeedBack').html("");
		$('#createTodo').html("<p><span>+</span> Task</p>");
		$('#CreateEvent').html("<p><span>+</span> Schedule</p>");
		$('.createFeedBack').html("<p><span>+</span> Feedback</p>");
		$('#createTodo').css('width','68px');
		$('#CreateEvent').css('width', '100px');
		$('.createFeedBack').css('width', '100px');
	}

	if(windowWidth <= 415){
		$('.menuforMobile').show();
		$('.filterMainContainer').css({
			'left': '0',
	    	'margin': '0px 0px 0px 0px',
	    	'width': '100%'
		});
		$('.filterItem .chooseTag').css({
			'width':'100%',
			'left':'0',
			'top':'173px'
		});
		$('.create-todo').css('width','48px');
	}else{
		$('.menuforMobile').hide();
		$('.filterMainContainer').css({
			'left': '225px',
	    	'margin': '0px',
	    	'width': '256px'
		});
		$('.filterItem .chooseTag').css({
			'width':'100%',
			'left':'256px',
			'top':'90px'
		});
		$('#hayvenSidebar').show();
	}
});

function homeMenuShow () {
	if($('.header-left').is(':visible')){
		$('.menuforMobile').removeClass('closeMenu');
		$('.header-left').hide();
		$('.menuforMobile .fa-times').hide();
		$('.menuforMobile .fa-bars').show();
		$('#hayvenSidebar').css('position', 'fixed');
	}else{
		$('.menuforMobile').addClass('closeMenu');
		$('.header-left').show();
		$('.menuforMobile .fa-times').show();
		$('.menuforMobile .fa-bars').hide();
		$('#hayvenSidebar').css('position', 'relative');
	}
}

function showleftSide(){
	if($('#hayvenSidebar').is(':visible')){
		// $('#hayvenSidebar').slideUp();
		$('#hayvenSidebar').hide("slide", { direction: "left" }, 500);
	}else{
		// $('#hayvenSidebar').slideDown();
		$('#hayvenSidebar').show("slide", { direction: "left" }, 500);
	}
}


$(document).mouseup(function(e){
	var target = e.target;
	var sidebar = $('#hayvenSidebar');
	var headMenu = $('.menuforHead');
	var headpinunpin = $('.pin-unpin');
	var headpinunpinimg = $('#pin-to-bar');
	if(windowWidth <= 415){
		if(sidebar.is(':visible')){
			if(!headMenu.is(target) && !headpinunpin.is(target) && !headpinunpinimg.is(target) && !sidebar.is(target) && sidebar.has(target).length === 0){
				showleftSide();			
			}
		}
		if($('.header-left').is(':visible')){
			if(!$('.header-left').is(target) && $('.header-left').has(target).length === 0 && !$('.menuforMobile').is(target)){
				homeMenuShow();
			}
		}		
		
	}
});

