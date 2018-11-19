var all_current_sms = [];
var senderimg = $('.itl-nav-user-icon').attr('alt');
var sendername = $('.itl-nav-user-icon').attr('title');
var filedata = [],
audiofile = [],
videofile = [],
imgfile = [],
otherfile = [];
var thread_id = "";
var thread_root_id = "";
var swap_conversation_id = "";

/**
* When a new message come,
* Check user message container is opne or not.
* if open, it show's the message in the container
* else marked as a notification that new message arived
**/
socket.on('newMessage', function(message) {
  // console.log(message);
  if (to == message.msg_from || conversation_id == message.msg_conv_id) {
    $('.typing-indicator').remove();
    var msgid = (message.msg_id).replace('TimeUuid: ', '');
    // console.log(42, msgid);
    var html = per_msg_top(msgid, moment().format("MMM Do, YYYY"), '', '', message.msg_sender_img, message.msg_sender_name, false);
    html += per_msg_main_body(msgid, message.msg_text, '', moment().format('h:mm a'), true);
    $('.message-container').append(html);

    socket.emit('seen_emit', { msgid: msgid, senderid: to, receiverid: user_id, conversation_id: conversation_id });
    // all_action_for_selected_member();
    var attfiles = message.msg_attach_files;

    if (typeof attfiles != "undefined") {
      if (attfiles.videofile) {
        per_msg_video_attachment(attfiles.videofile);
      }

      if (attfiles.audiofile) {
        per_msg_audio_attachment(attfiles.audiofile);
      }

      if (attfiles.imgfile) {
        html = per_msg_image_attachment(attfiles.imgfile);
        $('.message-container .per-msg:last-child').find('.attachment').append(html);
        lightbox_call();
      }

      if (attfiles.otherfile) {
        per_msg_file_attachment(attfiles.otherfile);
      }
    }
  } else {

    var msg_thread_root_id = (message.msg_thread_root_id == "" || message.msg_thread_root_id === undefined) ? message.msg_conv_id : message.msg_thread_root_id;
    console.log(message.msg_conv_id);
    console.log(msg_thread_root_id);
    if (existingConv.indexOf(msg_thread_root_id) == -1) {
      existingConv.push(msg_thread_root_id);
      $("#directChat-start").remove();
      var cokkieDesign = '<div class="item ui-widget-content" onclick="openProfilePage(this)">';
      cokkieDesign += '        <div class="box box-success online_' + message.msg_from + ' offline" >';
      cokkieDesign += '          <div class="box-msg nomsg" id="nomsg' + msg_thread_root_id + '" style="display: none;"></div>';
      cokkieDesign += '          <div class="box-header" data-name="' + message.msg_sender_name + '" data-img="navigate group.jpg" data-id="' + message.msg_from + '" data-conversationtype="personal"  data-conversationid="' + msg_thread_root_id + '">';
      cokkieDesign += '            <div class="box-title">' + message.msg_sender_name + '</div>';
      cokkieDesign += '            <div class="box-subtitle"></div>';
      cokkieDesign += '            <img src="/images/pin-off_16px_200 @1x.png" class="pin-to-bar" >';
      cokkieDesign += '          </div>';
      cokkieDesign += '          <div class="box-body" id="msgbody' + msg_thread_root_id + '" data-msgtype="" data-msgid="" style="display: block;">' + message.msg_text + '</div>';
      cokkieDesign += '          <div class="msg-time" id="msgtime' + msg_thread_root_id + '" style="display: block;">' + moment().format('h:mm a') + '</div>';
      cokkieDesign += '        </div>';
      cokkieDesign += '      </div>';
      cokkieDesign += '      <div class="gutter-sizer"></div>';

      var $grid = $('.masonry-layout').masonry({
        itemSelector: '.item',
        columnWidth: '.masonry-layout .item',
        gutter: '.gutter-sizer',
        percentPosition: true
      });

      var $content = $(cokkieDesign);
      $grid.append($content).masonry('appended', $content);

      afterAppendEventInConnectpage();
    }
    

    var nomsg = parseInt($('#nomsg' + msg_thread_root_id).text().replace(' UNREAD', '')) ? parseInt($('#nomsg' + msg_thread_root_id).text()) : 0;
    // alert(nomsg);
    $('#nomsg' + msg_thread_root_id).text(parseInt(nomsg + 1) + ' UNREAD');
    $('#nomsg' + msg_thread_root_id).show();

    hideError();
    toggleToastdiv();
    initToast(message.conversation_type, message.msg_from, message.msg_conv_id, message.msg_sender_name, message.msg_sender_img, message.msg_text);

    $("#msgbody" + msg_thread_root_id).html(message.msg_text);
    $("#msgtime" + msg_thread_root_id).html(moment().format('h:m a') + '<img src="/images/reciept-delivered_14px_200 @1x.png">');
    $("#msgbody" + msg_thread_root_id).show();
    $("#msgtime" + msg_thread_root_id).show();

    var mdatapinnd = [];
    var splitpinnd = [];
    var mdataunpinned = [];

    $('#conversation-container .item').each(function(i, obj) {

      if ($(obj).find('.box-header').find('.pin-to-bar').hasClass('pined')) {
        mdatapinnd.push($(obj).add('<div class="gutter-sizer"></div>'));
      } else {
        if ($(obj).find('.box ').hasClass('online_' + message.msg_from)) {
          splitpinnd.push($(obj).add('<div class="gutter-sizer"></div>'));
        } else {
          mdataunpinned.push($(obj).add('<div class="gutter-sizer"></div>'));
        }
      }
    });

    var explodObj = mdatapinnd.concat(splitpinnd);
    var afterSocketData = explodObj.concat(mdataunpinned);

    $('#conversation-container').html("");

    var masonryOptions = {
      itemSelector: '.item',
      columnWidth: '.masonry-layout .item',
      gutter: '.gutter-sizer',
      percentPosition: true
    };

    var $grid = $('.masonry-layout').masonry(masonryOptions);

    $.each(afterSocketData, function(k, bb) {
      var $content = $(bb);
      // add jQuery object
      $grid.append($content).masonry('appended', $content);
    });


    $grid.masonry('destroy');
    $grid.masonry(masonryOptions);

    afterAppendEventInConnectpage();

  }

  scrollToBottom('.message-container');
});

/**
* When add new emoji reaction,
**/
socket.on('emoji_on_emit', function(data) {
  append_reac_emoji(data.msg_id, '/images/emoji/' + data.emoji_name + '.png', 1);
});

if (typeof groups !== 'undefined') {
  $.each(groups, function(k, v) {
    socket.emit('group_join', { group_id: v.conversation_id });
  });
}

socket.on('receive_emit', function(data) {
  update_msg_seen_status(data.msgid);
});

socket.on('update_msg_receive_seen', function(data) {
  $.each(data.msgid, function(k, v) {
    update_msg_seen_status(v);
  });
});

var update_msg_seen_status = (msgid) => {
  $('.msg_id_' + msgid).find('.msg-send-seen-delivered img').attr('src', '/images/reciept-delivered_14px_200 @1x.png');
}
// setTimeout(function(){
//   var room_genid = 0;

//   socket.emit('videocall_req', {
//     my_name: user_fullname, my_id : user_id, my_img: user_img,
//     to_name: 0, to_id : 0, to_img: 0, room_genid : 0
//   });

//   console.log({
//     my_name: user_fullname, my_id : user_id, my_img: user_img,
//     to_name: 0, to_id : 0, to_img: 0, room_genid : 0
//   });

// }, 1000);


/**
* When click on the user Name
**/
// $('.userlist').on('click', function() {
//   $('#to').val("");
//   var fid = $(this).attr('data-id');
//   var user_display_name = $(this).attr('data-name');
//   $('#display_name').text(user_display_name);
//   $('#to').val(fid);
//   $.ajax({
//     url: "/chat/msg_history",
//     type: "POST",
//     data: {mid: userid, fid: fid},
//     dataType: "JSON",
//     success: function(res){
//       if(res.length>0){
//         var html = '';
//         var newres = _.sortBy(res, ['msg_createdat']);
//         $.each(newres, function(k,v){
//           if((v.msg_from === userid && v.msg_to === fid) || (v.msg_from === fid && v.msg_to === userid)){
//             var un = $('.online_'+v.msg_from).attr('data-name');
//             html += draw_message(un, v.msg_text, v.msg_createdat);
//           }
//         });
//         $('#messages').html(html);
//         scrollToBottom('.message-container');
//       } else {
//         $('#messages').html("");
//       }
//     },
//     error: function(err){
//       console.log(err.responseText);
//     }
//   });
//   $('#msg').attr('disabled', false).focus();
//   $('.chat__footer button').attr('disabled', false);
// });

/**
* Global typing variable, for storing typing status
* Global timeout variable, for storing when typing timeout
**/
var typing = false;
var timeout = undefined;
/**
* timeoutFunction call after 2 second typing start
**/
var timeoutFunction = () => {
  typing = false;
  socket.emit("client_typing", { display: false, room_id: to, sender_id: user_id, sender_name: sendername, sender_img: senderimg, conversation_id: conversation_id });
  // console.log('timeout emit' + moment().format('m-s'));
};

/**
* When message form submit
**/
$('#msg').on('keyup', function(event) {
  var code = event.keyCode || event.which;
  if ($('#msg').hasClass('search-message')) {
    var str = $('#msg').html();
    str = str.replace(/<\/?[^>]+(>|$)/g, "");
    // console.log(str);
    if (str == "") {
      //alert("Write a text for searching...");
      $('#msg').html("");
    } else {
      $('.group-name').text('Searching for "' + str + '"');
      $('.per-msg').unhighlight();
      $('.per-msg').highlight(str);
      $('.no-group-members').text($('.highlight').length + ' results');
      if ($('.highlight').length > 0) {
        $.each($('.per-msg'), function() {
          if ($(this).find('.highlight').length == 0) {
            $(this).prev('.separetor').hide();
            $(this).hide();
          } else {
            $(this).prev('.separetor').show();
            $(this).show();
          }
        });
      } else {
        $('.separetor').show();
        $('.per-msg').show();
      }
    }
  } else {
    if (code == 13 && !event.shiftKey) { //Enter keycode = 13
      event.preventDefault();
      if ($('#msg').hasClass('thread-message')) {
        swap_conversation_id = conversation_id;
        conversation_id = thread_id;
        socket.emit('update_thread_count', { msg_id: thread_root_id });
      }
      msg_form_submit();
    }

    // When typing start into message box
    if (typing === false) {
      typing = true;
      // console.log("typing start to = ", to);
      // console.log("typing start conversation_id = ", conversation_id);
      // console.log("typing from = ", user_id);
      socket.emit('client_typing', { display: true, room_id: to, sender_id: user_id, sender_name: sendername, sender_img: senderimg, conversation_id: conversation_id });
      timeout = setTimeout(timeoutFunction, 2000);
    }
  }
});

/**
* Receive typing event and
* display indicator images hide and show
**/
socket.on('server_typing_emit', function(data) {
  if (data.sender_id != user_id) {
    if (conversation_id == data.conversation_id) {
      draw_typing_indicator(data.display, data.img, data.name);
    }
  }
});

////////////////////////////////////////////////////////////////////////////////////////
$(function() {
  // if($('.masonry-layout').length){
  //   $('.masonry-layout').masonry({
  //     itemSelector : '.item',
  //     columnWidth : 264
  //   });
  //   // $.each($('.masonry-layout .box-body'), function(k,v){
  //   //   if($(v).height() > 200){
  //   //     console.log($(v).text());
  //   //   }
  //   // });
  // }

  /** This part is for drag and drop */
  if ($('#conversation-container').length) {
    $("#conversation-container .item").draggable({
      helper: 'clone',
      opacity: 0.5
    });
    $(".pin-bar").droppable({
      drop: function(event, ui) {
        var draggable = ui.draggable;
        var img = $(draggable).find('.box-header').attr('data-img');
        var name = $(draggable).find('.box-header').attr('data-name');
        var drawpin = true;
        $.each($('.pin-item'), function(k, v) {
          if ($(v).find('img').attr('title') == name) {
            drawpin = false;
            return false;
          }
        });
        if ($('.pin-item').length > 9) {
          drawpin = false;
        }
        if (drawpin) {
          var html = '<div class="pin-item"><img src="/images/users/' + img + '" title="' + name + '" onclick="unpinme(event)" /></div>';
          $('.pin-bar').find('.pin-item').last().before(html);

          $(draggable).find('.pin-to-bar').addClass('pined');
          $(draggable).find('.pin-to-bar').attr('src', '/images/pin-on_16px_500 @1x.png');

          if ($('.pin-item').length == 10) {
            $('.pin-item').last().hide();
          }
        }
      }
    });

  }
  /** End of drag and drop */

  /** When click on the filter button from Hayven chat page */
  $('.filter-btn').on('click', function() {
    if ($('.filter-btn-div').is(":hidden")) {
      if ($('.filter-btn-div').css('top') == 'auto') {
        var offset = $('.filter-btn').offset();
        $('.filter-btn-div').offset({ top: offset.top, left: offset.left - 255 });
      }
      $(".filter-btn-div").slideDown("slow");
    }
  });

  // $('.masonry').on('click', function() {
  //     if (!$('#conversation-container').hasClass('masonry-layout')) {
  //         $('#conversation-container').addClass('masonry-layout').removeClass('classic-row');
  //
  //         var mdata = [];
  //         $('#conversation-container .item').each(function(i, obj) {
  //
  //
  //             mdata.push(obj);
  //         });
  //         $('#conversation-container').html("");
  //
  //         var $grid = $('.masonry-layout').masonry({
  //               itemSelector : '.item',
  //               columnWidth : '.masonry-layout .item',
  //               gutter: '.gutter-sizer',
  //               percentPosition: true
  //         });
  //         $.each(mdata, function(k, bb) {
  //             var $content = $(bb);
  //             // add jQuery object
  //             $grid.append($content).masonry('appended', $content);
  //
  //         });
  //
  //         $(".filter-btn-div").css('display', 'none');
  //     }
  // });
  $('.masonry').on('click', function() {
    if (!$('#conversation-container').hasClass('masonry-layout')) {
      $('#conversation-container').addClass('masonry-layout').removeClass('classic-row');

      var mdata = [];
      $('#conversation-container .item').each(function(i, obj) {


        mdata.push($(obj).add('<div class="gutter-sizer"></div>'));

      });
      $('#conversation-container').html('');

      var masonryOptions = {
        itemSelector: '.item',
        columnWidth: '.masonry-layout .item',
        gutter: '.gutter-sizer',
        percentPosition: true
      };
      var $grid = $('.masonry-layout').masonry(masonryOptions);

      $.each(mdata, function(k, bb) {
        var $content = $(bb);
        // add jQuery object
        $grid.append($content).masonry('appended', $content);
      });

      $grid.masonry('destroy');
      $grid.masonry(masonryOptions);

      $(".filter-btn-div").css('display', 'none');
    }
  });


  $('.classic').on('click', function() {
    $('#conversation-container').addClass('classic-row').removeClass('masonry-layout');

    $('#conversation-container .item').each(function(i, obj) {
      $(this).removeAttr("style");
    });
    $(".filter-btn-div").css('display', 'none');
  });
  /** End of filter button and inner button work */

  /** When click on the per message action button from Hayven chat page */
  $('.per-msg-action').on('click', function() {
    if ($('.action-btn-div').is(":hidden")) {
      $('.btn-cleate-file-upload').hide();
      $('.per-msg-action img').attr('src', '/images/close_18px_000 @1x.png');
      $('.backWrap').show();
      $(this).closest('.per-msg').addClass('active');
      // $(".btn-cleate-file-upload").show();
      $(".action-btn-div").slideDown("slow");
    } else {
      $('.backWrap').hide();
      $(".action-btn-div").hide();
      // $(".btn-cleate-file-upload").hide();
      $('.per-msg-action img').attr('src', '/images/NavbarIcons/actions-create_24px_FFF.png');
      $(this).closest('.per-msg').removeClass('active');
    }
  });


  /** On mouse up event 'mouseup' */
  $('body').mouseup(function(e) {
    var container = "";
    var removeit = false;
    // connect page-> masonry/ classic view div
    if ($('.filter-btn-div').is(':visible')) {
      container = $('.filter-btn-div');
    }
    // open chat page-> Conversation more option div
    else if ($('.more-option').is(':visible')) {
      container = $('.more-option');
    } else if ($('.reac_div').is(':visible')) {
      container = $('.reac_div');
      removeit = true;
    } else if ($('.msg_open_more_div').is(':visible')) {
      container = $('.msg_open_more_div');
      removeit = true;
    }

    if (container !== "") {
      // if the target of the click isn't the container nor a descendant of the container
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if (removeit) {
          $(container).closest('.per-msg').removeClass('active');
          container.remove();
        } else {
          container.hide();
        }
        $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
        $('.backWrap').hide();
      }
    }
  });

  /** Set group name from 'create new group popup' */
  $('.team-name').on('keyup', function(e) {
    var name = $(e.target).val();
    if (name != "") {
      $('.username').text($(e.target).val());
    } else {
      $('.username').text('Unnamed Group');
    }
  });
  /** Set eco system name from 'create new group popup' */
  $('.select-ecosystem').on('change', function(e) {
    $('.ecosystem').text($(e.target).val());
  });



  /* Remove btn for suggested list */
  $('.remove-suggested-type-list').on('click', function() {
    $('.add-team-member').val("");
    $('.right-part .suggested-type-list').hide();
  });

  $('div').on('click', '.pin-to-bar', function(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    var name = $(event.target).closest('.box-header').attr('data-name');
    var img = $(event.target).closest('.box-header').attr('data-img');


    if ($(event.target).hasClass('pined')) {
      var pinnedid = $(event.target).attr('data-pinned');
      $.ajax({
        type: 'POST',
        data: {
          pinnedNumber: '',
          targetID: pinnedid,
          blockID: '',
          type: 'unpin'
        },
        dataType: 'json',
        url: '/hayven/pinning',
        success: function(data) {
          $("#conversation-container").html("");
          $.each(data.myid, function(ka, v) {
            pinBlockDesign(v);
          });

          $.each(data.pin, function(ka, v) {
            pinBlockDesign(v);
          });

          $.each(data.unpin, function(ka, v) {
            unpinBlockDesign(v);
          });


          count(data.urRes.array_elements, data.urRes.msgbodyArray);

          var mdatapinnd = [];

          $('#conversation-container .item').each(function(i, obj) {
            mdatapinnd.push($(obj).add('<div class="gutter-sizer"></div>'));
          });

          $('#conversation-container').html("");

          var masonryOptions = {
            itemSelector: '.item',
            columnWidth: '.masonry-layout .item',
            gutter: '.gutter-sizer',
            percentPosition: true
          };

          var $grid = $('.masonry-layout').masonry(masonryOptions);

          $.each(mdatapinnd, function(k, bb) {
            var $content = $(bb);
            // add jQuery object
            $grid.append($content).masonry('appended', $content);
          });

          $grid.masonry('destroy');
          $grid.masonry(masonryOptions);

          afterAppendEventInConnectpage();
        }
      });

    } else {

      var pinnedCount = $('.pined').length;
      var PinnedNumber = parseInt(pinnedCount) + 1;
      var targetID = $(this).closest('.box-header').attr('data-id');
      var blockID = $(this).closest('.box-header').attr('data-conversationid');
      $.ajax({
        type: 'POST',
        data: {
          pinnedNumber: PinnedNumber,
          targetID: targetID,
          blockID: blockID,
          type: 'pin'
        },
        dataType: 'json',
        url: '/hayven/pinning',
        success: function(data) {
          $("#conversation-container").html("");
          $.each(data.myid, function(ka, v) {
            pinBlockDesign(v);
          });

          $.each(data.pin, function(ka, v) {
            pinBlockDesign(v);
          });

          $.each(data.unpin, function(ka, v) {
            unpinBlockDesign(v);
          });

          count(data.urRes.array_elements, data.urRes.msgbodyArray);

          var mdatapinnd = [];

          $('#conversation-container .item').each(function(i, obj) {
            mdatapinnd.push($(obj).add('<div class="gutter-sizer"></div>'));
          });

          $('#conversation-container').html("");

          var masonryOptions = {
            itemSelector: '.item',
            columnWidth: '.masonry-layout .item',
            gutter: '.gutter-sizer',
            percentPosition: true
          };

          var $grid = $('.masonry-layout').masonry(masonryOptions);

          $.each(mdatapinnd, function(k, bb) {
            var $content = $(bb);
            // add jQuery object
            $grid.append($content).masonry('appended', $content);
          });

          $grid.masonry('destroy');
          $grid.masonry(masonryOptions);

          afterAppendEventInConnectpage();
        }
      });
    }
  });

  function pinBlockDesign(v) {
    var cokkieDesign = '<div class="item ui-widget-content" onclick="openProfilePage(this)">';
    cokkieDesign += '        <div class="box box-' + v.display + ' online_' + v.user_id + ' offline">';
    cokkieDesign += '          <div class="box-msg nomsg" id="nomsg' + v.conversation_id + '" style="display: none;"></div>';
    cokkieDesign += '          <div class="box-header" data-name="' + v.users_name + '" data-img="navigate group.jpg" data-id="' + v.user_id + '" data-conversationtype="' + v.conversation_type + '"  data-conversationid="' + v.conversation_id + '">';
    cokkieDesign += '            <div class="box-title">' + v.users_name + '</div>';
    cokkieDesign += '            <div class="box-subtitle">' + v.sub_title + '</div>';
    cokkieDesign += '            <img src="/images/pin-on_16px_500 @1x.png" class="pin-to-bar pined" data-pinned="' + v.pinned + '">';
    cokkieDesign += '          </div>';
    cokkieDesign += '          <div class="box-body" id="msgbody' + v.conversation_id + '" data-msgtype="" data-msgid="" style="display: none;"></div>';
    cokkieDesign += '          <div class="msg-time" id="msgtime' + v.conversation_id + '" style="display: none;"></div>';
    cokkieDesign += '        </div>';
    cokkieDesign += '      </div>';
    cokkieDesign += '      <div class="gutter-sizer"></div>';

    if (!$('#conversation-container').hasClass('classic-row')) {
      $("#conversation-container .item").draggable({
        helper: 'clone',
        opacity: 0.5
      });

      $('#conversation-container').append(cokkieDesign);
    } else {
      $('#conversation-container').append(cokkieDesign);
    }
  }

  function unpinBlockDesign(v) {
    var cokkieDesign = '<div class="item ui-widget-content" onclick="openProfilePage(this)">';
    cokkieDesign += '        <div class="box box-' + v.display + ' online_' + v.user_id + ' offline" >';
    cokkieDesign += '          <div class="box-msg nomsg" id="nomsg' + v.conversation_id + '" style="display: none;"></div>';
    cokkieDesign += '          <div class="box-header" data-name="' + v.users_name + '" data-img="navigate group.jpg" data-id="' + v.user_id + '" data-conversationtype="' + v.conversation_type + '"  data-conversationid="' + v.conversation_id + '">';
    cokkieDesign += '            <div class="box-title">' + v.users_name + '</div>';
    cokkieDesign += '            <div class="box-subtitle">' + v.sub_title + '</div>';
    cokkieDesign += '            <img src="/images/pin-off_16px_200 @1x.png" class="pin-to-bar" >';
    cokkieDesign += '          </div>';
    cokkieDesign += '          <div class="box-body" id="msgbody' + v.conversation_id + '" data-msgtype="" data-msgid="" style="display: none;"></div>';
    cokkieDesign += '          <div class="msg-time" id="msgtime' + v.conversation_id + '" style="display: none;"></div>';
    cokkieDesign += '        </div>';
    cokkieDesign += '      </div>';
    cokkieDesign += '      <div class="gutter-sizer"></div>';

    if (!$('#conversation-container').hasClass('classic-row')) {
      $("#conversation-container .item").draggable({
        helper: 'clone',
        opacity: 0.5
      });

      $('#conversation-container').append(cokkieDesign);

    } else {
      $('#conversation-container').append(cokkieDesign);
    }
  }

  // when click on file upload btn from message page
  $('.btn-cleate-file-upload').on('click', function() {
    $('#msg_file').trigger('click');
  });

  // all_action_for_selected_member();

  $(".up-arrow").click(function(event) {
    $('html, body').animate({ scrollTop: '-=650px' }, 800);
  });

  $(".down-arrow").click(function(event) {
    $('html, body').animate({ scrollTop: '+=650px' }, 800);
  });

});

var convert = (str) => {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var text1 = str.replace(exp, "<a target='_blank' href='$1'>$1</a>");
  var exp2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  return text1.replace(exp2, '$1<a target="_blank" href="http://$2">$2</a>');
};

var msg_form_submit = () => {
  var str = $('#msg').html();
  str = str.replace(/(<\/?(?:img|br)[^>]*>)|<[^>]+>/ig, '$1'); // replace all html tag
  str = convert(str);
  str = str.replace(/&nbsp;/gi, '').trim();
  str = str.replace(/^(\s*<br( \/)?>)*|(<br( \/)?>\s*)*$/gm, '');
  if (str != "") {
    // if($('.fileobj').length > 0){
    //   // var formData = new FormData($('#message-form')[0]);
    //   var formData2 = new FormData();
    //   var obj = $('.fileobj');

    //   for(n=0; n < formDataTemp.length; n++){
    //     for(var i = 0; i < obj.length; i++){
    //       if($(obj[i]).attr('data-name') == formDataTemp[n].name){
    //         formData2.append('photos', formDataTemp[n]);
    //       }
    //     }
    //   }
    //   $.ajax({
    //       xhr: function() {
    //         $('.progress').show();
    //         var xhr = new window.XMLHttpRequest();
    //         xhr.upload.addEventListener("progress", function(evt) {
    //             if (evt.lengthComputable) {
    //                 var percentComplete = evt.loaded / evt.total;
    //                 var percom = Math.ceil(percentComplete*100) - 1;
    //                 // console.log(percom);
    //                 $(".progress-bar").html(percom+"%");
    //                 $(".progress-bar").css("width", percom+"%");
    //                 $(".progress-bar").attr("aria-valuenow", percom);
    //             }
    //         }, false);
    //         return xhr;
    //       },
    //       url: '/hayven/send_message',
    //       type: "POST",
    //       data: formData2,
    //       dataType: 'json',
    //       contentType: false,
    //       processData: false,
    //       success: function(res){
    //         if(res.file_info.length){
    //           $('.progress').hide();
    //           add_file_data(res.file_info);
    //           $("#attach_file_preview_con").html("");
    //           $("#attach_file_preview").hide();
    //           msg_sending_process(str);
    //         }else{
    //           alert(res.msg);
    //         }
    //       }
    //   });
    // }
    // else{
    msg_sending_process(str);
    // }
  }
};
var msg_sending_process = (str) => {
  var is_room = (conversation_type == 'group') ? true : false;
  socket.emit('sendMessage', {
    conversation_id: conversation_id,
    sender_img: user_img,
    sender_name: user_fullname,
    to: to,
    is_room: is_room,
    text: str,
    attach_files: filedata[0],
    thread_root_id: swap_conversation_id
  }, (respond) => {
    $('.typing-indicator').remove();
    var last_msg_id = respond.res;
    if ($('#msg').hasClass('thread-message')) {
      var html = per_msg_top(last_msg_id, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false, 'replies-close');
    } else {
      var html = per_msg_top(last_msg_id, moment().format("MMM Do, YYYY"), 'right-msg', 'mirror', user_img, user_fullname, false);
    }
    html += per_msg_main_body(last_msg_id, str, '', moment().format('h:mm a'), false);

    $('.message-container').append(html);
    scrollToBottom('.message-container');
    if (filedata.length) {
      if (filedata[0].videofile.length) {
        per_msg_video_attachment(filedata[0].videofile);
      }
      if (filedata[0].audiofile.length) {
        per_msg_audio_attachment(filedata[0].audiofile);
      }
      if (filedata[0].imgfile.length) {
        html = per_msg_image_attachment(filedata[0].imgfile);
        $('.message-container .per-msg:last-child').find('.attachment').append(html);
      }
      if (filedata[0].otherfile.length) {
        per_msg_file_attachment(filedata[0].otherfile);
      }
    }

    filedata = [];
    audiofile = [];
    videofile = [];
    imgfile = [];
    otherfile = [];

    $('#msg').text("");
    scrollToBottom('.message-container');
    if ($('.msg_id_' + last_msg_id).find('.msg-text a').length > 0) {
      // console.log(813, $('.msg_id_'+last_msg_id).find('.msg-text a').attr('href'));
      var url = $('.msg_id_' + last_msg_id).find('.msg-text a').attr('href');
      socket.emit('msg_url2preview', {
        url: url,
        to: to,
        conversation_id: conversation_id,
        msgid: last_msg_id
      }, (response) => {
        console.log(response);
        // per_msg_url_attachment(response.data.ogSiteName, response.data.ogTitle, response.data.ogDescription, response.data.ogImage.url);
        per_msg_url_attachment(response.publisher, response.title, response.description, response.image, response.logo);
      });
    }
    lightbox_call();
    scrollToBottom('.message-container');
    if ($('#msg').hasClass('thread-message')) {
      conversation_id = swap_conversation_id;
      swap_conversation_id = "";
    }
  });
}
socket.on('url2preview', function(data) {
  // console.log(data);
  // per_msg_url_attachment(data.data.ogSiteName, data.data.ogTitle, data.data.ogDescription, data.data.ogImage.url);
  per_msg_url_attachment(data.publisher, data.title, data.description, data.image, data.logo);
});
/** Unpin from pin-bar, when click on the pin items */
var unpinme = (event) => {
  var name = $(event.target).attr('title');
  $.each($('.pined'), function(k, v) {
    if ($(v).closest('.box-header').attr('data-name') == name) {
      $(v).attr('src', '/images/pin-off_16px_200 @1x.png');
      $(v).removeClass('pined');
      $(event.target).remove();
    }
  });
};
var unpining = (name) => {
  $.each($('.pin-bar .pin-item'), function(k, v) {
    if ($(v).find('img').attr('title') == name) {
      $(v).remove();
    }
  });
};

/** per message hover icon end*/

/** Clear search box */
var clearSearch = () => {
  clearingSearch();
};
// var clearingSearch = () => {
//   $('.search-txt').val("");
//   $('.search-body').hide();
//   $('.search-bar .fa-times').hide();
//   // $('.pin-bar').show();
//   $('.body-bar').show();
//   $('.search-bar .filter-btn').show();
//   // $('.search-bar .input-group').css('width', '800px');
//   $('.search-bar').removeClass('sticky');
//   $('.gradient-body-bg').hide();
// };
var clearingSearch = () => {
  $('.search-txt').val("");
  $('.search-body').hide();
  $('.search-bar .fa-times').hide();
  // $('.pin-bar').show();
  $('.body-bar').show();
  $('.search-bar .filter_body').show();
  // $('.search-bar .input-group').css('width', '800px');
  $('.search-bar').removeClass('sticky');
  $('.gradient-body-bg').hide();
  $('.action-btn').show();
  $('.action-connect-tiles').show();
  $('.filter_body').show();
};
/** End clear search box */





/** Conversation more option div show */
var open_more_option = () => {
  $('.more-option').show();
  var offset = $('.more').offset();
  $('.more-option').offset({ top: offset.top });
}

/** Suggested member list onkeyup when press @
send email invite li open */
var send_email_invite = (email) => {
  var html = '<li class="invite-email-text">';
  html += '<img src="/images/guest-email_26px_000 @1x.png" class="profile">';
  html += '<span class="name">' + email + '</span>';
  html += '<img src="/images/send_invitation.png" class="send-invite-email" onclick="add2members()">';
  html += '</li>';
  $('.right-part .suggested-type-list ul').append(html);
};
/** Add the email to the selected member list, in pending list */
var add2members = () => {
  var str = $('.add-team-member').val();
  $('.selected-group-guests').show();
  var html = '<li>';
  html += '<img src="/images/guest-email_26px_000 @1x.png" class="profile">';
  html += '<span class="name">' + str + '</span>';
  html += '<img src="/images/remove_8px_200 @1x.png" class="remove-it">';
  html += '</li>';
  $('.selected-group-guests ul').append(html);
  $('.remove-suggested-type-list').trigger('click');
  all_action_for_selected_member();
};



/*per message hover icon*/
/*emoji icon start*/
var reaction_div_draw = () => {
  var design = '<div class="reac_div">';
  design += '<img src="/images/emoji/grinning.png" data-name="grinning" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/joy.png" data-name="joy" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/open_mouth.png" data-name="open_mouth" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/disappointed_relieved.png" data-name="disappointed_relieved" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/rage.png" data-name="rage" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/thumbsup.png" data-name="thumbsup" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/thumbsdown.png" data-name="thumbsdown" onclick="add_reac_into_replies(event)">';
  design += '<img src="/images/emoji/heart.png" data-name="heart" onclick="add_reac_into_replies(event)">';
  design += '</div>';
  return design;
};
var open_reaction = (event) => {
  if ($('.reac_div').length == 0) {
    var design = reaction_div_draw();
    $(event.target).closest('.per-msg').append(design);
    $('.backWrap').css('background-color', 'transparent');
    $('.backWrap').show();
    var offset = $(event.target).offset();
    $('.reac_div').offset({ top: offset.top - 60, left: offset.left - 144 });
    $(event.target).closest('.per-msg').addClass('active');
  } else {
    $(event.target).closest('.per-msg').removeClass('active');
    $('.reac_div').remove();
    $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
    $('.backWrap').hide();
  }
};
var add_reac_into_replies = (event) => {
  var msg_id = $(event.target).closest('.per-msg').attr('data-msgid');
  var src = $(event.target).attr('src');
  var emojiname = $(event.target).attr('data-name');

  $.ajax({
    url: '/hayven/add_reac_emoji',
    type: 'POST',
    data: { msgid: msg_id, emoji: emojiname },
    dataType: 'JSON',
    success: function(res) {
      if (res.status) {
        if (res.rep == 'add') {
          append_reac_emoji(msg_id, src, 1);
          socket.emit("emoji_emit", { room_id: to, msgid: msg_id, emoji_name: emojiname, count: 1 });
        } else if (res.rep == 'delete') {
          update_reac_emoji(msg_id, src, -1);
        } else if (res.rep == 'update') {
          update_reac_emoji(msg_id, '/images/emoji/' + res.old_rep + '.png', -1);
          append_reac_emoji(msg_id, src, 1);
        }
      }
    },
    error: function(err) {
      console.log(err.responseText);
    }
  });
};
var append_reac_emoji = (msgid, src, count) => {
  var allemoji = $('.msg_id_' + msgid).find('.emoji img');
  if (allemoji == undefined) {
    emoji_html(msgid, src, count);
  } else {
    var noe = 0;
    $.each(allemoji, function(k, v) {
      if ($(v).attr('src') == src) {
        noe = parseInt($(v).next('.count-emoji').text());
        $(v).next('.count-emoji').text(noe + 1);
      }
    });
    if (noe === 0) {
      emoji_html(msgid, src, count);
    }
  }
  $('.reac_div').remove();
  $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
  $('.backWrap').hide();
};
var update_reac_emoji = (msgid, src, count) => {
  var allemoji = $('.msg_id_' + msgid).find('.emoji img');

  var noe = 0;
  $.each(allemoji, function(k, v) {
    if ($(v).attr('src') == src) {
      noe = parseInt($(v).next('.count-emoji').text());
      if (noe == 1)
      $(v).closest('.emoji').remove();
      else
      $(v).next('.count-emoji').text(noe - 1);
    }
  });

  $('.reac_div').remove();
  $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
  $('.backWrap').hide();
};
var emoji_html = (msgid, src, count) => {
  var emoji_name = ((src.split('/'))[3]).replace('.png', '');
  var html = '<span class="emoji '+emoji_name+' " onmouseover="open_rep_user_emo(event)" onmouseout="close_rep_user_emo(event)">';
  html += '<img src="' + src + '"> ';
  html += '<span class="count-emoji">' + count + '</span>';
  html += '</span>';
  $('.msg_id_' + msgid).find('.replies').append(html);
};
var open_rep_user_emo = (event) => {
  if ($('.rep_user_emo_list').length == 0) {
    var msg_id = $(event.target).closest('.per-msg').attr('data-msgid');
    var emoji_name = (($(event.target).closest('.emoji').find('img').attr('src').split('/'))[3]).replace('.png', '');
    $.ajax({
      url: '/hayven/emoji_rep_list',
      type: 'POST',
      data: { msgid: msg_id, emojiname: emoji_name },
      dataType: 'JSON',
      success: function(res) {
        if (res.length > 0) {
          var html = '<div class="rep_user_emo_list">';
          $.each(res, function(k, v) {
            html += v.user_fullname + '<br>';
          });
          html += '</div>';
          $('.msg_id_' + msg_id).find('.'+ emoji_name).append(html);
          var div_offset = $(event.target).closest('.emoji').offset();
          console.log(div_offset);
          $('.rep_user_emo_list').css('left', div_offset.left - 300);
        }
      },
      error: function(err) {
        console.log(err.responseText);
      }
    });
  }
};
var close_rep_user_emo = (event) => {
  $('.rep_user_emo_list').remove();
};
$('.msg-con').mouseleave(function() {
  $('.rep_user_emo_list').remove();
});

var open_thread = (event) => {
  var msgid = $(event.target).closest('.per-msg').attr('data-msgid');
  var count_no_msg = 0;

  $.ajax({
    url: "/hayven/open_thread",
    type: "POST",
    data: { msg_id: msgid, conversation_id: conversation_id },
    dataType: "JSON",
    success: function(threadrep) {
      // console.log(1032, threadrep);
      thread_id = threadrep;
      thread_root_id = msgid;
      // console.log("1035 thread_id", thread_id);
      // console.log("1036 thread_root_id", thread_root_id);
      find_and_show_reply_msg(msgid);
    },
    error: function(err) {
      console.log(err.responseText);
    }
  });
};
var noofreply = 0;
var change_msg_send_option = (msgid) => {
  var whos_msg = $('.msg_id_' + msgid).find('.user-name').text();
  $('.more-option').hide();
  $('.per-msg').hide();
  $('.msg_id_' + msgid).show();
  var msgdate = $('.msg_id_' + msgid).prev('.separetor').attr('data-msgdate');
  $('.separetor').remove();
  $('.msg_id_' + msgid).before('<div class="separetor" data-msgdate="' + msgdate + '">' + msgdate + '</div>');
  $('.message-container').append('<div class="replies-here">Replies</div>');
  $('.reply_thread').hide();
  $('.replies').hide();
  var nor = parseInt($('.msg_id_' + msgid).find('.no-of-replies').text().replace(' replies', ''));
  if (isNaN(nor)) nor = 0;
  noofreply = nor;
  var top_head = top_header_for_filtered_msg('view-thread_40px_900 @1x.png', nor + ' replies on ' + whos_msg + '\'s message', '', msgid);
  $('.convo-sticky-sidebar-single').hide();
  $('body').append(top_head);
  $('#msg').addClass('thread-message');
  $('.msg-thread-label').show();
  $('#msg').attr('placeholder', 'Reply to ' + whos_msg);
  $('.gradient-body-bg').show();
  $('.ml-header').css('margin-top', '48px');
  $('.message-container').css('margin-top', '48px');
  $('.group-name').css('padding-top', '28');
};
$('.replay-thread').on('click', function() {
  // $(this).find('.rt-hoverhide').hide();
  // $(this).find('.view-thread').show();
  var msgid = $(this).closest('.per-msg').attr('data-msgid');
  var uname = $('.msg_id_' + msgid).find('.user-name').text();
  find_and_show_reply_msg(msgid);
});

$('.view-thread').on('click', function() {
  var msgid = $(this).closest('.per-msg').attr('data-msgid');
  var uname = $('.msg_id_' + msgid).find('.user-name').text();
  find_and_show_reply_msg(msgid);
});
var find_and_show_reply_msg = (msgid) => {
  change_msg_send_option(msgid);
  // alert(noofreply);
  if (noofreply > 0) {
    socket.emit('find_reply', { msg_id: msgid, conversation_id: conversation_id }, (reply_list) => {
      if (reply_list.status) {
        // console.log(reply_list);
        var reply_list_data = _.sortBy(reply_list.data, ["created_at", ]);

        var need_update_reply_message_seen_list = [];

        $.each(reply_list_data, function(key, row) {
          thread_id = row.conversation_id;
          thread_root_id = msgid;

          if (row.msg_status == null) {
            if (row.sender == user_id) {
              // This msg send by this user; so no need to change any seen status
            } else {
              // This msg receive by this user; so need to change seen status
              need_update_reply_message_seen_list.push(row.msg_id);
            }
          }

          var right_msg = "",
          mirror = "";
          if (row.sender == user_id) {
            right_msg = 'right-msg';
            mirror = 'mirror';
          }
          var html = per_msg_top(row.msg_id, moment(row.created_at).format("MMM Do, YYYY"), right_msg, mirror, row.sender_img, row.sender_name, false, 'replies-close');
          html += per_msg_main_body(row.msg_id, row.msg_body, '', moment(row.created_at).format('h:mm a'), true);
          $('.message-container').append(html);

          per_msg_emoji(row.has_emoji);
          // console.log(row);

          if (row.attch_videofile != null) {
            per_msg_video_attachment(row.attch_videofile);
          }

          if (row.attch_audiofile != null) {
            per_msg_audio_attachment(row.attch_audiofile);
          }

          if (row.attch_imgfile != null) {
            html = per_msg_image_attachment(row.attch_imgfile);
            $('.message-container .per-msg:last-child').find('.attachment').append(html);
            lightbox_call();
          }

          if (row.attch_otherfile != null) {
            per_msg_file_attachment(row.attch_otherfile);
          }

          $('.reply_thread').hide();

          if ($('.separetor').prev('div').hasClass('replies-here')) {
            $('.replies-here').css('margin-bottom', '5px');
          }
        });


        if (need_update_reply_message_seen_list.length > 0) {
          $.ajax({
            url: '/hayven/update_msg_status',
            type: 'POST',
            data: {
              msgid_lists: JSON.stringify(need_update_reply_message_seen_list),
              user_id: user_id
            },
            dataType: 'JSON',
            success: function(res) {
              socket.emit('update_msg_seen', {
                msgid: need_update_reply_message_seen_list,
                senderid: to,
                receiverid: user_id,
                conversation_id: conversation_id
              });
            },
            error: function(err) {
              console.log(err);
            }
          });
        }
        // separetor_show_hide();
      } else {
        console.log('replay search query error', reply_list); // error meessage here
      }
    });
  }
};

var flag_unflag = (event) => {
  var msgid = $(event.target).closest('.per-msg').attr('data-msgid');
  if ($(event.target).hasClass('flaged')) {
    $.ajax({
      url: '/hayven/flag_unflag',
      type: 'POST',
      data: { uid: user_id, msgid: msgid, is_add: 'no' },
      dataType: 'JSON',
      success: function(res) {
        if (res.status) {
          $(event.target).attr('src', '/images/incoming-flag_20px @1x.png');
          $(event.target).removeClass('flaged');
        }
      },
      error: function(err) {
        console.log(err.responseText);
      }
    });
  } else {
    $.ajax({
      url: '/hayven/flag_unflag',
      type: 'POST',
      data: { uid: user_id, msgid: msgid, is_add: 'yes' },
      dataType: 'JSON',
      success: function(res) {
        if (res.status) {
          $(event.target).attr('src', '/images/flagged_20px @1x.png');
          $(event.target).addClass('flaged');
        }
      },
      error: function(err) {
        console.log(err.responseText);
      }
    });
  }
};
var open_more_div_draw = (msgid) => {
  var design = '<div class="msg_open_more_div">';
  design += '<ul>';
  design += '<li onclick="add_tag(\'' + msgid + '\')">Add Tags</li>';
  design += '<li onclick="share_this_msg(\'' + msgid + '\')">Share</li>';
  design += '<li onclick="delete_this_msg(event)">Delete</li>';
  design += '</ul>';
  design += '</div>';
  return design;
};
var open_more = (msgid, event) => {
  if ($('.msg_open_more_div').length == 0) {
    var design = open_more_div_draw(msgid);
    $(event.target).closest('.per-msg').append(design);
    $('.backWrap').css('background-color', 'transparent');
    $('.backWrap').show();
    var offset = $(event.target).offset();
    $('.msg_open_more_div').offset({ top: offset.top - 80, left: offset.left - 0 });
    $(event.target).closest('.per-msg').addClass('active');
  } else {
    $(event.target).closest('.per-msg').removeClass('active');
    $('.msg_open_more_div').remove();
    $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
    $('.backWrap').hide();
  }
}
/*end per message hover icon*/

var emoji_div_draw = () => {
  var design = '<div class="emoji_div">';
  design += '<div class="emoji-header"><img src="/images/emoji/temp-emoji-head.png"></div>';
  design += '<div class="search-emoji-from-list">';
  design += '<input type="text" placeholder="Search">';
  design += '</div>';
  design += '<div class="emoji-container-name">SMILEYS & PEOPLE</div>';
  design += '<div class="emoji-container">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/rage.png">';
  design += '<img src="/images/emoji/heart.png">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/heart.png">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/heart.png">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/heart.png">';
  design += '<img src="/images/emoji/grinning.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '<img src="/images/emoji/disappointed_relieved.png">';
  design += '<img src="/images/emoji/joy.png">';
  design += '<img src="/images/emoji/open_mouth.png">';
  design += '</div>';
  design += '</div>';
  return design;
};
var open_emoji = () => {
  if ($('.emoji_div').length == 0) {
    var design = emoji_div_draw();
    $('main').append(design);
    // if wrap need open this
    // $('.backWrap').css('background-color', 'transparent');
    // $('.backWrap').show();
    var offset = $(".emoji-search").offset();
    $('.emoji_div').css({ left: offset.left - 310 });
    insert_emoji();
  } else {
    $('.emoji_div').remove();
    // $('.backWrap').css('background-color', 'rgba(0, 0, 0, 0.33)');
    // $('.backWrap').hide();
  }
}
var insert_emoji = () => {
  $('.emoji_div .emoji-container>img').on('click', function() {
    var emoji_name = $(this).attr('src');
    $('#msg').append('<img src="' + emoji_name + '" style="width:20px; height:20px;" />');
    open_emoji();
  });
};
// var open_members_view_div = () => {
//     if ($('.members-list').is(':visible')) {
//         $('.members-list').hide();
//         $('.chat-page').show();
//         $('.convo-sticky-sidebar-single').show();
//         $('.gradient-body-bg').hide();
//     } else {
//         $('.members-list').show();
//         $('.gradient-body-bg').show();
//         $('.chat-page').hide();
//         $('.convo-sticky-sidebar-single').hide();
//     }
// }
var close_container = () => {
  $('.members-list').hide();
  $('.chat-page').show();
  $('.convo-sticky-sidebar-single').show();
  $('.gradient-body-bg').hide();
}
var close_filter_container = (reload = false) => {
  if (reload === false) {
    $('.ml-header').remove();
    $('.replies-here').remove();
    $('.replies-close').remove();
    $('.reply_thread').show();
    $('.replies').show();
    $('.separetor').show();
    $('.per-msg').show();
    $('.per-msg .profile-picture img').show();
    $('.convo-sticky-sidebar-single').show();
    $('.message-send-form').show();
    $('.gradient-body-bg').hide();
    $('.selectIt').hide();
    $('.message-container').css('margin-top', '0px');
    $('#msg').removeClass('search-message');
    $('#msg').removeClass('thread-message');
    $('.msg-search-label').hide();
    $('.msg-thread-label').hide();
    $('#msg').attr('placeholder', 'Write a message here...');
    $('#msg').text('');
    $('.itl-template').css('margin-left', '0px');
    thread_id = "";
    thread_root_id = "";
  } else {
    setCookie('msgidforreload', reload, 1);
    location.reload();
  }
}

var top_header_for_filtered_msg = (lefticon, header, sub_head, reload = false) => {
  var html = '<div class="ml-header" style="margin-top:48px; left: 0; border-top: 1px solid #f8f9fa;">';
  html += '<div class="ml-container">';
  html += '<img src="/images/' + lefticon + '" class="view-team-icon">';
  html += '<div class="group-name">' + header + '</div>';
  html += '<div class="no-group-members">' + sub_head + '</div>';
  html += '<img style="top:-35px;" src="/images/close_32px_100 @1x.png" class="close-container" onclick="close_filter_container(\'' + reload + '\')">';
  html += '</div>';
  html += '</div>';
  return html;
}

var open_search_msg = () => {
  // $.each($('.per-msg'), function(k, v){
  //   if(k > 8){
  //     $(v).prev('.separetor').hide();
  //     $(v).hide();
  //   }
  // });
  $('.more-option').hide();
  var top_head = top_header_for_filtered_msg('view-search_40px @1x.png', 'Searching for ', '0 results');
  $('.convo-sticky-sidebar-single').hide();
  $('body').append(top_head);
  $('.gradient-body-bg').show();
  $('.ml-header').css('margin-top', '49px');
  $('.ml-header').css('left', '0px');
  $('.message-container').css('margin-top', '48px');
  $('#msg').addClass('search-message');
  $('.msg-search-label').show();
  $('#msg').attr('placeholder', 'Search chat');
  $('#msg').focus();
  $('.msg-search-label').hide();
};

// var flagged_messages = () => {
//     var count_no_msg = $('.per-msg').length;
//     $.each($('.per-msg'), function(k, v) {
//         if (!$(v).find('.toolbar-img').hasClass('flaged')) {
//             $(v).prev('.separetor').hide();
//             $(v).hide();
//             count_no_msg--;
//         }
//     });
//     $('.more-option').hide();
//     var top_head = top_header_for_filtered_msg('view-flagged_40px @1x.png', 'Flagged messages', count_no_msg + ' result');
//     $('.convo-sticky-sidebar-single').hide();
//     $('body').append(top_head);
//     $('.gradient-body-bg').show();
//     $('.ml-header').css('margin-top', '48px');
//     $('.message-container').css('margin-top', '48px');
// };

var tagged_messages = () => {
  var count_no_msg = $('.per-msg').length;
  $.each($('.per-msg'), function(k, v) {
    if ($(v).find('.tags').length != 1) {
      $(v).prev('.separetor').hide();
      $(v).hide();
      count_no_msg--;
    }
  });
  $('.more-option').hide();
  var top_head = top_header_for_filtered_msg('view-tagged_40px @1x.png', 'Tagged messages', count_no_msg + ' result');
  $('.convo-sticky-sidebar-single').hide();
  $('body').append(top_head);
  $('.gradient-body-bg').show();
  $('.ml-header').css('margin-top', '48px');
  $('.message-container').css('margin-top', '48px');
};


var show_all_msg = () => {
  $.each($('.per-msg'), function() {
    $(this).prev('.separetor').show();
    $(this).show();
  });
};

var media_mgs = () => {
  // var count_no_img = $('.message-container').find('.media-msg').length;
  show_all_msg();
  $.each($('.per-msg'), function() {
    if ($(this).find('.media-msg').length == 0) {
      $(this).prev('.separetor').hide();
      $(this).hide();
    }
  });
};

var link_mgs = () => {
  show_all_msg();
  $.each($('.per-msg'), function() {
    if ($(this).find('.msg-text>a').length == 0) {
      $(this).prev('.separetor').hide();
      $(this).hide();
    }
  });
};

var file_mgs = () => {
  show_all_msg();
  $.each($('.per-msg'), function() {
    if ($(this).find('.attach-file').length == 0) {
      $(this).prev('.separetor').hide();
      $(this).hide();
    }
  });
};

var tag_msg = () => {
  show_all_msg();
  $.each($('.per-msg'), function() {
    if ($(this).find('.tag-list').length == 0) {
      $(this).prev('.separetor').hide();
      $(this).hide();
    }
  });
};

var flagged_messages = () => {
  // var count_no_msg = $('.per-msg').length;
  $.each($('.per-msg'), function(k, v) {
    if (!$(v).find('.toolbar-img').hasClass('flaged')) {
      $(v).prev('.separetor').hide();
      $(v).hide();
      // count_no_msg--;
    }
  });
  // $('.more-option').hide();
  // var top_head = top_header_for_filtered_msg('view-flagged_40px @1x.png', 'Flagged messages', count_no_msg + ' result');
  // $('.convo-sticky-sidebar-single').hide();
  // $('body').append(top_head);
  // $('.gradient-body-bg').show();
  // $('.ml-header').css('margin-top', '48px');
  // $('.message-container').css('margin-top', '48px');
};
// var files_media_mgs = () => {
//     var count_no_img = $('.message-container').find('.lightbox').length;
//     var count_no_files = $('.message-container').find('.attach-file').length;
//     var count_no_links = $('.message-container').find('.msg-text>a').length;
//     $.each($('.per-msg'), function() {
//         if ($(this).find('.attachment').children().length == 0) {
//             $(this).prev('.separetor').hide();
//             $(this).hide();
//         }
//     });
//     // $('.more-option').hide();
//     // var top_head = top_header_for_filtered_msg('view-files_40px @1x.png', 'Files shared in Random Coffee', count_no_files + ' documents, ' + count_no_img + ' images, ' + count_no_links + ' links');
//     // $('.convo-sticky-sidebar-single').hide();
//     // $('body').append(top_head);
//     // $('.gradient-body-bg').show();
//     // $('.ml-header').css('margin-top', '48px');
//     // $('.message-container').css('margin-top', '48px');
// };

var bottom_select_msg = (lefticon, header, sub_head) => {
  var html = '<div class="ml-header">';
  html += '<div class="ml-container">';
  html += '<input type="checkbox" class="selectIt selectItAll">';
  html += '<span class="no-select-msg">0</span><span> Selected</span>';
  html += '<img src="/images/close_32px_100 @1x.png" class="close-container" onclick="close_filter_container()">';
  html += '<img src="/images/selected-delete_32px_200 @1x.png" class="bottom-footer-select-tools" onclick="close_filter_container()">';
  html += '<img src="/images/selected-share_32px_200 @1x.png" class="bottom-footer-select-tools" onclick="close_filter_container()">';
  html += '<img src="/images/selected-flag_32px_200 @1x.png" class="bottom-footer-select-tools" onclick="close_filter_container()">';
  html += '<img src="/images/selected-thread_32px_200 @1x.png" class="bottom-footer-select-tools" onclick="close_filter_container()">';
  html += '</div>';
  html += '</div>';
  return html;
}

var select_messages = () => {
  // $('.per-msg .profile-picture img').hide();
  $('.itl-template').css('margin-left', '56px');
  // if ($(window).width() <= 720) {
  //     $('.itl-template').css('margin-left', '0px');
  // } else {
  //     $('.itl-template').css('margin-left', '56px');
  // }

  $('.message-send-form').hide();
  $('.more-option').hide();
  $('.convo-sticky-sidebar-single').hide();
  $('.selectIt').show();
  var bottom_foot = bottom_select_msg('view-files_40px @1x.png', 'Files shared in Random Coffee 2 documents, 6 images, 5 links');
  $('.message-container').append(bottom_foot);
  $('.gradient-body-bg').show();
  $('.ml-header').css({ 'bottom': '0', 'width': '7', 'left': '0px' });
  $('.ml-container').css({ 'padding-top': '28px', 'position': 'relative', 'top': '-8px', 'left': '-24px' });
  $('.selectItAll').css({ 'margin-left': '72px', 'margin-top': '-5px' });
  $('.close-container').css({ 'top': '-3px', 'margin-right': '-32px' });
};

var hide_view_thread = () => {
  $('.view-thread').hide();
  $('.rt-hoverhide').show();
}

var per_msg_top = (msgid, msg_date, msg_right, msg_mirror, msg_user_img, msg_user_name, msg_is_flag, add_removeClass = "") => {
  var msg_data_date = msg_date;
  $.each($('.separetor'), function(k, v) {
    if ($(v).text() == msg_date) {
      msg_date = " ";
      return 0;
    }
  });

  var html = "";
  html += '<div class="separetor ' + add_removeClass + '" data-msgdate="' + msg_data_date + '">' + msg_date + '</div>';
  html += '<div class="per-msg ' + msg_right + ' msg_id_' + msgid + ' ' + add_removeClass + '" data-msgid="' + msgid + '">';
  html += '<input type="checkbox" class="selectIt">';
  html += '<div class="profile-picture">';
  html += '<img src="/images/users/' + msg_user_img + '">';
  html += '</div>';
  html += '<div class="triangle-up-right ' + msg_mirror + '"></div>';
  html += '<div class="msg-con">';
  html += '<div class="msg-header">';
  html += '<div class="user-name">' + msg_user_name + '</div>';
  html += '<div class="toolbar">';
  html += '<img src="/images/incoming-reaction_20px @1x.png" class="toolbar-img" onclick="open_reaction(event)">';
  html += '<img src="/images/incoming-thread_20px @1x.png" class="toolbar-img reply_thread" onclick="open_thread(event)">';
  if (msg_is_flag) {
    html += '<img src="/images/flagged_20px @1x.png" class="toolbar-img flaged" onclick="flag_unflag(event)">';
  } else {
    html += '<img src="/images/incoming-flag_20px @1x.png" class="toolbar-img" onclick="flag_unflag(event)">';
  }
  html += '<img src="/images/incoming-more_20px @1x.png" class="toolbar-img" onclick="open_more(\'' + msgid + '\',event)">';
  html += '</div>';
  html += '</div>'; // end of 'msg-header' div
  return html;
};
var per_msg_main_body = (msg_id, msg_text, msg_link_url, msg_time, msg_status = true) => {
  // console.log('per_msg_main_body',msg_id, msg_text, msg_link_url, msg_time, msg_status);
  var html = "";
  html += '<div class="msg-body">';
  html += '<div class="body-text">';
  html += '<span class="msg-text">' + msg_text;
  if (msg_link_url.length > 0) {
    html += '<a href="' + msg_link_url[0] + '" target="_blank">' + msg_link_url[0] + '</a>';
  }
  html += '\n</span>';
  html += '<span class="per-msg-time">' + msg_time + '</span>';
  html += '<span class="msg-send-seen-delivered">';
  if (msg_status) {
    html += '<img src="/images/reciept-delivered_14px_200 @1x.png">';
  } else {
    html += '<img src="/images/reciept-sent_14px_200 @1x.png">';
  }
  html += '</span>';

  html += '<div class="attachment"></div>';
  html += '<div class="tags" id="msgTag' + msg_id + '"></div><div class="replies"></div>';
  html += '</div>'; // end of 'body-text' div
  html += '<div class="per-msg-action"><img src="/images/NavbarIcons/actions-create_24px_FFF.png" class="pointer"></div>';
  html += '</div>'; // end of 'msg-body' div
  html += '<div class="msg-footer"></div>';
  html += '</div>'; // end of 'msg-con' div, which start when call the per_msg_top() function.
  html += '</div>'; // end of 'per-msg' div, which start when call the per_msg_top() function.
  return html;
};

var per_msg_image_attachment = (msg_attach_img) => {
  var html = '';
  if (msg_attach_img.length > 5)
  var imglen = 5;
  else
  var imglen = msg_attach_img.length;

  for (var i = 0; i < msg_attach_img.length; i++) {
    var fl = '';
    if (imglen >= 3 && i == 0)
    fl = "float:left";
    html += '<img src="' + file_server + '/upload/' + msg_attach_img[i] + '" alt="' + msg_attach_img[i] + '" style="' + fl + '" class="image' + imglen + ' lightbox media-msg">';
    // console.log(msg_attach_img[i]);
  }
  if (msg_attach_img.length > 5) {
    html += '<div class="more-images">+' + msg_attach_img.length - 5 + '</div>';
  }
  return html;
};

var per_msg_video_attachment = (msg_attach_video) => {
  $.each(msg_attach_video, function(k, v) {
    var file_type = v.split('.').pop().toLowerCase();
    var html = "";
    html += '<video controls class="media-msg">';
    html += '<source src="' + file_server + '/upload/' + v + '" type="video/' + file_type + '">';
    html += 'Your browser does not support HTML5 video.';
    html += '</video>';
    $('.message-container .per-msg:last-child').find('.attachment').append(html);
  });
}

var per_msg_audio_attachment = (msg_attach_audio) => {
  $.each(msg_attach_audio, function(k, v) {
    var file_type = v.split('.').pop().toLowerCase();
    var html = "";
    html += '<audio controls class="media-msg">';
    html += '<source src="' + file_server + '/upload/' + v + '" type="audio/' + file_type + '">';
    html += 'Your browser does not support audio tag.';
    html += '</audio>';
    $('.message-container .per-msg:last-child').find('.attachment').append(html);
  });
}

var per_msg_file_attachment = (msg_attach_file) => {
  // console.log(msg_attach_file);
  $.each(msg_attach_file, function(k, v) {
    var html = "";
    var file_type = v.split('.').pop().toLowerCase();
    switch (file_type) {
      case 'ai':
      case 'mp3':
      case 'doc':
      case 'docx':
      case 'indd':
      case 'js':
      case 'sql':
      case 'pdf':
      case 'ppt':
      case 'pptx':
      case 'psd':
      case 'svg':
      case 'xls':
      case 'xlsx':
      case 'zip':
      case 'rar':
      ext = file_type;
      break;
      default:
      ext = 'other';
    }
    html += '<div class="attach-file lightbox" data-filetype="' + ext + '" data-src="' + file_server + '/upload/' + v + '">';
    html += '<img src="/images/file_icon/' + ext + '.png" alt="' + v + '">';
    html += '<div class="file-name">' + v.substring(0, v.lastIndexOf('@')) + '.' + file_type + '</div>';
    html += '<div class="file-time">' + moment().format('h:mm a') + '</div>';
    html += '</div>';
    // console.log(html);
    $('.message-container .per-msg:last-child').find('.attachment').append(html);
  });

  // return html;
};
var per_msg_url_attachment = (site_name, title, des, img, logo = "/images/chat-action_20px_500 @1x.png") => {
  var html = '<div class="url-details">';
  html += '<div class="base-link"><img src="' + logo + '">' + site_name + '</div>';
  html += '<div class="title-link">' + title + '</div>';
  html += '<div class="detail-link">' + des + '</div>';
  html += '<img src="' + img + '" class="image1 lightbox">';
  html += '</div>';
  $('.message-container .per-msg:last-child').find('.attachment').append(html);
  $('.message-container .per-msg:last-child').find('.msg-text>a').text(title);
};
var per_msg_tags = (msg_tags) => {

};
var per_msg_replies_thread = (msg_replies_thread) => {

};
var per_msg_emoji = (msg_replies_emoji) => {
  $.each(msg_replies_emoji, function(key, value) {
    if (value > 0) {
      var html = "";
      html += '<span class="emoji" onmouseover="open_rep_user_emo(event)" onmouseout="close_rep_user_emo(event)">';
      html += '<img src="/images/emoji/' + key + '.png">';
      html += '<span class="count-emoji">' + value + '</span>';
      html += '</span>';
      $('.message-container .per-msg:last-child').find('.replies').append(html);
    }
  });
};

var draw_typing_indicator = (add_remove, img, name) => {
  if (add_remove) {
    if ($('.typing-indicator').length < 1) {
      var html = '';
      html += '<div class="per-msg typing-indicator">';
      html += '<div class="profile-picture">';
      html += '<img src="/images/users/' + img + '" alt="' + img + '">';
      html += '</div>';
      html += '<div class="triangle-up-right"></div>';
      html += '<div class="msg-con">';
      html += '<div class="msg-header">';
      html += '<div class="user-name">' + name + '</div>';
      html += '</div>';
      html += '<div class="msg-body">';
      html += '<div class="body-text">';
      html += '<img src="/images/outgoing-more_20px @1x.png">';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      $('.message-container').append(html);
      scrollToBottom('.message-container');
    }
  } else {
    $('.typing-indicator').remove();
  }
}
$('.profile-picture').on('click', function() {
  window.location = '/settings?profile=profile'
})
$('#text_search').click(function() {
  $('.header_area').hide();

});
$('.replay-thread').click(function() {
  $('.header_area').hide();

});

if($(window).width() <= 1024){
  $('#navbarsExampleDefault').removeClass('collapse navbar-collapse');
}
$(window).on('resize', function(){
  if($(this).width() <=1024){
    $('#navbarsExampleDefault').removeClass('collapse navbar-collapse');
  }else {
    $('#navbarsExampleDefault').removeClass('collapse navbar-collapse');
    $('#navbarsExampleDefault').addClass('collapse navbar-collapse');
  }
});


