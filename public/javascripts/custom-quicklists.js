$(document).ready(function(e){
  var taskCount =$(".Q-Tasks").length;
  if(taskCount > 0 ){
    $(".Q-Empty-Msg").hide();
    $("#Q-All-Task-List").show();
  }else {
    $(".Q-Empty-Msg").show();
    $("#Q-All-Task-List").hide();
  }
  TotalMyTask();
  MarkTaskCompleted();
  FlaggedTaskF();
  EditTaskView();
});

$("#task-data").keypress( function(e){
    var taskCount =$(".Q-Tasks").length;
    var taskTotal = taskCount + 1;
    var task = $("#task-data").val();
    var design ='<div class="Q-Tasks Task-Default">';
          design += '<p>';
          design +=   '<span class="Q-Task-Mark"><img src="/images/svg/Idle.svg" alt=""></span>';
          design +=     '<a class="edit-Task-popup" id="Quicktask'+ taskTotal +'">' + task + '</a>';
          design +=     '<span class="Date-Flag-More-Head">';
          design +=     '<span class="Date-Flag-More View-more-menu"><img src="/images/svg/MoreMenu.svg" alt=""></span>';
          design +=     '<span class="Date-Flag-More NotFlagged"><img src="/images/svg/NotFlagged.svg" alt=""></span>';
          design +=     '<span class="Date-Flag-More Flagged" style="display:none;"><img src="/images/svg/Flagged.svg" alt=""></span>';
          design +=     '<input  type="text" class="Date-Flag-More due-date" placeholder="Due Date" >';
          design +=   '</span>';
          design += '</p>';
          design += '<div class="moreMenu">';
          design +=   '<div class="moreMenu-main">';
          design +=     '<li>Change to project task</li>';
          design +=     '<li class="Mark-Task-Completed" >Mark as completed</li>';
          design +=     '<li class="Cancel-Q-Task" onclick="cancelTask(event)">Cancel task</li>';
          design +=     '<li>Share</li>';
          design +=     '<li class="Delete-Q-Task">Delete</li>';
          design +=   '</div>';
          design +=  '</div>';
        design += '</div>';
    if(e.keyCode == 13){
      e.preventDefault();
        $("#FilterAll").trigger('click');
        $("#Q-All-Task-List").append(design);
        $("#Quicklist-task-form")[0].reset();
        $("#task-data").blur();
        $(".Q-Empty-Msg").hide();
        $("#Q-All-Task-List").show();
        // $("#Task-list-count").text(taskCount + 1);
        TotalMyTask();
        $(".Q-Task-List-Title").show();
        EditTaskView();

        $(".Edit-Task-Save-Btn").click(function(e){
            e.preventDefault();
            $("#Edit-Task").hide();
            var newtext = $("#task-name").val();
            console.log(newtext);
            var thisid = $(this).attr('data-id');
            console.log(thisid);

            $("#"+thisid).text(newtext);
        });

        $(".Delete-Q-Task").on('click', function(e){
          $(this).closest(".Q-Tasks").remove();
          var taskCount =$(".Q-Tasks").length;
          if(taskCount > 0 ){
            $(".Q-Empty-Msg").hide();
            $("#Q-All-Task-List").show();
          }else {
            $(".Q-Empty-Msg").show();
            $("#Q-All-Task-List").hide();
          }
          TotalMyTask();
        });
        $(function () {
         $('.due-date').datetimepicker({
           format: "MMM, Do"
         });
        });

        $('#task-data').focus();

        $( "div" ).delegate( ".qtask-normal-view", "click", function() {
          $(this).closest(".Q-Tasks").removeClass('cancel-task').addClass('Task-Default');
          $(this).closest(".Q-Tasks").children('p').find('a').css({"color":"rgba(0,0,0,0.87)", "text-decoration": "none"});
          $(this).closest(".Q-Tasks").children('p').find('.Q-Task-Mark').find('img').attr('src','/images/svg/Idle.svg');
          $(this).closest(".Q-Tasks").children('p').find('.Date-Flag-More-Head').show();
          $(this).closest(".Q-Tasks").children('p').find('.qtask-normal-view').remove('.qtask-normal-view');
          EditTaskView();
        });
        MarkTaskCompleted();
        FlaggedTaskF();

        return false;
    }
  });

//

var EditTaskView = function(){
  $(".edit-Task-popup").click(function(e){
  $("#task-name").val($(this).closest('p').find('a').text());
    $("#Edit-Task").show();
    $(".Edit-Task-Save-Btn").attr('data-id', this.id);
    ItemCheck();
    removeUploadingFile();
  });

}
$(".Edit-Task-Save-Btn").click(function(e){
    e.preventDefault();
    $("#Edit-Task").hide();
    var newtext = $("#task-name").val();
    var thisid = $(this).attr('data-id');
    $("#"+thisid).text(newtext);
});



$("#Close-edit-Task-popup").click(function(e){
    $("#Edit-Task").hide();
});




$(document).mouseup(function(e){
    var container = $(".moreMenu");
    var filterQuick = $(".filter_quicklist")

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0)
    {
        container.hide();
    }
    if (!filterQuick.is(e.target) && filterQuick.has(e.target).length === 0)
    {
        filterQuick.slideUp('slow');
    }

    $(".View-more-menu").click(function(e){
      $(this).parents(".Q-Tasks").find(".moreMenu").show();
    });
});

$(".Delete-Q-Task").on('click', function(e){
var taskCount =$(".Q-Tasks").length;
  $(this).closest(".Q-Tasks").remove();
  var taskCount =$(".Q-Tasks").length;
  if(taskCount > 0 ){
    $(".Q-Empty-Msg").hide();
    $("#Q-All-Task-List").show();
  }else {
    $(".Q-Empty-Msg").show();
    $("#Q-All-Task-List").hide();
  }
  TotalMyTask();
});




$(function () {
 $('.due-date').datetimepicker({
   format: "MMM, Do"
 });
});
$(function () {
 $('.quicklist-task-date').datetimepicker({
   format: "L"
 });
});


  $(".add-new-task").keypress( function(e){
    var checkboxC = $(".task-check-label:visible").length;
    var newCheckNum = checkboxC + 2;
    var task = $(".add-new-task").val();
    var design  ='<div class="checkboxC checkboxC-primary" style="margin-left:5px;">'
        design +=   '<input id="task-item-check'+ newCheckNum +'" type="checkbox" checked>'
        design +=   '<label for="task-item-check'+ newCheckNum +'" class="task-check-label">'+ task +'</label>'
        design +='</div>'
    if(e.keyCode == 13){
      e.preventDefault();
        $(".custom-check-head").append(design);
        $('.add-new-task').val('');
        $(".add-new-task").blur();
        $(".checkboxC-primary").children("input").on('click', function(){
          var CountCheckbox = $(".checkboxC-primary").children('input').length;
          var checked_count = $(".checkboxC-primary").children('input:checkbox:checked').length;
          var Total_Value = 100 * checked_count / CountCheckbox;
          $(".custom-progress-checkbox").css("width", Total_Value + '%');
          $(".bar-status").text(Math.round(Total_Value) + '%');
        });
        var checked_count = $(".checkboxC-primary").children('input:checkbox:checked').length;
        var CountCheckbox = $(".checkboxC-primary").children('input').length;
        var Total_Value = 100 * checked_count / CountCheckbox;
        $(".custom-progress-checkbox").css("width", Total_Value + '%');
        $(".bar-status").text(Math.round(Total_Value) + '%');
        $('#task-item').focus();
        ItemCheck();
        return false;
    }
  
  });

$(document).ready(function(){
  var checked_count = $(".checkboxC-primary").children('input:checkbox:checked').length;
  var CountCheckbox = $(".checkboxC-primary").children('input').length;
  var Total_Value = 100 * checked_count / CountCheckbox;
  $(".custom-progress-checkbox").css("width", Total_Value + '%');
  $(".bar-status").text(Math.round(Total_Value) + '%');


  $(".checkboxC-primary").children("input").on('click', function(){
    var CountCheckbox = $(".checkboxC-primary").children('input').length;
    var checked_count = $(".checkboxC-primary").children('input:checkbox:checked').length;
    var Total_Value = 100 * checked_count / CountCheckbox;
    $(".custom-progress-checkbox").css("width", Total_Value + '%');
    $(".bar-status").text(Math.round(Total_Value) + '%');
  });
});


var FlaggedTaskF = function(){
  $(".NotFlagged").on('click', function(){
    $(this).hide();
    $(this).parents("p").find(".Flagged").show();
    $(this).parents('.Q-Tasks').removeClass('Task-Default').addClass('FlaggedTask');

  });

  $(".Flagged").on('click', function(){
    $(this).hide();
    $(this).parents("p").find(".NotFlagged").show();
    $(this).parents('.Q-Tasks').removeClass('FlaggedTask').addClass('Task-Default');
  });
}
$(document).keyup(function(e){
  if(e.keyCode == 27){
    if($("#Edit-Task").is(':visible')){
    $("#Close-edit-Task-popup").trigger('click');
    }
    if($('.moreMenu').is(':visible')){
      $('.moreMenu').hide();
    }
  }
});

$(".quicklist-task-date").on('dp.change', function(){
   var count = $(".quicklist-task-date").val().length;
   if(! count == 0){
     $(this).css('background-image', 'url(/images/svg/CalendarSelected.svg)')
   }else{
     $(this).css('background-image', 'url(/images/svg/CalendarNotSelected.svg)')
   }
});

$( "div" ).delegate( ".qtask-normal-view", "click", function() {
  $(this).closest(".Q-Tasks").removeClass('cancel-task').addClass('Task-Default');
  $(this).closest(".Q-Tasks").children('p').find('a').css({"color":"rgba(0,0,0,0.87)", "text-decoration": "none"});
  $(this).closest(".Q-Tasks").children('p').find('.Q-Task-Mark').find('img').attr('src','/images/svg/Idle.svg');
  $(this).closest(".Q-Tasks").children('p').find('.Date-Flag-More-Head').show();
  $(this).closest(".Q-Tasks").children('p').find('.qtask-normal-view').remove('.qtask-normal-view');
  EditTaskView();
});


var MarkTaskCompleted = function () {
    $('.Mark-Task-Completed').on('click', function(){
      $(this).closest(".Q-Tasks").removeClass('cancel-task');
      $(this).closest(".Q-Tasks").removeClass('Task-Default');
      $(this).closest(".Q-Tasks").addClass('complete-task');
      $(this).closest(".complete-task").children('p').find('.Q-Task-Mark').find('img').attr('src','/images/svg/Completed.svg');
      $('.moreMenu').hide();
    });
}

///
var cancelTask = (event) =>{
  $(event.target).closest(".Q-Tasks").addClass("cancel-task").removeClass('Task-Default');
  $(".moreMenu").hide();
  $(event.target).closest(".Q-Tasks").removeClass('complete-task');
  $(event.target).closest(".cancel-task").children('p').find('a').css({"color":"red", "text-decoration": "line-through"});
  $(event.target).closest(".cancel-task").children('p').find('.Q-Task-Mark').find('img').attr('src','/images/svg/Canceled.svg');
  $(event.target).closest(".cancel-task").children('p').find('.Date-Flag-More-Head').hide();
  $(event.target).closest(".cancel-task").children('p').append('<p style="float:right; color:red; font-weight:600;" class="qtask-normal-view">Canceled</p>');
  $(event.target).closest(".cancel-task").children('p').children('a').unbind('click');
};


var TotalMyTask = function() {
    var taskCount =  $('.Q-Tasks:visible').length
    $("#Task-list-count").text(taskCount);
}

var ItemCheck = function() {
  var totalItem = $('.task-check-label:visible').length;
  $('#check-item-count').text("("+totalItem+")");
}



var removeUploadingFile = function (){
  $('.qRemoveFile').on('click', function(){
    $(this).parents('.file-upload-duration').remove();
  });
}
 var formDataTemp = [];

// $("#Q-list-drag-file").withDropZone(".Q-list-drag-file-label", function(e){
//   e.preventDefault();
//   e.stopPropagation();
// });

// $(function () {
//     var dropZoneId = "Q-list-drag-file-label";
//     var buttonId = "Q-list-drag-file";
//     var mouseOverClass = "mouse-over";

//     var dropZone = $("." + dropZoneId);
//     var ooleft = dropZone.offset().left;
//     var ooright = dropZone.outerWidth() + ooleft;
//     var ootop = dropZone.offset().top;
//     var oobottom = dropZone.outerHeight() + ootop;
//     var inputFile = $('#Q-list-drag-file');
//     document.getElementById(dropZoneId).addEventListener("dragover", function (e) {
//         e.preventDefault();
//         e.stopPropagation();
//         dropZone.addClass(mouseOverClass);
//         var x = e.pageX;
//         var y = e.pageY;

//         if (!(x < ooleft || x > ooright || y < ootop || y > oobottom)) {
//             inputFile.offset({ top: y - 15, left: x - 100 });
//         } else {
//             inputFile.offset({ top: -400, left: -400 });
//         }

//     }, true);

//     if (buttonId != "") {
//         var clickZone = $("#" + buttonId);

//         var oleft = clickZone.offset().left;
//         var oright = clickZone.outerWidth() + oleft;
//         var otop = clickZone.offset().top;
//         var obottom = clickZone.outerHeight() + otop;

//         $("#" + buttonId).mousemove(function (e) {
//             var x = e.pageX;
//             var y = e.pageY;
//             if (!(x < oleft || x > oright || y < otop || y > obottom)) {
//                 inputFile.offset({ top: y - 15, left: x - 160 });
//             } else {
//                 inputFile.offset({ top: -400, left: -400 });
//             }
//         });
//     }

//     document.getElementById(dropZoneId).addEventListener("drop", function (e) {
        
//         $("." + dropZoneId).removeClass(mouseOverClass);
//         e.preventDefault();
//         e.stopPropagation();
//     }, true);

// })

 // $('#clickZoneDiV').on('drop', function(e){
 //  // e.preventDefault();
 //    $('#Q-list-drag-file').trigger('drop');
 // });

function submit_task_file_data(files){
  var formData = new FormData($('#EditTaskFormData')[0]);
   // var fileName =  $('#Q-list-drag-file').val().split('\\').pop();
   // console.log(fileName);
   $.ajax({
      xhr: function() {
        // $('.progress').show();
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                var percom = Math.ceil(percentComplete*100);
                $(".file-upload-progress-bar").css("width", percom+"%");
                // console.log(percom);
                if(percom == 100){
                  $(".upload_status").html("Successfully Uploaded");
                }else{
                  $(".upload_status").html("Uploading...");
                }
            }

        }, false);
          return xhr;
      },
      url: '/quicklists/edit_task_file_upload',
      type: "POST",
      data: formData,
      dataType: 'json',
      contentType: false,
      processData: false,
      success: function(res){
        // if(res.file_info.length){
        // }else{
        //   alert(res.msg);
        // }
      }

    });

for (var i = 0; i < files.length; i++) {
    
    var has_already = false;
    formDataTemp.forEach(function(vv){
      if(vv.name == files[i].name){
        has_already = true;
      }
    });
    if(has_already === true) continue;
    formDataTemp.push(files[i]);
    
    var file_ext = files[i].name.split('.').pop().toLowerCase();
    switch(file_ext){
      case 'ai': case 'mp3': 
      case 'doc': case 'docx': 
      case 'indd': case 'js': 
      case 'sql': case 'pdf': 
      case 'ppt': case 'pptx': 
      case 'psd': case 'svg': 
      case 'xls': case 'xlsx': 
      case 'zip': case 'rar':
        file_ext = file_ext;
        break;
      default:
        file_ext = 'other';
    }
    var inputTagCount = $('.q_file_Tag').children('.q_file_tag_input').length +1 ;
    var attachQFileList = document.getElementById("AllUploadFileList"); 

    var main_div = document.createElement("div");
    main_div.setAttribute('class', 'file-upload-duration');
    attachQFileList.appendChild(main_div);

    var qCloseFileImg = document.createElement("img");
    qCloseFileImg.setAttribute('class', 'qRemoveFile');
    qCloseFileImg.src = "/images/file-close.png";
    main_div.appendChild(qCloseFileImg);

    var qFileName = document.createElement("h5");
    qFileName.innerHTML = files[i].name;
    main_div.appendChild(qFileName);

    var qFileProg = document.createElement("p");
    qFileProg.setAttribute('class', 'upload_status');
    qFileProg.style.textalign = 'left';
    main_div.appendChild(qFileProg);

    var qFileUploadSt = document.createElement("p");
    qFileUploadSt.setAttribute('class', 'file-upload-progress-bar');
    main_div.appendChild(qFileUploadSt);

    var qFileTagMain = document.createElement("div");
    qFileTagMain.setAttribute('class', 'q_file_Tag' );
    main_div.appendChild(qFileTagMain);


    var qFileTagInput = document.createElement('input');
     qFileTagInput.setAttribute('class', 'q_file_tag_input');
     qFileTagInput.setAttribute("id", "inputTag"+inputTagCount);
     qFileTagInput.setAttribute("type", "text");
     qFileTagInput.placeholder = "Custom Tag";
     qFileTagMain.appendChild(qFileTagInput);


  }
  removeUploadingFile();


}

  $('div').on('keyup', '.q_file_tag_input', function(e){
    e.preventDefault();
    e.stopPropagation();
    var  backcolors = ['#F5A623;', '#90A4AE;', '#4A90E2;'];
    var backRand = backcolors[Math.floor(Math.random() * backcolors.length)];
    if(backRand == '#F5A623;'){
      var background = 'rgba(245,166,35,0.1);';
    }
    if(backRand == '#4A90E2;'){
      var background = 'rgba(74,144,226,0.1);'
    }
    var id = e.target.id;
    var thisValue = $('#'+id).val();
    var newDiv   = '<div class="q_list_tag" style="background:'+background+'">';
        newDiv  +=    '<p style="color:'+backRand+'">'+thisValue+'</p>';
        newDiv  +=    '<div onclick="removeTag(this)" class="HoverCloseTag" style="display:none">';
        newDiv  +=      '<div class="closeTag" style="border:0.8px solid '+backRand+'"></div><span class="closeXTag"style="color:'+backRand+'">x</span>';        
        newDiv  +=    '</div>';
        newDiv  += '</div>';
    if(e.keyCode == 13){
      $('#'+id).parents('.q_file_Tag').append(newDiv);
      $('#'+id).val('');
    }

  });

function removeTag(e){
  $(e).parent().remove();
}
  $('div').on('mouseover mouseenter', '.q_list_tag', function(e){
    $(this).children('.HoverCloseTag').show();
  });

$('div').on('keyup', '.search_for_all', function(){
  var inValue = $('.search_for_all').val();
  $(".edit-Task-popup").each(function() {
    if($('.Q-Tasks').children('p').children(this).text().toLowerCase().search(inValue.toLowerCase()) > -1){
    $(this).parents('.Q-Tasks').show();

  }else{
    $(this).parents('.Q-Tasks').hide();
  }
  });
});

$('div').on('keyup','.search_for_complete', function(){
  var inValue = $('.search_for_complete').val();
  $(".edit-Task-popup").each(function() {
    if($('.complete-task').children('p').children(this).text().toLowerCase().search(inValue.toLowerCase()) > -1){
    $(this).parents('.complete-task').show();

  }else{
    $(this).parents('.complete-task').hide();
  }
  });
});
 
$('div').on('keyup', '.search_for_cancelled', function(){
    var inValue = $('.search_for_cancelled').val();
    $(".edit-Task-popup").each(function() {
      if($('.cancel-task').children('p').children(this).text().toLowerCase().search(inValue.toLowerCase()) > -1){
      $(this).parents('.cancel-task').show();

    }else{
      $(this).parents('.cancel-task').hide();
    }
    });
});

$('div').on('keyup', '.search_for_flagged', function(){
    var inValue = $('.search_for_flagged').val();
    $(".edit-Task-popup").each(function() {
      if($('.FlaggedTask').children('p').children(this).text().toLowerCase().search(inValue.toLowerCase()) > -1){
      $(this).parents('.FlaggedTask').show();

    }else{
      $(this).parents('.FlaggedTask').hide();
    }
    });
});

var TotalFilterFunction = function (){
    var TotalActiveCount = $('.filtering_item_quick.filter_active').length
    $('.filtering_item_quick').on('click', function(){
      $('.filtering_item_quick.filter_active p').css('transition', 'all 0.3s linear');
      $('#quickFilter').children('.filter_active').removeClass("filter_active");
      $(this).addClass('filter_active');
      $('.quicklist_search').val('');
      if(!$('#FilterAll.filter_active').length == 0){
        $('.Q-Tasks').show();
        $('#search-Quick-Task').removeClass().addClass('quicklist_search search_for_all');
        // lengthAllSearch();
      }else{
        $('.Q-Tasks').hide();
      }
      if(!$('#FilterCompleted.filter_active').length == 0){
        $('.Q-Tasks.complete-task').show();
        $('#search-Quick-Task').removeClass().addClass('quicklist_search search_for_complete');
        // lengthCompletedSearch();
      }
      if(!$('#FilterCancelled.filter_active').length == 0){
        $('.Q-Tasks.cancel-task').show();
        $('#search-Quick-Task').removeClass().addClass('quicklist_search search_for_cancelled');
        // lengthCancelledSearch();
      }
      if(!$('#FilterFlagged.filter_active').length == 0){
        $('.Q-Tasks.FlaggedTask').show();
        $('#search-Quick-Task').removeClass().addClass('quicklist_search search_for_flagged');
        // lengthFlaggedSearch();
      }
    });
}

TotalFilterFunction();




//  $(".Q-list-drag-file-label").on('dragenter', function (e){
//   e.preventDefault();
//  });

//  $(".Q-list-drag-file-label").on('dragover', function (e){
//   e.preventDefault();
//  });

// //  function createFormData(files){

// // }






 // $(".Q-list-drag-file-label").on('drop', function (e){
 //  e.preventDefault();
 //  e.stopPropagation();
 //  // var file = e.originalEvent.dataTransfer.files;
 //  // createFormData(files);
 // }); 

 // $("#Q-list-drag-file").on('drop', function (e){
 //  e.preventDefault();
 //  e.stopPropagation();
 //  // var file = e.originalEvent.dataTransfer.files;
 //  // createFormData(files);
 // });