/**
 * Created by arun on 5/10/16.
 * arunjayakumar07@gmail.com
 */
   

 function openTostMsg(conversation_type,msg_from, msg_conv_id, msg_sender_name,msg_sender_img){
    window.location.href = '/hayven/chat/' + conversation_type + '/' + msg_from + '/' + encodeURI(msg_conv_id) + '/' + encodeURI(msg_sender_name) + '/' + encodeURI(msg_sender_img);
 }
function closeToast(){
  $('.error').remove();
}
    function initToast(conversation_type,msg_from, msg_conv_id, msg_sender_name,msg_sender_img,msg_text) {
      var coutUnread = $('#nomsg'+msg_conv_id).text();
      var suffix = parseInt(coutUnread.match(/\d+/));

    	var html = '<div class="error">' +
                        '<div class="error_left">' +
                        '<div class="error_outer"></div>' +
                        '<div class="error_inner" onclick="toggleToastdiv()"><img style="width:60px; height:60px; border-radius:50%;" src="/images/users/'+msg_sender_img+'"></div>' +
                        '<div class="unreadMsgToast" id="toastmsgCount">'+suffix+'</div>' +
                        '</div>' +
                        '<div class="toastMessageContainer">'+
                            '<div class="error_right" onclick="openTostMsg(\''+conversation_type+'\',\''+msg_from+'\', \''+msg_conv_id+'\', \''+msg_sender_name+'\',\''+msg_sender_img+'\')" >' +
                            '<strong>'+msg_sender_name+ ' :<br></strong>'+msg_text+'' +
                            '</div>' +
                            '<div class="toastBorder">'+
                            '</div>'+
                            '<div class="closeToast" onclick="closeToast()">x</div>'+
                        '</div>'+
                    '</div>'
            ;
        $('.filter_body').append(html);



        var myTost = Math.floor(Math.random()*2);

        switch(myTost){
            case 0:

                    rightTost();
                    break;
            case 1:

                    leftTost();
                    break;
        }

        $('.error').show();
    }

function rightTost(){
    var  top = ['100px', '150px', '200px', '250px', '300px', '350px', '400px', '450px', '500px'];
    var rand = top[Math.floor(Math.random() * top.length)];
    // $('.error').css('top',''+rand+'');
    $('.error').css('right','150px');
    $('.error').css('left','initial');
    $('.error_right').css('left','-150px');
}

function leftTost(){
    var  top = ['100px', '150px', '200px', '250px', '300px', '350px', '400px', '450px', '500px'];
    var rand = top[Math.floor(Math.random() * top.length)];
    // $('.error').css('top',''+rand+'');
    $('.error').css('right','initial');
    $('.error').css('left','-20px');
    $('.toastBorder').css('left','110px');
    $('.toastBorder').css('border-left','0px solid rgb(126, 189, 77)');
    $('.toastBorder').css('border-right','15px solid rgb(126, 189, 77)');
    $('.closeToast').css('left','313px');
    $('.closeToast').css('right','0px');
}

// function showError(msg, type, hide) {

// 	$('.error').attr('class', 'error');
//     $('.error .error_right').html(msg);

//     switch (type) {
//         case 'success':
//             $('.error').addClass('success');
//             break;
//         case 'error':
//             break;
//         case 'loading':
//             $('.error').addClass('loader');
//             break;
//     }

//     $('.error').addClass('show');

//     if (hide) {
//         setTimeout(function () {
//             $('.error').attr('class', 'error');
//         }, 2000);
//     }
// }

function toggleToastdiv(){
    $('.toastMessageContainer').toggle();
}

function hideError() {
	$('.error').remove();
}
    