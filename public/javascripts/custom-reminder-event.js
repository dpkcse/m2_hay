$(".Daily-Tab").on('click', function(e){
	e.preventDefault();
	$(this).parents(".tab-link-btn-group").find(".active").removeClass("active");
	$(this).addClass('active');
	$("#Daily-Tab").show();
	$("#Weekly-Tab").hide();
	$("#Monthly-Tab").hide();
	$("#Yearly-Tab").hide();
});
$(".Weekly-Tab").on('click', function(e){
	e.preventDefault();
	$(this).parents(".tab-link-btn-group").find(".active").removeClass("active");
	$(this).addClass('active');
	$("#Daily-Tab").hide();
	$("#Weekly-Tab").show();
	$("#Monthly-Tab").hide();
	$("#Yearly-Tab").hide();
});
$(".Monthly-Tab").on('click', function(e){
	e.preventDefault();
	$(this).parents(".tab-link-btn-group").find(".active").removeClass("active");
	$(this).addClass('active');
	$("#Daily-Tab").hide();
	$("#Weekly-Tab").hide();
	$("#Monthly-Tab").show();
	$("#Yearly-Tab").hide();
});
$(".Yearly-Tab").on('click', function(e){
	e.preventDefault();
	$(this).parents(".tab-link-btn-group").find(".active").removeClass("active");
	$(this).addClass('active');
	$("#Daily-Tab").hide();
	$("#Weekly-Tab").hide();
	$("#Monthly-Tab").hide();
	$("#Yearly-Tab").show();
});
$(".reminder-input-repeat").on('click', function(){
	$(".repeat-every-popup").show();
});

$(".cancel-popup-repeat").on("click", function(){
	$(".repeat-every-popup").hide();
});
$(".close-reminder-backwrap").on("click", function(){
	$("#CreateReminder").hide();
	$('#CreateReminderForm')[0].reset();
});

window.addEventListener("keyup", function(event) {
	    if (event.keyCode === 27) {

      if($("#CreateReminder").is(':visible')){
        $('.close-reminder-backwrap').trigger('click');
        $('#CreateReminderForm')[0].reset();
      }
  }
});


$(".btn-create-reminder").on("click", function(){
	// $("#CreateReminder").show();
	$('.btn-create-event').append('<div class="dialogForEvent" style="color:red;top:-30px; background: white; padding:25px; font-size:30px;left:-200px; line-height:20px;position: absolute; z-index:99999; border-radius:8px;">This module is not functional.</div>');
	setTimeout(function(){ $('.dialogForEvent').hide() },2000);
});

 $(function () {
  $('.reminder-input-date').datetimepicker({
    format: 'L'
  });
});
 $(function () {
  $('.reminder-input-end').datetimepicker({
    format: 'L'
  });
});

 $(function () {
  $('.reminder-input-time').datetimepicker({
    format: 'hh:mm'
  });
});

 $('.week-day-group').on('click', function(e){
 	$(this).parents(".reminder-week-day").find('.active').removeClass('active');
 	$(this).addClass("active");
 });
 $('.monthly-date-group').on('click', function(e){
 	$(this).parents(".reminder-monthly-date").find('.active').removeClass('active');
 	$(this).addClass("active");
 });
 $('.yearly-month-group').on('click', function(e){
 	$(this).parents(".reminder-yearly-month").find('.active').removeClass('active');
 	$(this).addClass("active");
 });


 $(".reminder-input-date").on('dp.change', function(){
 		var count = $(".reminder-input-date").val().length;
 		if(! count == 0){
 			$(this).css('background-image', 'url(/images/svg/CalendarSelected.svg)')
 		}else{
 			$(this).css('background-image', 'url(/images/svg/CalendarNotSelected.svg)')
 		}
 });

$(".close-reminder-backwrap").click(function(){
	$(".reminder-input-date").css('background-image', 'url(/images/svg/CalendarNotSelected.svg)');
	$(".reminder-input-end").css('background-image', 'url(/images/svg/CalendarNotSelected.svg)');
	$(".reminder-input-time").css('background-image', 'url(/images/svg/TimeDeactive.svg)');
	$(".repeat-every-popup").hide();
	$(".tab-reminder").removeClass('active');
	$(".reminder-tab-content").hide();
	$(".Daily-Tab").addClass('active');
	$("#Daily-Tab").show();
});


 $(".reminder-input-end").on('dp.change', function(){
 		var count = $(".reminder-input-end").length;
 		if(! count == 0){
 			$(this).css('background-image', 'url(/images/svg/CalendarSelected.svg)')
 		}else{
 			$(this).css('background-image', 'url(/images/svg/CalendarNotSelected.svg)')
 		}
 });
  $(".reminder-input-time").on('dp.change', function(){
 		var count = $(".reminder-input-time").length;
 		if(! count == 0){
 			$(this).css('background-image', 'url(/images/svg/TimeActive.svg)')
 		}else{
 			$(this).css('background-image', 'url(/images/svg/TimeDeactive.svg)')
 		}
 });


 // Custom js For Event Modal

$('#event-daily').on('click', function(){
	$('#daily').show();
	$('#weekly').hide();
	$('#monthly').hide();
});

$('#event-weekly').on('click', function(){
	$('#daily').hide();
	$('#weekly').show();
	$('#monthly').hide();
});
$('#event-monthly').on('click', function(){
	$('#daily').hide();
	$('#weekly').hide();
	$('#monthly').show();
});

$('#evet-never').on('click', function(){
	$('#never').show();
	$('#endson').hide();
	$('#endsafter').hide();
});

$('#event-end').on('click', function(){
	$('#never').hide();
	$('#endson').show();
	$('#endsafter').hide();
});
$('#event-after').on('click', function(){
	$('#never').hide();
	$('#endson').hide();
	$('#endsafter').show();
});

$('.expand-div').on('click', function(){
	$('.CreateEventMain').hide();
	$('.AddRecurrencePopup').show();
});
$('.RecurrencePopupTitle').on('click', function(){
	$('.CreateEventMain').show();
	$('.AddRecurrencePopup').hide();
});

 $(function () {
  $('.eventdate').datetimepicker({
    format: 'L'
  });
});
 $(function () {
  $('.SelectDateEvent').datetimepicker({
    format: 'L'
  });
});

 $(function () {
  $('#EventTo').datetimepicker({
    format: 'hh:mm'
  });
});
 $(function () {
  $('.Event-From-input').datetimepicker({
    format: 'hh:mm'
  });
});
 $(function () {
  $('.selectTimeEvent').datetimepicker({
    format: 'hh:mm'
  });
});

 $('.event_close').on('click', function(){
 	$('#CreateEvent').hide();
 });
 $(document).keyup(function(e){
 	if(e.keyCode == 27){
 		$('.event_close').trigger('click');
 	}
 });

$('.remove-event-member').on('click', function(e){
	$(this).parents('.invited-member-list').remove();
});

 $(".eventdate").on('dp.change', function(){
 		var count = $(".eventdate").val().length;
 		if(! count == 0){
 			$(this).css('background-image', 'url(/images/svg/CalendarSelected.svg)')
 		}else{
 			$(this).css('background-image', 'url(/images/svg/CalendarNotSelected.svg)')
 		}
 });

 $(".SelectDateEvent").on('dp.change', function(){
		 var count = $(".SelectDateEvent").val().length;
		 if(! count == 0){
			 $(this).css('background-image', 'url(/images/svg/CalendarSelected.svg)')
		 }else{
			 $(this).css('background-image', 'url(/images/svg/CalendarNotSelected.svg)')
		 }
 });

  $(".Event-From-input").on('dp.change', function(){
 		var count = $(".Event-From-input").val().length;
 		if(! count == 0){
 			$(this).css('background-image', 'url(/images/svg/TimeActive.svg)')
 		}else{
 			$(this).css('background-image', 'url(/images/svg/TimeDeactive.svg)')
 		}
 });

 $(".selectTimeEvent").on('dp.change', function(){
		var count = $(".selectTimeEvent").val().length;
		if(! count == 0){
			$(this).css('background-image', 'url(/images/svg/TimeActive.svg)')
		}else{
			$(this).css('background-image', 'url(/images/svg/TimeDeactive.svg)')
		}
});

  $(".Event-To-input").on('dp.change', function(){
 		var count = $(".Event-To-input").val().length;
 		if(! count == 0){
 			$(this).css('background-image', 'url(/images/svg/TimeActive.svg)')
 		}else{
 			$(this).css('background-image', 'url(/images/svg/TimeDeactive.svg)')
 		}
 });

  $(document).ready(function(){
  	var countMember = $('.invited-member-list').length;
  	// console.log($(".invited-member-list:nth-child("+ countMember +")"));
  	$("div .invited-member-list:nth-child("+ parseInt(1 + countMember) +")").css('margin-bottom', '90px');
  });

$('#timezone').on('change', function(){
   if(!$("#timezone").val() == null){
   	 $("#timezone").css('background-image', 'url(/images/svg/NotSelectedDropdown.svg)');
   }else{
   		$("#timezone").css('background-image', 'url(/images/svg/SelectedDropdown.svg)');
   }
});
$('#reminder').on('change', function(){
   if(!$("#reminder").val() == null){
   	 $("#reminder").css('background-image', 'url(/images/svg/NotSelectedDropdown.svg)');
   }else{
   		$("#reminder").css('background-image', 'url(/images/svg/SelectedDropdown.svg)');
   }
});



$('.btn-create-event').on('click', function(){
	// $('#CreateEvent').show();
	$('.btn-create-event').append('<div class="dialogForEvent" style="color:red;top:-30px; background: white; padding:25px; font-size:30px;left:-200px; line-height:20px;position: absolute; z-index:99999; border-radius:8px;">This module is not functional.</div>');
	setTimeout(function(){ $('.dialogForEvent').hide() },2000);
});
$('.btn-create-task').on('click', function(){
	// $('#CreateEvent').show();
	$('.btn-create-event').append('<div class="dialogForEvent" style="color:red;top:-30px; background: white; padding:25px; font-size:30px;left:-200px; line-height:20px;position: absolute; z-index:99999; border-radius:8px;">This module is not functional.</div>');
	setTimeout(function(){ $('.dialogForEvent').hide() },2000);
});
$('.btn-create-project').on('click', function(){
	// $('#CreateEvent').show();
	$('.btn-create-event').append('<div class="dialogForEvent" style="color:red;top:-30px; background: white; padding:25px; font-size:30px;left:-200px; line-height:20px;position: absolute; z-index:99999; border-radius:8px;">This module is not functional.</div>');
	setTimeout(function(){ $('.dialogForEvent').hide() },2000);
});
$('.btn-create-poll').on('click', function(){
	// $('#CreateEvent').show();
	$('.btn-create-event').append('<div class="dialogForEvent" style="color:red;top:-30px; background: white; padding:25px; font-size:30px;left:-200px; line-height:20px;position: absolute; z-index:99999; border-radius:8px;">This module is not functional.</div>');
	setTimeout(function(){ $('.dialogForEvent').hide() },2000);
});


$('.days').on('click', function(e){

	if(($(this).css("background-color") == "rgb(255, 255, 255)") && ($(this).find('p').css("color")) == "rgb(74, 74, 74)"){
		$(this).css({"background-color": "rgb(74, 144, 226)"});
		$(this).find('p').css({"color": "rgb(255, 255, 255)"});
	}else{

		$(this).css({"background-color": "rgb(255, 255, 255)"});
		$(this).find('p').css({"color": "rgb(74, 74, 74)"});
	}
});


$(document).keyup(function(e){
	if(e.keyCode == 27){
		$('#boxWrap').hide();
	}
});
// Custom js For Event Modal
