var viewAddContact = () =>{
	$('.popup_add_contact').show();
	$('.popup_add_contact').animate({
        opacity: '1',
        height: '208px',
        width: '208px'
	}, 200, function(){

	});
}
var escapeAddContact = ()=>{
        $('.popup_add_contact').animate({
        	opacity: '1',
            height: '0px',
            width: '0px'
        }, 200, function(){
        	$('.popup_add_contact').hide();
	});
        
    }

$('.add-contact').on('click', function(){
	viewAddContact();
});

$(document).keyup(function(e){
if (e.keyCode == 27) { // escape key maps to keycode `27`
        escapeAddContact();
    }
});

$(document).mouseup(function(e){
    var popup_add_contact = $(".popup_add_contact");

    // if the target of the click isn't the container nor a descendant of the container
    if (!popup_add_contact.is(e.target) && popup_add_contact.has(e.target).length === 0)
    {
        popup_add_contact.hide();
        popup_add_contact.animate({
        	opacity: '1',
            height: '0px',
            width: '0px'
        }, 200, function(){

	});
        
    }
});



    $(document).ready(function () {

      $('ul.contact-main-tab li').click(function () {
        var tab_id = $(this).attr('data-tab');

        $('ul.contact-main-tab li').removeClass('current');
        $('.contact-tab-content').removeClass('current');

        $(this).addClass('current');
        $("#" + tab_id).addClass('current');
      });

      //Script for Contacts profile tabs

      $('.contacts-profile-tab-list').click(function () {
        var contacts_tab_id = $(this).attr('data-tab');

        $('.contacts-profile-tab-list').removeClass('active');
        $('.contacts-profile-tab-content').removeClass('active');

        $(this).addClass('active');
        $("#" + contacts_tab_id).addClass('active');
      });

      // check Script
      $('#contacts_one').click(function () {
        $(".main-contact-div").css("display", "none");
        $("#contacts-profile-information").show();
      });
      $(".contacts-profile-back-button").click(function () {
        $("#contacts-profile-information").hide();
        $(".main-contact-div").show();
      });

      // check Script
      $('#guest_contact').click(function () {
        $(".main-contact-div").css("display", "none");
        $("#contacts-guest-profile").show();
      });
      $(".contacts-profile-back-button").click(function () {
        $("#contacts-guest-profile").hide();
        $(".main-contact-div").show();
      });
    });

    function guestInvite() {
      if (!$('.inviteMessage').is(':visible') == true) {
        $('.inviteMessage').show();
      } else {
        $('.inviteMessage').hide();
      }
      setTimeout(function () {
        $('.inviteMessage').hide()
      }, 2000)

    }
