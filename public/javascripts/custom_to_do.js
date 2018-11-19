var sharedMemberList = [];
var onlineUserList = [];
var currentMemberList = [];
var checklistiTEM = [];
var updateCheckList = [];
var allActivityList = [];
var viewMemberImg = [];
var checkedList = {};
var userlistWithname = {};

//For tags
var attachFileList = [];
var tagListForFileAttach = [];
var tagListTitle = [];
var tagLsitDetail = [];
var alltags = [];
var msgIdsFtag = [];
var FtempArray = [];    // for file upload tag
var FtaggedList = [];   // for file upload tag
var my_tag_list = {};
var my_tag_id = [];
var chatmessagestag = [];
var myconversation_list = [];
var searchTagList = [];
var currentConv_list = [];
var currentSerchActivityList = [];
var setFlagConvArray = [];
var cookieFiles = [];

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
function setCookie(notification_status, notification_value) {
    document.cookie = notification_status + "=" + notification_value;
}

function getCookie(notification_status) {
    var notification_status = notification_status + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(notification_status) == 0) {
            return c.substring(notification_status.length, c.length);
        }
    }
    return "";
}
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//For tags
var numrelated = $('.side_bar_list_item > li:visible').length;
if (numrelated == 0) {
    createNewTodo();
} else {
    if ($('#completedSidecontainer').is(':visible') == false) {
        if (check_con_page_action()) {
            createNewTodo();

        } else {
            if (getCookie('lastActive') != "") {

                $('.side_bar_list_item li').removeClass('activeTodo selected');
                if ($("#activity_" + getCookie('lastActive')).is(':visible')) {
                    $("#activity_" + getCookie('lastActive')).trigger('click');
                    $("#activity_" + getCookie('lastActive')).addClass('activeTodo selected');
                } else {
                    $('.side_bar_list_item li:first').click();
                    $('.side_bar_list_item li:first').addClass('activeTodo selected');
                }
            } else {
                // createNewTodo();
                $('.side_bar_list_item li:first').click();
                $('.side_bar_list_item li:first').addClass('activeTodo selected');
            }
        }

    }

}

function check_con_page_action() {
    if (getCookie('create_to_f_con') != "") {
        // setCookie("create_to_f_con", '', 1);
        return true;
    } else {
        return false;
    }
}

var sideBarActive = () => {
    $('.side_bar_list_item li').on('click', function () {
        $('.side_bar_list_item li').removeClass('activeTodo');
        $(this).addClass('activeTodo');
    });
}


function startToDo(event) {
    // this us for save draft activity by promise
    if ($("#n_ToDo_item").is(':visible')) {
        let str = $("#todoTitle").val();
        if (str != "" && str != " "){
            saveDraftActiVity()
                .then((result) => console.log(result))
                .catch ((error) => console.error(error));
        }
    }

    viewMemberImg = [];
    sharedMemberList = [];
    var name = $(event.target).text();
    var newTodo = "New Task";
    var type = 'TODO';
    currentMemberList = [];
    checklistiTEM = [];
    updateCheckList = [];
    $('.sharedIMG').remove();
    $('.ownerThisToDo').remove();
    $('#sharePeopleList span').hide();
    $(".new-added-check-list").html('');
    $(".checklist_item").val('');
    $("#amazonWishlist").prop('checked', false);
    $(".count_member").text(" 1 member");
    $('.suggested-list').html("");
    $("#chat_icon").css('pointer-events', 'auto');
    $("#tagged_area").css('pointer-events', 'auto');
    $(".flag").css('pointer-events', 'auto');
    $("#toDoPinUnpinDiv").css('pointer-events', 'auto');
    $(".more").css('pointer-events', 'auto');

    tagListTitle = [];
    tagLsitDetail = [];

    $("#fileAttachTagLs").html('');
    $("#n_ToDo_item").remove();
    tagListForFileAttach = [];
    FtempArray = [];
    FtaggedList = [];
    $("#taggedList").html("");
    $(".checklistDiv").html("");
    $("#tagItemList").html("");

    $("#viewUploadFileviewUploadFile").html('');
    $("#viewUploadFileviewUploadFile").hide();

    $(".tagged").attr('src', '/images/basicAssets/custom_not_tag.svg');


    $("#selectWorkspace option").each(function () {
        $(this).removeAttr("selected");
    });
    $("#ReminderTime option").each(function () {
        $(this).removeAttr("selected");
    });
    var activity_id = conversationid = $(event.target).attr('data-activityid');
    $("#deletetodoTopBar").attr('data-activityid', activity_id);
    $('#chat_icon').attr('data-activity_id', activity_id);
    var nour = $("#activity_" + activity_id).attr("data-urm");
    if (nour > 0) {
        $('#chat_icon>img').attr('src', '/images/basicAssets/Chat_active.svg');
        $('#chat_icon>img').css({ 'width': '14px', 'height': '14px' });
    } else {
        $('#chat_icon>img').attr('src', '/images/basicAssets/Chat.svg');
        $('#chat_icon>img').css({ 'width': '14px', 'height': '14px' });
    }
    $('#updateAction').val(activity_id);
    if ($('#live-chat').is(':visible')) {
        $('#chat_icon').trigger('click');
    }

    socket.emit('get_activity_history', {
        activity_id,
        user_id
    }, (respons) => {
        $('.workspaceform').show();
        if (respons.activityDetail.status) {
            if(respons.activityDetail.activityDetail.activity_created_by === user_id){
                if(respons.activityDetail.activityDetail.activity_is_active == 1)
                    designForUsers('admin');
                else
                    designForUsers('member');
            }else{
                designForUsers('member');
            }
            //pin activity id set
            $("#pin_unpin").attr("data-acid", activity_id);
            $("#createConvTag").attr('data-acid', activity_id);
            if ($('#completedSidecontainer').is(':visible') == false) {
                setCookie('lastActive', activity_id, 1);
            }
            $("#todoTitle").val(respons.activityDetail.activityDetail.activity_title);
            

            if (respons.activityDetail.activityDetail.activity_title.length > 64) {
                $("#todoTitle").css('overflow', 'hidden');
                $("#todoTitle").css('float', 'left');
                // $("#todoTitle").css('width', '500px');
                $("#todoTitle").css('height', '64px');
                $("#todoTitle").css('display', 'inline-block');
                $('.to_do_head_left label').css('top', '20px');
                $('.to_do_head_left').css('margin', '6px 0px');
            } else {
                $("#todoTitle").removeAttr('style');
                $('.to_do_head_left label').css('top', '5px');
                $('.to_do_head_left').css('margin', '22px 0px');
            }
            
            $('.checkbox_container').show();
            $("#todoTitle").show();

            $("#notes_area").val(respons.activityDetail.activityDetail.activity_description)
            $('#activityCreatedAt').val(respons.activityDetail.activityDetail.activity_created_at);
            $("#selectWorkspace").find('option[value="' + respons.activityDetail.activityDetail.activity_workspace + '"]').attr("selected", true);
            $('#actCre').val(respons.activityDetail.activityDetail.activity_created_by);
            $("#dueDatePicker").val(moment(respons.activityDetail.activityDetail.activity_end_time).format('DD-MM-YYYY'));
            $('#timeFrom').val(respons.activityDetail.activityDetail.activity_from);
            $('#timeTo').val(respons.activityDetail.activityDetail.activity_to);

            $("#ReminderTime").find('option[value="' + respons.activityDetail.activityDetail.activity_has_reminder + '"]').attr("selected", true);

            var design = '<p>' + respons.activityDetail.activityDetail.activity_title + '</p>';
            $(".checklistDiv").append(design);

            // check flagged or not
            if (respons.activityDetail.activityDetail.activity_has_flagged != null) {
                if (respons.activityDetail.activityDetail.activity_has_flagged.indexOf(user_id) === -1) {
                    $('#flag_unflag').removeClass('Flagged').addClass('unflag').attr('src', '/images/basicAssets/Not_Flagged.svg');
                    $('.side_bar_list_item li.activeTodo').removeClass('Flagged');
                } else {
                    $('#flag_unflag').removeClass('unflag').addClass('Flagged').attr('src', '/images/basicAssets/Flagged_red.svg');
                    $('.side_bar_list_item li.activeTodo').addClass('Flagged');
                }
            } else {
                $('#flag_unflag').removeClass('Flagged').addClass('unflag').attr('src', '/images/basicAssets/Not_Flagged.svg');
                $('.side_bar_list_item li.activeTodo').removeClass('Flagged');
            }
            var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);

            if (respons.activityDetail.activityDetail.activity_is_active == 0) {
                $("#amazonWishlist").prop('checked', true);
            }

            if (respons.activityDetail.activityDetail.activity_participants.length > 0) {
                $('#sharePeopleList').show();
                $('#sharePeopleList span').hide();
                $.each(user_list, function (ky, va) {
                    if ($('#actCre').val() == va.id) {
                        sharedMemberList.push(va.id);
                        $('#sharePeopleList .sharing_label').after('<img onclick="viewShareList(event)" src="/images/users/' + va.img + '" data-uuid="' + va.id + '" class="ownerThisToDo">');
                    }
                });

                userlistWithname = {};
                $.each(user_list, function (ky, va) {
                    userlistWithname[va.id] = va.fullname
                    if ($('#actCre').val() !== va.id) {
                        if (respons.activityDetail.activityDetail.activity_participants.indexOf(va.id) !== -1) {
                            currentMemberList.push(va.id);
                            if (sharedMemberList.indexOf(va.id) == -1) {
                                sharedMemberList.push(va.id);
                                $(".count_member").text('' + sharedMemberList.length + ' members');
                            }
                            if (currentMemberList.length < 4) {
                                $('#sharePeopleList .ownerThisToDo').after('<img onclick="viewShareList(event)" src="/images/users/' + va.img + '" data-uuid="' + va.id + '" class="sharedIMG memberImg' + va.id + '">');
                                viewMemberImg.push(va.id);
                            }

                            if (currentMemberList.length > 3) {
                                $('#sharePeopleList span').show();
                                $('#sharePeopleList span').text('+' + (currentMemberList.length - 3));
                            }
                        }
                    }
                });
                suggestedUserList();
            } else {
                $('#sharePeopleList').show();
            }

            // if ($("#updateAction").val() !== 0 && $("#actCre").val() === user_id) {
            //     $("#addTodoCheckList").attr('disabled', false);
            // } else {
            //     $("#addTodoCheckList").attr('disabled', true);
            // }

            //tags control

            attachFileList = [];
            chatmessagestag = respons.messagestag;
            if (respons.messagestag.length > 0) {
                $.each(respons.messagestag, function (k, v) {
                    msgIdsFtag.push(v.id);
                });
            }

            if (respons.tags != undefined) {
                var taggedID = respons.tags;//all con tag tag_id
                var condtagsid = FtaggedList = respons.condtagsid;//all con tag id

                var tempTagList = [];

                var totalTagslist = FtempArray = _.orderBy(respons.totalTags, ['title'], ['asc']);

                $.each(totalTagslist, function (k, v) {

                    if (alltags.indexOf(v.title.toLowerCase()) === -1) {
                        my_tag_list[v.tag_id] = v.title.toLowerCase();
                        alltags.push(v.title.toLowerCase());
                        my_tag_id.push(v.tag_id.toString());
                    }

                    if (condtagsid.indexOf(v.tag_id) !== -1) {
                        tagListForFileAttach.push(v.title.toLowerCase());
                        tagListTitle.push(v.title.toLowerCase());
                        tagLsitDetail.push({ 'cnvtagid': taggedID[condtagsid.indexOf(v.tag_id)], 'tagid': v.tag_id, 'tagTitle': v.title.toLowerCase(), 'roomid': conversationid });

                        var design = '<li onclick="removeLevel(\'' + taggedID[condtagsid.indexOf(v.tag_id)] + '\',\'' + conversationid + '\',\'' + v.tag_id + '\')">' + v.title + '<span class="tagcheck" id="level' + taggedID[condtagsid.indexOf(v.tag_id)] + '"></span></li>';

                        if (tempTagList.indexOf(v.tag_id) === -1) { tempTagList.push(v.tag_id); }
                        $('#taggedList').append(design);
                    }
                });

                $.each(totalTagslist, function (k, v) {
                    if (tempTagList.indexOf(v.tag_id) === -1) {
                        var design = '<li id="tagLi' + v.tag_id + '" onclick="addTagto(\'' + v.tag_id + '\',\'' + conversationid + '\')">' + v.title + '</li>';
                        $('#taggedList').append(design);
                    }
                });

                if (tagListTitle.length > 0) {
                    $("#tagItemList").text(tagListTitle.join(','));
                    $(".tagged").attr('src', '/images/basicAssets/custom_tagged.svg');
                }
            }



            var checlistOrder = _.orderBy(respons.response.activities, ["checklist_title"], ["asc"])
            
            if (checlistOrder.length > 0) {
                console.log(checlistOrder.length);
                $.each(checlistOrder, function (key, val) {

                    if (checklistiTEM.indexOf(val.checklist_title) === -1) {
                        checklistiTEM.push(val.checklist_title);
                    }
                    var checkListHtml = '<li class="todoChelistLI" id="tdCLI' + val.checklist_id +'"   data-createdby="' + userlistWithname[val.checklist_by.toString()] + '" data-balloon="Ceated by ' + userlistWithname[val.checklist_by.toString()] + '" data-balloon-pos="right">';
                    if ($("#updateAction").val() !== 0 && val.checklist_by.toString() === user_id) {
                        checkListHtml += '  <span class="remove" data-chtitle="' + val.checklist_title + '" data-chid="' + val.checklist_id + '" onclick="removeThisCheckList(event)"></span>';
                        checkListHtml += '  <span class="edit" data-chtitle="' + val.checklist_title + '" data-chid="' + val.checklist_id + '" onclick="editThisCheckList(event)"></span>';
                    }

                    checkListHtml += '  <label class="country-label"> ';
                    checkListHtml += '  <span class="checkName" onblur="editCheckListOnBlur(event,\'' + val.checklist_id + '\')" onkeydown="editToDoCheckName(event,\'' + val.checklist_id + '\')">' + val.checklist_title + '</span>';
                    // if (val.checklist_status == 0) {
                    //     checkListHtml += '      <input class="todoCheckBoxInput" ' + (val.checklist_by.toString() == user_id ? "" : 'disabled') + ' type ="checkbox" value="' + val.checklist_id + '" id="' + val.checklist_id + '">';
                    // } else {
                    //     checkListHtml += '      <input class="todoCheckBoxInput" ' + (val.checklist_by.toString() == user_id ? "" : 'disabled') + ' type ="checkbox" value="' + val.checklist_id + '" checked id="' + val.checklist_id + '">';
                    // }

                    if (val.checklist_status == 0) {
                        checkListHtml += '      <input class="todoCheckBoxInput" type ="checkbox" value="' + val.checklist_id + '" id="' + val.checklist_id + '">';
                    } else {
                        checkListHtml += '      <input class="todoCheckBoxInput" type ="checkbox" value="' + val.checklist_id + '" checked id="' + val.checklist_id + '">';
                    }

                    checkListHtml += '      <span class="checkmark"></span>';
                    checkListHtml += '  </label>';
                    checkListHtml += '</li>';

                    $(".new-added-check-list").append(checkListHtml);

                    countBoxes();
                    isChecked();
                });

                if ($("#sideBarSearch").val() != "") {
                    var str = $('#sideBarSearch').val();
                    str = str.replace(/<\/?[^>]+(>|$)/g, "");

                    $('.country-label .checkName').unhighlight();
                    $('.country-label .checkName').highlight(str);
                }

                $(".todoCheckBoxInput").click(function (e) {

                    e.stopImmediatePropagation();
                    
                    var acid = $(e.target).val();
                    var clusteringkey = $('#chat_icon').attr('data-activity_id');

                    if ($(e.target).is(':checked')) {
                        socket.emit('toodoUpdate', {
                            targetID: acid,
                            type: 'checklistchecked',
                            contain: 1,
                            clusteringkey: clusteringkey,
                            usrid: user_id
                        },
                            function (confirmation) {
                                // console.log(confirmation.msg);
                            });

                    } else {
                        socket.emit('toodoUpdate', {
                            targetID: acid,
                            type: 'checklistunchecked',
                            contain: 0,
                            clusteringkey: clusteringkey,
                            usrid: user_id
                        },
                            function (confirmation) {
                                // console.log(confirmation.msg);
                            });
                    }
                    countBoxes()
                    isChecked();
                });



            } else {
                countBoxes();
                isChecked();
            }

            if ($(event.target).parents('#unpinTodoList').length > 0) {
                $('#pin_unpin').removeClass('pined').addClass('unpin').attr('src', '/images/basicAssets/custom_not_pin.svg');
            } else if ($(event.target).parents('#pinnedToDoList').length > 0) {
                $('#pin_unpin').removeClass('unpin').addClass('pined').attr('src', '/images/basicAssets/custom_pinned.svg');
            }

            sideBarActive();
            find_new_reply(activity_id);
            tooltipforToDo();

            // if ($('#n_ToDo_item').is(':visible')) {
            //     $('#closeNewToDO').show();
            // } else {
            //     $('#closeNewToDO').hide();
            // }

            if ($(event.target).hasClass("Flagged") == true) {
                $('#flag_unflag').removeClass('unflag').addClass('Flagged').attr('src', '/images/basicAssets/Flagged_red.svg');
            } else if ($(event.target).hasClass("Flagged") == false) {
                $('#flag_unflag').removeClass('Flagged').addClass('unflag').attr('src', '/images/basicAssets/Not_Flagged.svg');
            }

            if ($('#amazonWishlist').is(':checked')) {
                $('.to_do_head_right').css('pointer-events', 'none');
                $('#todoTitle').css('pointer-events', 'none');
                $('.workspaceform .form_right').css('pointer-events', 'none');
                $('.form_left .group_div').css('pointer-events', 'none');
                $('.form_left .inputGroup2').css('pointer-events', 'none');
                $('.form_left .notes_area').css('pointer-events', 'none');
                $('.form_left .fileContainer').css('pointer-events', 'none');
                $('#viewUploadFile').css('pointer-events', 'none');
                $('.form_left .inputGroup2').css('display', 'none');

            } else {
                $('.to_do_head_right').css('pointer-events', 'auto');
                $('#todoTitle').css('pointer-events', 'auto');
                $('.workspaceform .form_right').css('pointer-events', 'auto');
                $('.form_left .group_div').css('pointer-events', 'auto');
                $('.form_left .inputGroup2').css('pointer-events', 'auto');
                $('.form_left .notes_area').css('pointer-events', 'auto');
                $('.form_left .fileContainer').css('pointer-events', 'auto');
                $('#viewUploadFile').css('pointer-events', 'auto');
            };

            if (respons.activityDetail.activityDetail.activity_created_by.toString() === user_id) {
                // $("#amazonWishlist").attr('disabled', false);
                $('.checkbox_container').css('pointer-events', 'auto');
                $('#deletetodoTopBar').show();

                if ($('#amazonWishlist').is(':checked')) {
                    $("#todoTitle").css('pointer-events', 'none');
                    $("#selectWorkspace").css('pointer-events', 'none');
                    $("#dueDatePicker").css('pointer-events', 'none');
                    $("#notes_area").css('pointer-events', 'none');
                    $('.inputGroup2').hide();
                } else {
                    $("#todoTitle").css('pointer-events', 'auto');
                    $("#selectWorkspace").css('pointer-events', 'auto');
                    $("#dueDatePicker").css('pointer-events', 'auto');
                    $("#notes_area").css('pointer-events', 'auto');
                    $('.inputGroup2').show();
                }

            } else {
                $('#deletetodoTopBar').hide();
                $('.checkbox_container').css('pointer-events', 'none');
                // $("#amazonWishlist").attr('disabled', true);
                $("#todoTitle").css('pointer-events', 'none');
                $("#selectWorkspace").css('pointer-events', 'none');
                $("#dueDatePicker").css('pointer-events', 'none');
                $("#notes_area").css('pointer-events', 'none');
                $('.inputGroup2').show();
            }

            if (respons.activityDetail.activityDetail.activity_is_active === 2) {
                $(".button-section").show();

                // $("#cancel-btn").removeAttr('onclick');
                $("#cancel-btn").attr('onclick', 'deleteDraftActivity("' +activity_id+'")');
                // $("#cancel-btn").attr('onclick', 'hideThisTodo(event)');

                $("#create-btn").removeAttr('onclick');
                $("#create-btn").attr('onclick', 'updateDraftActivity()');

                $('#chat_icon').css('pointer-events', 'none');
                $('#toDoPinUnpinDiv').css('pointer-events', 'none');
                $('#tagged_area').css('pointer-events', 'none');
                $('.flag').css('pointer-events', 'none');
                $('.more').css('pointer-events', 'none');
                $("#amazonWishlist").attr('disabled', true);
                $(".checkbox_container").css('cursor', 'default');


            } else {
                $(".button-section").hide();

                $("#cancel-btn").removeAttr('onclick');
                $("#cancel-btn").attr('onclick', 'closeRightSection()');

                $("#create-btn").removeAttr('onclick');
                $("#create-btn").attr('onclick', 'createNewActivity()');

                $('#chat_icon').css('pointer-events', 'auto');
                $('#toDoPinUnpinDiv').css('pointer-events', 'auto');
                $('#tagged_area').css('pointer-events', 'auto');
                $('.flag').css('pointer-events', 'auto');
                $('.more').css('pointer-events', 'auto');
                $("#amazonWishlist").attr('disabled', false);
                $(".checkbox_container").css('cursor', 'pointer');
            }

            if (respons.activityDetail.activityDetail.activity_created_by.toString() === user_id){
                $(".checkbox_container").show();
            }else{
                $(".checkbox_container").hide();
            }

            // if (respons.files.length > 0) {
            //     $("#viewUploadFileviewUploadFile").show();
            //     $.each(respons.files, function (k, v) {
            //         if (v.attch_videofile !== null) {
            //             $.each(v.attch_videofile, function (kvdo, vvdo) {
            //                 fileListDraw(v.msg_id, 'video', vvdo, v.created_at)
            //             });
            //         }
            //         if (v.attch_imgfile !== null) {
            //             $.each(v.attch_imgfile, function (kimg, vimg) {
            //                 fileListDraw(v.msg_id, 'image', vimg, v.created_at)
            //             });
            //         }
            //         if (v.attch_audiofile !== null) {
            //             $.each(v.attch_audiofile, function (kado, avdo) {
            //                 fileListDraw(v.msg_id, 'audio', avdo, v.created_at)
            //             });
            //         }
            //         if (v.attch_otherfile !== null) {
            //             $.each(v.attch_otherfile, function (koth, voth) {
            //                 fileListDraw(v.msg_id, 'other', voth, v.created_at)
            //             });
            //         }
            //     });
            // }
        }
    });
    $('.side_bar_list_item li').removeClass('selected');
    $(event.target).addClass('selected');
}

function deleteDraftActivity(params) {
    var toDoCreateAt = $('#activityCreatedAt').val();
    socket.emit('toodoUpdate', {
        targetID: params,
        type: 'delete_to_do',
        contain: 0,
        clusteringkey: toDoCreateAt
    },
    function (confirmation) {

        closeAllPopUp();
        
        var numrelated = $('.side_bar_list_item > li:visible').length;

        if (numrelated == 0) {
            createNewTodo();
        } else {
            if ($('#activity_' + params).hasClass('activeTodo')) {
                $('#activity_' + params).remove();
                $('#unpinTodoList li:first').click();
            } else {
                $('#activity_' + params).remove();
            }
        }

    });
}

// function fileListDraw(progressId, type, img, updateTime) {

//     var html = '<div class="chat-uploading-files fileno_' + progressId + '">';
//     html += '<span class="close-chat-uploading-file"><img src="/images/svg/CloseModal.svg"></span>';
//     html += '<div class="chat-file-icons">';
//     html += '<img src="https://27.147.195.222:2274/upload/' + img + '" data-filetype="' + type + '" data-name="' + img + '">';
//     html += '</div>';
//     html += '<div class="chat-file-information">';
//     html += '<h4>' + img + '</h4>';
//     html += '<p>' + moment(updateTime).format('MMM DD, YYYY @ h:mm a') + '</p>';
//     html += '<div class="chat_file_progress">';
//     html += '<div class="progress-bar progress-bar-success progress-bar-striped">&nbsp;</div>';
//     html += '</div>';
//     html += '</div>';

//     $("#viewUploadFileviewUploadFile").append(html);

// }




function createNewTodo() {

    $("#dueDatePickerDiv").datepicker().datepicker("setDate", new Date());
    checklistiTEM = [];
    viewMemberImg = [];


    var liDesign = '<li class="todoLink activeTodo newTodo selected" id="n_ToDo_item"><span class="toDo"></span><span class="toDoName">New Task</span></li>';
    var headDesign = '<label class="checkbox_container"><input id="amazonWishlist" type="checkbox"><span class="checkmark"></span></label >';
    headDesign += '<textarea class="edit-todo-name" type="textarea" maxlength="128" value="" id="todoTitle" placeholder="New Task" autofocus></textarea>';

    if (!$('.side_bar_list_item li.newTodo').is(':visible')) {
        $('.workspaceform').show();
        $('.side_bar_list_item li').removeClass('activeTodo');
        $('.inputGroup2').css({ 'pointer-events': 'auto', 'display': 'block' })
        $('#toDoCheckListContainer').css('display', 'block');
        $('.item_progress').css('display', 'block');
        $('.new-added-check-list').html('');
        $('.item_progress .progress').css('width', '0%');
        $(".progress_status").text("0%");
        $('.item_list').css({
            'height': '285px',
            'max-height': '374px'
        });
        $('.edit-todo-name').css('height', '32px');
        $('.to_do_head_left').css('margin', '22px 0px');
        $('.to_do_head_left>label').css('top', '5px');
        // $('#sharePeopleList').css('display', 'none');
        $('.button-section').css('display', 'block');
        $('#sharePeopleList span').hide();
        $('#toDoName').html('');
        $('.sharedIMG').remove();
        $('.ownerThisToDo').remove();
        // $('#sharePeopleList span').hide();
        $("#notes_area").val('');
        $(".side_bar_list_item li").removeClass('selected');
        $('#toDoName').append(headDesign);
        $('#unpinTodoList').prepend(liDesign);
        $('#actCre').val('0');
        $('#addTodoCheckList').removeAttr('disabled');
        $('#addTodoCheckList').val('');
        $("#updateAction").val('0');
        $(".suggested-list").html('');
        $("#viewUploadFileviewUploadFile").html('');
        $("#viewUploadFileviewUploadFile").hide();
        sharedMemberList = [];
        viewMemberImg = [];
        currentMemberList = [];
        $('#actCre').val(user_id);
        suggestedUserList();
        $('.to_do_container').show();
        $('#chat_icon').attr('data-activity_id', '');

        $("#amazonWishlist").attr('disabled', false);
        $("#todoTitle").css('pointer-events', 'auto');
        $("#selectWorkspace").css('pointer-events', 'auto');
        $("#dueDatePicker").css('pointer-events', 'auto');
        $("#notes_area").css('pointer-events', 'auto');
        $("#chat_icon").css('pointer-events', 'none');
        $("#tagged_area").css('pointer-events', 'none');
        $(".flag").css('pointer-events', 'none');
        $("#toDoPinUnpinDiv").css('pointer-events', 'none');
        $(".more").css('pointer-events', 'none');
        $("#notes_area").attr('placeholder', 'Write a short description...');
        $('.inputGroup2').show();
        $('#sharePeopleList .sharing_label').after('<img onclick="viewShareList(event)" src="/images/users/' + user_img + '" data-uuid="' + user_id + '" class="ownerThisToDo">');
        currentMemberList.push(user_id);
        sharedMemberList.push(user_id);
        viewMemberImg.push(user_id);
        $('#sharePeopleList').show();
        $('#chat_icon').attr('data-activity_id', '');
        $("#cancel-btn").attr('onclick', 'closeRightSection()');
        designForUsers('admin');

        if (check_con_page_action()) {
            $("#todoTitle").val(getCookie('create_to_f_con'));
            var con_participants = getCookie('create_to_f_participant').split(',');
            $('.inputGroup2 .showEl').each(function (i, obj) {
                if (con_participants.indexOf($(obj).find('.name').attr('data-uuid')) > -1) {
                    var img = $(obj).find('.profile').attr('src').split('/');
                    shareThisMember($(obj).find('.name').attr('data-uuid'), img[img.length - 1]);
                }
            })
            cookieFiles = [];
            if (getCookie('create_to_f_atached') != "") {
                var create_to_f_atached = getCookie('create_to_f_atached').split(',');
                if (create_to_f_atached.length > 0) {



                    $.each(create_to_f_atached, function (i, k) {
                        cookieFiles.push(k);
                        var file_type = k.split('.').pop().toLowerCase();
                        switch (file_type) {
                            case 'jpeg':
                            case 'jpg':
                            case 'png':
                            case 'gif':
                            case 'svg':
                                file_type = 'img';
                                break;
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
                                file_type = file_type;
                                break;
                            default:
                                file_type = 'other';
                        }

                        if (file_type == 'img') {
                            var imgsrc = file_server + '/upload/' + k;
                        } else {
                            var imgsrc = "/images/file_icon/" + file_type + ".png";
                        }

                        var html = '<div class="chat-uploading-files fileno_' + i + '">';
                        html += '<span class="close-chat-uploading-file" onclick="removeCookieFile(\'' + i + '\',\'' + k + '\');"><img src="/images/svg/CloseModal.svg"></span>';
                        html += '<div class="chat-file-icons">';
                        html += '<img src="' + imgsrc + '" alt="' + k + '" data-filetype="' + file_type + '" data-name="' + k + '">';
                        html += '</div>';
                        html += '<div class="chat-file-information">';
                        html += '<h4>' + k + '</h4>';
                        html += '<p>' + moment().format('MMM DD, YYYY @ h:mm a') + '</p>';
                        // html += '<div class="chat_file_progress">';
                        // html += '<div class="progress-bar progress-bar-success progress-bar-striped">&nbsp;</div>';
                        // html += '</div>';
                        html += '</div>';
                        $("#viewUploadFileviewUploadFile").append(html);
                    });

                    $("#viewUploadFileviewUploadFile").show();
                }
            }

            setCookie("create_to_f_atached", '', 1);
            setCookie("create_to_f_participant", '', 1);
            setCookie("create_to_f_con", '', 1);
        } else {
            setCookie("create_to_f_participant", '', 1);
            setCookie("create_to_f_con", '', 1);
        }
    } else {
        $('.side_bar_list_item li.newTodo').click();
    }
    // $('#closeNewToDO').show();
    $("#todoTitle").focus();
    if(numrelated > 0){
        allKeyUp();
    }
    numrelated = $('.side_bar_list_item > li:visible').length

}

function removeCookieFile(i, val) {
    $(".fileno_" + i).remove();
    removeA(cookieFiles, val);
}


function closeRightSection() {
    // console.log('627');
    if($('#n_ToDo_item').is(':visible')){

        if($('.backwrap').is(':visible')){
            closeAllPopUp();
        }else if($('#dueDatePickerDiv').is(':visible')){
            $('#dueDatePickerDiv').hide();
        }else if($('.suggested-type-list').is(':visible')){
            $('.suggested-type-list').hide();
        }else{
            $('.side_bar_list_item li.newTodo').remove();
            if(!$('.side_bar_list_item li').length == 0){
                if (getCookie('lastActive') != "") {
                    $("#activity_" + getCookie('lastActive')).trigger('click');
                } else {
                    $('.side_bar_list_item li:first').click();
                }
            }else{
                createNewTodo();
            }
            
        }

    }else{
        if($('.backwrap').is(':visible')){
            closeAllPopUp();
        }else if($('#dueDatePickerDiv').is(':visible')){
            $('#dueDatePickerDiv').hide();
        }else if($('.suggested-type-list').is(':visible')){
            $('.suggested-type-list').hide();
        }else if($('#cancel-btn').is(':visible')){
            $('#cancel-btn').trigger('click');
        }
    }

    // if($('.side_bar_list_item li').length == 0){
    //     createNewTodo()
    // }else{
    //     if (getCookie('lastActive') != "") {
    //         $("#activity_" + getCookie('lastActive')).trigger('click');
    //     } else {
    //         $('.side_bar_list_item li:first').click();
    //     }
    // }
    // $('.side_bar_list_item li.newTodo').remove();
    // $('#dueDatePickerDiv').hide();

    // // $('#toDoCheckListContainer').css('display', 'block');
    // $('#sharePeopleList').css('display', 'block');
    // $('.item_progress').css('display', 'block');
    // $('.new-added-check-list').css('display', 'block');
    // $('.button-section').css('display', 'none');

    

    // if ($("#n_ToDo_item").is(':visible')) {
    //     let str = $("#todoTitle").val();
    //     if (str != "" ){
    //         saveDraftActiVity();
    //     }else{
    //         if (numrelated > 0){
    //             // console.log(numrelated);
    //             $('.side_bar_list_item li.newTodo').remove();

    //             // $('#toDoCheckListContainer').css('display', 'block');
    //             $('#sharePeopleList').css('display', 'block');
    //             $('.item_progress').css('display', 'block');
    //             $('.new-added-check-list').css('display', 'block');
    //             $('.button-section').css('display', 'none');

    //             if (getCookie('lastActive') != "") {
    //                 $("#activity_" + getCookie('lastActive')).trigger('click');
    //             } else {
    //                 $('.side_bar_list_item li:first').click();
    //             }
    //         }

    //     }

    // } else {
    //     $('.side_bar_list_item li.newTodo').remove();

    //     // $('#toDoCheckListContainer').css('display', 'block');
    //     $('#sharePeopleList').css('display', 'block');
    //     $('.item_progress').css('display', 'block');
    //     $('.new-added-check-list').css('display', 'block');
    //     $('.button-section').css('display', 'none');

    //     if (getCookie('lastActive') != "") {
    //         $("#activity_" + getCookie('lastActive')).trigger('click');
    //     } else {
    //         $('.side_bar_list_item li:first').click();
    //     }
    // }
}

// var toDoPinUnpin = (event) => {
//     var design = $('.side_bar_list_item li.activeTodo').get();

//     if ($(event.target).hasClass('unpin') == true) {
//         $(event.target).addClass('pined').removeClass('unpin');
//         $(event.target).attr('src', '/images/basicAssets/custom_pinned.svg');
//         $('.side_bar_list_item li.activeTodo').remove();
//         $('#pinnedToDoList').append(design);
//     } else {
//         $(event.target).addClass('unpin').removeClass('pined');
//         $(event.target).attr('src', '/images/basicAssets/custom_not_pin.svg');
//         $('.side_bar_list_item li.activeTodo').remove();
//         $('#unpinTodoList').append(design);
//     }
// }

var toDoFlagUnflag = (event) => {

    var acid = $('#chat_icon').attr('data-activity_id');

    if ($('#flag_unflag.unflag').is(':visible') == true) {
        socket.emit('toodoUpdate', {
            targetID: acid,
            type: 'flag',
            contain: user_id,
            clusteringkey: $('#activityCreatedAt').val()
        },
            function (confirmation) {
                $('#flag_unflag').removeClass('unflag').addClass('Flagged').attr('src', '/images/basicAssets/Flagged_red.svg');
                $('.side_bar_list_item li.activeTodo').addClass('Flagged');
                $("#fla_" + acid).show();
            });
    } else {
        socket.emit('toodoUpdate', {
            targetID: acid,
            type: 'unflag',
            contain: user_id,
            clusteringkey: $('#activityCreatedAt').val()
        },
            function (confirmation) {
                $('#flag_unflag').removeClass('Flagged').addClass('unflag').attr('src', '/images/basicAssets/Not_Flagged.svg');
                $('.side_bar_list_item li.activeTodo').removeClass('Flagged');
                $("#fla_" + acid).hide();
            });

    }

}

function sidebarFlagActiveAfterDynamicAppand(){
    $(".sidebarFlag").on('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        let activityID = e.target.id;
        let actiID = $('#' + activityID).parent('li').attr('data-activityid');

        if ($('#' + activityID).is(':visible')) {
            socket.emit('toodoUpdate', {
                targetID: actiID,
                type: 'unflag',
                contain: user_id,
                clusteringkey: dataclusteringKey[actiID]
            },
                function (confirmation) {
                    $('#flag_unflag').removeClass('Flagged').addClass('unflag').attr('src', '/images/basicAssets/Not_Flagged.svg');
                    $('.side_bar_list_item li.activeTodo').removeClass('Flagged');
                    $("#" + activityID).hide();
                });
        } else {
            socket.emit('toodoUpdate', {
                targetID: actiID,
                type: 'flag',
                contain: user_id,
                clusteringkey: dataclusteringKey[actiID]
            },
                function (confirmation) {
                    $('#flag_unflag').removeClass('unflag').addClass('Flagged').attr('src', '/images/basicAssets/Flagged_red.svg');
                    $('.side_bar_list_item li.activeTodo').addClass('Flagged');
                    $("#" + activityID).show();
                });
        }
    });
}

$(".sidebarFlag").on('click', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let activityID = e.target.id;
    let actiID = $('#' + activityID).parent('li').attr('data-activityid');

    if ($('#' + activityID).is(':visible')) {
        socket.emit('toodoUpdate', {
            targetID: actiID,
            type: 'unflag',
            contain: user_id,
            clusteringkey: dataclusteringKey[actiID]
        },
            function (confirmation) {
                $('#flag_unflag').removeClass('Flagged').addClass('unflag').attr('src', '/images/basicAssets/Not_Flagged.svg');
                $('.side_bar_list_item li.activeTodo').removeClass('Flagged');
                $("#" + activityID).hide();
            });
    } else {
        socket.emit('toodoUpdate', {
            targetID: actiID,
            type: 'flag',
            contain: user_id,
            clusteringkey: dataclusteringKey[actiID]
        },
            function (confirmation) {
                $('#flag_unflag').removeClass('unflag').addClass('Flagged').attr('src', '/images/basicAssets/Flagged_red.svg');
                $('.side_bar_list_item li.activeTodo').addClass('Flagged');
                $("#" + activityID).show();
            });
    }
});



$('#tagged_area').on('click', function () {
    $('.addTagConv').show();
    $(this).hide();
});

$("#todoTitle").on('focus', function (e) {
    // console.log('740');
    if ($('#updateAction').val() !== '0') {
        $("#todoTitle").css('background-color', '#ffffff');
    } else {
        $("#todoTitle").css('background-color', '#ffffff');
    }
});


$("#todoTitle").on('blur', function (e) {
    //console.log('749');
    var str = $('#todoTitle').val();
    if (str != "") {
        if ($('#updateAction').val() !== '0') {
            $("#todoTitle").css('overflow', 'hidden');
            $("#todoTitle").css('float', 'left');
            $("#todoTitle").css('display', 'inline-block');
            $("#todoTitle").css('background-color', '#ececec');
            if (str != "") {
                var acid = $('#chat_icon').attr('data-activity_id');
                socket.emit('toodoUpdate', {
                    targetID: acid,
                    type: 'title',
                    contain: $('#todoTitle').val(),
                    clusteringkey: $('#activityCreatedAt').val()
                },
                    function (confirmation) {
                        $('#activity_' + acid + ' .toDoName').text($('#todoTitle').val());
                    });
            }
        } else {
            $("#todoTitle").css('background-color', '#ececec');
        }
    } else {
        e.preventDefault();
    }

});

function saveDraftActiVity() {
    return new Promise((resolve,reject)=>{
        var str = $('#todoTitle').val();
        var selectecosystem = $("#selectWorkspace").val();
        if (str != "" && str != " ") {
            socket.emit('CreateDraftActivity', {
                activityType: 'TODO',
                activityTitle: str,
                createdBy: user_id,
                ecosystem: selectecosystem,
                adminListUUID: sharedMemberList,
                status: 2
            },
            function (confirmation) {
                if (confirmation.activityres.status) {
                    $('#createToDoPopup').hide();
                    $("#connectTodoTitle").val('');
                    $("#notes_area").val('');
                    $("#timeFrom").val('');
                    $("#timeTo").val('');
                    $("#ReminderTime").val('');
                    $("#viewUploadFileviewUploadFile").html('');
                    $("#n_ToDo_item").remove();
                    var liDesign = '<li id="activity_' + confirmation.activityres.activity_id + '" data-activityid="' + confirmation.activityres.activity_id + '" class="todoLink" onclick="startToDo(event)"><span class="toDo"></span><span class="toDoName">' + str + '</span><span class="draft" style="margin-top:8px;">(draft)</span></li>';

                    $('#unpinTodoList').prepend(liDesign);

                    resolve(confirmation.activityres.msg);
                } else {
                    reject(confirmation.activityres.status);
                }
            });
        }else{
            reject(confirmation.activityres.status);
        }
    });
}

function allKeyUp() {

    $(document).keyup(function (e) {
        var taggedContainer = $('.addTagConv');

        if (e.keyCode == 27) {
            if (taggedContainer.is(':visible') == true) {
                taggedContainer.hide();
                $('#tagged_area').show();
            }


            if ($("#todoTitle").is(':focus')) {
                $("#todoTitle").blur();
            }

        }

    });

    $("#todoTitle").keyup(function (e) {
        var str = $('#todoTitle').val().trim();
        str = str.replace(/<\/?[^>]+(>|$)/g, "");

        $('#todoTitle').css('border', 'none');

        // $('.edit-todo-name').css('width', '500px')
        if (str.length > 60) {
            $('.edit-todo-name').css('height', '64px');
            $('.to_do_head_left').css('margin', '6px 0px');
            $('.to_do_head_left label').css('top', '20px');
        } else {
            $('.edit-todo-name').css('height', '32px');
            $('.to_do_head_left').css('margin', '22px 0px');
            $('.to_do_head_left>label').css('top', '5px');
        }

        if (e.keyCode == 13) {
            e.preventDefault();
            e.stopPropagation();
            if (str != "" && str != " ") {
                if (str.length < 129) {

                    if (str.length > 128) str = str.substring(0, 128);

                    $('.todoLink.activeTodo .toDoName').text($(this).val());
                    $('#todoTitle').css('border', '1px solid #ececec');
                    if ($('#updateAction').val() === '0') {
                        var selectecosystem = $("#selectWorkspace").val();
                        socket.emit('CreateDraftActivity', {
                            activityType: 'TODO',
                            activityTitle: str,
                            createdBy: user_id,
                            ecosystem: selectecosystem,
                            adminListUUID: sharedMemberList,
                            status: 1
                        },
                            function (confirmation) {
                                // console.log(confirmation);
                                if (confirmation.activityres.status) {

                                    // var gmt = moment(confirmation.activityres.clusteringkey).format('Z');
                                    var then = moment(confirmation.activityres.clusteringkey).subtract(6, "hours").toDate();
                                    dataclusteringKey[confirmation.activityres.activity_id] = moment(then).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

                                    //2018-10-30T13:42:52.373Z
                                    // console.log()
                                    $('#createToDoPopup').hide();
                                    $("#connectTodoTitle").val('');
                                    $("#notes_area").val('');
                                    $("#timeFrom").val('');
                                    $("#timeTo").val('');
                                    $("#ReminderTime").val('');
                                    $("#viewUploadFileviewUploadFile").html('');
                                    $("#n_ToDo_item").remove();
                                    var liDesign = '<li id="activity_' + confirmation.activityres.activity_id + '" data-activityid="' + confirmation.activityres.activity_id + '" class="todoLink activeTodo" onclick="startToDo(event)"><span class="toDo"></span><span class="toDoName">' + str + '</span><span class="remove" onclick="hideThisTodo(event, \''+confirmation.activityres.activity_id +'\')"></span></li>';
                                    $('#unpinTodoList').prepend(liDesign);
                                    createNewTodo();
                                    // $("#activity_" + confirmation.activityres.activity_id).trigger('click');
                                }
                            });
                    } else {
                        $(this).blur();
                        $('.todoLink.activeTodo').removeClass('newTodo');
                        // $('#closeNewToDO').hide();
                        if ($('#actCre').val() === user_id) {
                            if ($("#updateAction").val() !== 0) {
                                var acid = $('#chat_icon').attr('data-activity_id');
                                socket.emit('toodoUpdate', {
                                    targetID: acid,
                                    type: 'title',
                                    contain: $('#todoTitle').val(),
                                    clusteringkey: $('#activityCreatedAt').val()
                                },
                                    function (confirmation) {
                                        $('#activity_' + acid + ' .toDoName').text($('#todoTitle').val());
                                    });
                            }
                        } else {
                            toastr['warning']('Please contact with todo creator', 'Warning');
                        }
                    }
                } else {
                    if (str.length > 128) str = str.substring(0, 128);
                    $("#todoTitle").val(str);
                    toastr['warning']('Title allow maximum 128 charecter', 'Warning');
                }
            } else {
                $('#todoTitle').css('border', '1px solid red');
            }
        }

    });    
    $("#todoTitle").keydown(function (e) {
        if(e.keyCode == 13){
            e.preventDefault();
            e.stopPropagation();
        }
    });

    $('#notes_area').keyup(function (e) {
        if (e.keyCode == 13) {
            // $(this).blur();
            $('.todoLink.activeTodo').removeClass('newTodo');
            if ($('#actCre').val() === user_id) {
                if ($("#updateAction").val() !== '0') {
                    var acid = $('#chat_icon').attr('data-activity_id');
                    socket.emit('toodoUpdate', {
                        targetID: acid,
                        type: 'noteUp',
                        contain: $('#notes_area').val(),
                        clusteringkey: $('#activityCreatedAt').val()
                    },
                        function (confirmation) {
                            // console.log(confirmation.msg);
                        });
                }
            } else {
                toastr['warning']('Please contact with todo creator', 'Warning');
            }

        }
    });

    $('#tagged-popup-title').keyup(function (e) {

        var taggedValue = $('#tagged-popup-title').val();
        var addTagged = '<li>' + taggedValue + '</li>';

        if (e.keyCode == 13) {
            if (!$(this).val() == '') {
                $(addTagged).appendTo('ul.tags_droupdown');
                $(this).val('');
            }
        }

    });

    $('#sideBarSearch').keyup(function (e) {
        var searchValue = $(this).val().toLowerCase();

        allActivityList = [];
        $('.side_bar_list_item li').each(function (k, v) {
            if (allActivityList.indexOf($(v).attr('data-activityid')) === -1) {
                allActivityList.push($(v).attr('data-activityid'));
            }
        });

        var searchConvList = [];

        if (tagged_conv_list.length > 0) {
            $.each(tagged_conv_list, function (k, v) {
                if (searchConvList.indexOf() === -1) {
                    searchConvList.push(v);
                }
            });
        }

        if (setFlagConvArray.length > 0) {
            $.each(setFlagConvArray, function (k, v) {
                if (searchConvList.indexOf() === -1) {
                    searchConvList.push(v);
                }
            });

            var targettext = 'flag'
        } else {
            var targettext = 'text'
        }


        var code = e.keyCode || e.which;
        if (searchValue.length > 0) {
            if (code == 13) { //Enter keycode = 13
                e.preventDefault();
                socket.emit('todoListForSearch', {
                    allActivityList: (searchConvList.length > 0 ? searchConvList : allActivityList),
                    target_text: searchValue,
                    target_filter: targettext,
                    user_id: user_id
                }, (callBack) => {
                    if (callBack.status) {

                        if (!$("#c_search_ed").is(':visible')) {
                            var design = '<div class="tag_item" id="c_search_ed"><img src="/images/basicAssets/Search.svg" class="flagged"><p class="tagP">' + searchValue + '</p><img onclick="removeSearchText(\'c_search_ed\')" class="tagIMG" src="/images/basicAssets/Close.svg"></div>';

                            $('.sideContainer  .tagg_list').append(design);
                        } else {
                            $("#c_search_ed").find('.tagP').text(searchValue);
                        }

                        if ($(".sideContainer .tag_item").length > 0) {
                            $('.sideContainer  .tagg_list').show();
                        }

                        $("#pinnedToDoList li").hide();
                        $("#overdueULlist li").hide();
                        $("#unpinTodoList li").hide();

                        if (callBack.data.length > 0) {

                            $('.side_bar_list_item>li').filter(function () {
                                $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
                            });

                            $.each(callBack.data, function (k, v) {
                                if (currentSerchActivityList.indexOf(v) === -1) {
                                    currentSerchActivityList.push(v);
                                }
                                $("#activity_" + v).show();
                            });

                            $('.side_bar_list_item .toDoName').unhighlight();
                            $('.side_bar_list_item .toDoName').highlight(searchValue);

                            $('.country-label .checkName').unhighlight();
                            $('.country-label .checkName').highlight(searchValue);

                        } else {
                            $('.side_bar_list_item>li').filter(function () {
                                $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
                            });
                            var numrelated = $('.side_bar_list_item > li:visible').length;
                            if (numrelated == 0) {
                                $('.sideContainer  .errMsg').show();
                                $('.sideContainer  .errMsg').text('No result(s) found');
                            }
                        }

                    }
                });

            }
        } else {
            removeSearchText();
        }

    });

    // script for Todo check List
    $('#addTodoCheckList').keyup(function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var addcheck = $('#addTodoCheckList').val();
        var keycode = (event.keyCode ? event.keyCode : event.which);

        if (keycode == '13') {
            if ($("#updateAction").val() == 0) {
                if (!$(this).val() == '') {
                    if (checklistiTEM.indexOf(addcheck) === -1) {
                        socket.emit('checklistBrdcast', { 'data': addcheck }, function (response) {
                            if (response.msg == 'success') {
                                checklistiTEM.push(addcheck);
                                var checkListHtml = '<li class="todoChelistLI"  data-createdby="' + userlistWithname[user_id] + '" data-balloon="Ceated by ' + userlistWithname[user_id] + '" data-balloon-pos="right">';
                                checkListHtml += '  <span class="remove" data-chtitle="' + addcheck + '" onclick="removeThisCheckList(event)"></span>';
                                checkListHtml += '  <span class="edit" data-chtitle="' + addcheck + '" data-chid="new' + checklistiTEM.length + '" onclick="editThisCheckList(event)"></span>';
                                checkListHtml += '  <label class="country-label">';
                                checkListHtml += '  <span class="checkName" data-indexof="' + checklistiTEM.indexOf(addcheck) + '"  onblur="editCheckListOnBlur(event,\'' + addcheck + '\')" onkeydown="editToDoCheckName(event,\'' + addcheck + '\')">' + addcheck + '</span>';
                                checkListHtml += '      <input disabled class="todoCheckBoxInput" type ="checkbox" value="1">';
                                checkListHtml += '      <span class="checkmark"></span>';
                                checkListHtml += '  </label>';
                                checkListHtml += '</li>';

                                $(checkListHtml).appendTo('.new-added-check-list');
                                $('#addTodoCheckList').val('');

                                checkedList[addcheck] = 0;
                                // console.log(addcheck);

                                $(".todoCheckBoxInput").click(function (e) {

                                    if ($(e.target).is(':checked')) {
                                        checkedList[addcheck] = 1;
                                        // console.log('1');
                                    } else {
                                        checkedList[addcheck] = 0;
                                        // console.log('0');
                                    }
                                });

                                countBoxes();
                                isChecked();
                                tooltipforToDo();
                                $('.new-added-check-list input:checkbox').click(isChecked);
                            }
                        });
                        // console.log(isChecked());

                    } else {
                        toastr['warning']('"' + addcheck + '" Already added to your checklist', 'Warning');
                    }
                }
            } else if ($("#updateAction").val() !== 0) {
                var acid = $('#chat_icon').attr('data-activity_id');
                if (!$(this).val() == '') {
                    if (checklistiTEM.indexOf(addcheck) === -1) {
                        updateCheckList.push(addcheck);
                        checkedList[addcheck] = 0;

                        socket.emit('updateChecklist', {
                            activity_id: acid,
                            createdBy: user_id,
                            checklist: updateCheckList,
                            checkedList: checkedList
                        },
                            function (confirmation) {

                                var checkListHtml = '<li class="todoChelistLI"  data-createdby="' + userlistWithname[user_id] + '" data-balloon="Ceated by ' + userlistWithname[user_id] + '" data-balloon-pos="right">';

                                checkListHtml += '  <span class="remove" data-chtitle="' + addcheck + '" data-chid="' + confirmation.res.checklistids[0] + '" onclick="removeThisCheckList(event)"></span>';
                                checkListHtml += '  <span class="edit" data-chtitle="' + addcheck + '" data-chid="' + confirmation.res.checklistids[0] + '" onclick="editThisCheckList(event)"></span>';
                                checkListHtml += '  <label class="country-label">';
                                checkListHtml += '  <span class="checkName"  onblur="editCheckListOnBlur(event,\'' + confirmation.res.checklistids[0] + '\')"  onkeydown="editToDoCheckName(event,\'' + confirmation.res.checklistids[0] + '\')">' + addcheck + '</span>';
                                checkListHtml += '      <input class="todoCheckBoxInput" type ="checkbox" value="' + confirmation.res.checklistids[0] + '">';
                                checkListHtml += '      <span class="checkmark"></span>';
                                checkListHtml += '  </label>';
                                checkListHtml += '</li>';

                                $(checkListHtml).appendTo('.new-added-check-list');
                                $('#addTodoCheckList').val('');
                                updateCheckList = [];
                                checkedList = {};
                                // console.log(addcheck);

                                if (checklistiTEM.indexOf(addcheck) === -1) {
                                    checklistiTEM.push(addcheck);
                                }

                                $(".todoCheckBoxInput").click(function (e) {
                                    e.stopImmediatePropagation();

                                    var acid = $(e.target).val();
                                    var clusteringkey = $('#chat_icon').attr('data-activity_id');

                                    if ($(e.target).is(':checked')) {
                                        socket.emit('toodoUpdate', {
                                            targetID: acid,
                                            type: 'checklistchecked',
                                            contain: 1,
                                            clusteringkey: clusteringkey,
                                            usrid: user_id
                                        },
                                            function (confirmation) {
                                                // console.log(confirmation.msg);
                                            });
                                    } else {
                                        socket.emit('toodoUpdate', {
                                            targetID: acid,
                                            type: 'checklistunchecked',
                                            contain: 0,
                                            clusteringkey: clusteringkey,
                                            usrid: user_id
                                        },
                                            function (confirmation) {
                                                // console.log(confirmation.msg);
                                            });
                                    }
                                });

                                countBoxes()
                                isChecked();
                                tooltipforToDo();
                                $('.new-added-check-list input:checkbox').click(isChecked);

                            });
                    } else {
                        toastr['warning']('"' + addcheck + '" already added to your checklist', 'Warning');
                    }
                }

            }
        }
    });
}

allKeyUp();

var countCheckBox;
var countChecked;

function removeSearchText(id) {
    currentSerchActivityList = [];
    $("#c_search_ed").remove();

    $("#pinnedToDoList li").hide();
    $("#overdueULlist li").hide();
    $("#unpinTodoList li").hide();

    $('.sideContainer  .errMsg').text('');
    $('.sideContainer  .errMsg').hide();

    $('#sideBarSearch').val("");

    $('.side_bar_list_item li').each(function (k, v) {
        $(v).show();
    });
    $('.side_bar_list_item>li').unhighlight();
    $('.country-label .checkName').unhighlight();
}

function countBoxes() {
    countCheckBox = $('.new-added-check-list input:checkbox').length;
    // console.log(countCheckBox);
}
countBoxes();
$('.new-added-check-list input:checkbox').click(countBoxes);

//count checks

function isChecked() {
    countChecked = $('.new-added-check-list input:checkbox:checked').length;
    var percentage = parseInt(((countChecked / countCheckBox) * 100), 10);
    var percent_width = "width:" + percentage + "%";

    if (isNaN(percentage)) {
        var count = 0;
        $('#progressbar').progressbar({
            // value: 0,
            value: $("#progressbar").attr("style", percent_width)
        });
    } else {
        var count = percentage;
        $('#progressbar').progressbar({
            // value: percentage,
            value: $("#progressbar").attr("style", percent_width)
        });
    }

    $(".progress_status").text(count + "%");
}
isChecked();
$('.new-added-check-list input:checkbox').click(isChecked);

// Todo checkList end

var removeThisCheckList = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if ($("#updateAction").val() == 0) {
        $(event.target).parent('li').remove();
        var title = $(event.target).attr('data-chtitle');
        removeA(checklistiTEM, title);
    } else if ($("#updateAction").val() !== 0) {

        var ch_id = $(event.target).attr('data-chid');
        var clusteringkey = $('#chat_icon').attr('data-activity_id');
        socket.emit('deleteCheclList', {
            checklist_id: ch_id,
            clusteringkey: clusteringkey
        },
            function (confirmation) {
                $(event.target).parent('li').remove();
                var title = $(event.target).attr('data-chtitle');
                removeA(checklistiTEM, title);
            });
    }

    countBoxes()
    isChecked();
}


$(".shareingImg>img").click(function () {
    $("#memberListBackWrap").show();
});

$(".closeBackwrap").click(function () {
    $("#memberListBackWrap").hide();
});

// $("#dueDateWS").click(function () {
//     $("#calenderPicker").show();
// });

$("#dueDateWS_newToDo").click(function () {
    $("#calenderPicker_for_newToDo").css('display', 'block');
});
$("#main_month_year").click(function () {
    $(".todo-calender>h4>ul").toggle();
});

$(".todo-dates>span").click(function () {
    $(".todo-dates>span").removeClass("selected");
    $(this).addClass("selected");
});

$(document).mouseup(function (e) {
    var taggedList = $('.addTagConv');
    var filterPannel = $('.filterMainContainer');
    var container = $(".addTagConv");
    var moreMenuPopup = $('.moreMenuPopup');
    var moreDiv = $('.more');
    var cancel_btnOne = $('#cancel-btn');
    var cancel_btnOne = $('#cancel-btn');
    var cancel_btnTwo = $('#closeNewToDO');
    var create_btn = $('#create-btn');
    var todoCal = $('.todo-calender');

    var str = $('#todoTitle').val();


    if(todoCal.is(':visible')){
        if (!todoCal.is(e.target) && todoCal.has(e.target).length === 0) {
            todoCal.hide();
        }
    }
    // if(!cancel_btnOne.is(e.target) && cancel_btnOne.has(e.target).length === 0 && !cancel_btnTwo.is(e.target) && cancel_btnTwo.has(e.target).length === 0 && !create_btn.is(e.target) && create_btn.has(e.target).length === 0){
    //     if (str != "") {
            
    //     }
    // }
    

    if (moreMenuPopup.is(':visible')) {
        if (!moreMenuPopup.is(e.target) && moreMenuPopup.has(e.target).length === 0) {
            if (!moreDiv.is(e.target) && moreDiv.has(e.target).length === 0) {
                moreMenuPopup.hide();
            }
        }
    }

    if (!taggedList.is(e.target) && taggedList.has(e.target).length === 0) {
        taggedList.hide();
        $('.tagged').show();
        var checkNewTag = $('#CustagItemList').text().length;
        if (checkNewTag !== 0) {
            $('#taggedIMGAttachFile').attr("src", "/images/basicAssets/custom_tagged.svg");
        } else {
            $('#taggedIMGAttachFile').attr("src", "/images/basicAssets/custom_not_tag.svg");
        }
    }

    if (container.has(e.target).length === 0) {
        container.hide();
        $('#tagged_area').css('display', 'block');
    }
    var calenderPicker = $('#calenderPicker');
    if (calenderPicker.is(':visible')) {
        if (!calenderPicker.is(e.target) && calenderPicker.has(e.target).length === 0) {
            calenderPicker.hide();
        }
    }
    var newToDoCalenderPicker = $('#calenderPicker_for_newToDo');
    if (newToDoCalenderPicker.is(':visible')) {
        if (!newToDoCalenderPicker.is(e.target) && newToDoCalenderPicker.has(e.target).length === 0) {
            newToDoCalenderPicker.hide();
        }
    }
    var suggestedContainer = $('.suggested-type-list');
    if (suggestedContainer.is(':visible')) {
        if (!suggestedContainer.is(e.target) && suggestedContainer.has(e.target).length === 0) {
            clearMemberSearch();
        }
    }
    // if the target of the click isn't the container nor a descendant of the container

    if (!filterPannel.is(e.target) && filterPannel.has(e.target).length === 0) {
        if ($('.chooseTag').is(':visible') == true) {
            $('.chooseTag').hide();
        } else {
            filterPannel.hide();
            $('.side-bar-filter-icon').removeClass('active');
        }
    }
});

function searchFilter() {
    if ($('.filterMainContainer').is(":visible") == false) {
        $('.filterMainContainer').show();
        $('.side-bar-filter-icon').addClass('active');
    }
}
$(".filterItem>.tagged").mouseenter(function () {
    $(".chooseTag").css('display', 'block');
});
$("#flaggedFilter").mouseenter(function () {
    $(".chooseTag").css('display', 'none');
});
$("#unreadFilter").mouseenter(function () {
    $(".chooseTag").css('display', 'none');
});
$("#completedFilter").mouseenter(function () {
    $(".chooseTag").css('display', 'none');
});

var escKeyUpForConnect = () => {
    $(window).keyup(function (e) {
        if (e.keyCode == 27) {
            // filter sidebar
            if ($('.filterMainContainer').is(":visible") == true && $('.chooseTag').is(":visible") == true) {
                $('.chooseTag').hide();

            } else if ($('.filterMainContainer').is(":visible") == true) {
                $('.filterMainContainer').hide();
                $('.side-bar-filter-icon').removeClass("active");
            }
            if ($('.suggested-type-list').is(':visible') == true) {
                clearMemberSearch();
            }
            if ($('.moreMenuPopup').is(':visible') == true) {
                showMorePopUp()
            }
            closeRightSection();


        }
    });
}
escKeyUpForConnect();

var sideBarSearchcollapses = () => {
    $(".side-bar-search-icon").mouseenter(function () {
        $(this).hide();
        if ($(".thread_active").is(":visible") == true) {
            $(".thread_active").hide();
            $(".side_bar_thread_ico").show();
        }
        if ($('#sideBarSearch').is(':visible') == false) {
            $('#sideBarSearch').show();
        }
    });

    $('#sideBarSearch').mouseleave(function () {

        if ($('#sideBarSearch').is(':focus') == false && $('#sideBarSearch').val().length < 1) {
            $(this).hide();
            $(".side-bar-search-icon").show();
        }
    });
    $('#sideBarSearch').blur(function () {
        if ($('#sideBarSearch').val().length <
            1) {
            $(this).hide();
            $(".side-bar-search-icon").show();
        }
    });
}
sideBarSearchcollapses();


if ($('.view_img').length >= 4) {
    alert('Exc');
    $('#count_imgages').css('display', 'block');

}

// For create new to
function createNewActivity() {
    console.log('a');
    var todoTitle = $("#todoTitle").val();
    var selectecosystem = $("#selectWorkspace").val();
    var dueDateWS = $("#dueDatePicker").val();
    var notes_area = $("#notes_area").val();
    var activity_from = $("#timeFrom").val();
    var activity_to = $("#timeTo").val();
    var activity_reminder = $("#ReminderTime").val();

    if (todoTitle.length > 17) {
        var over_length = "over_length";
    }

    if (todoTitle != "" && todoTitle != " ") {
        if (selectecosystem != "") {
            if (dueDateWS == "") {
                $("#dueDatePicker").css('border', '1px solid RED');
            }else{
                socket.emit('toCreateBrdcst', {
                    activityType: 'TODO',
                    activityTitle: todoTitle,
                    activityDescription: notes_area,
                    createdBy: user_id,
                    endTime: dueDateWS,
                    ecosystem: selectecosystem,
                    adminListUUID: sharedMemberList,
                    checklist: checklistiTEM,
                    checkedList: checkedList,
                    todoFrom: activity_from,
                    todoTo: activity_to,
                    todoReminder: activity_reminder
                },
                function (confirmation) {
                    if (confirmation.activityres.status) {

                        // var gmt = moment(confirmation.activityres.clusteringkey).format('Z');
                        var then = moment(confirmation.activityres.clusteringkey).subtract(6, "hours").toDate();
                        dataclusteringKey[confirmation.activityres.activity_id] = moment(then).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

                        $('#toDoCheckListContainer').css('display', 'block');
                        $('#sharePeopleList').css('display', 'block');
                        $('.item_progress').css('display', 'block');
                        $('.new-added-check-list').css('display', 'block');
                        $('.button-section').css('display', 'none');
                        
                        var liDesign = '<li id="activity_' + confirmation.activityres.activity_id + '" data-activityid="' + confirmation.activityres.activity_id + '" class="todoLink activeTodo" onclick="startToDo(event)"><span class="toDo"></span><span class="toDoName">' + todoTitle + '</span><span class="remove" onclick="hideThisTodo(event, \''+confirmation.activityres.activity_id +'\')"></span></li>';

                        $('#unpinTodoList').prepend(liDesign);
                        $("#n_ToDo_item").remove();
                        $("#activity_" + confirmation.activityres.activity_id).trigger('click');

                        $("#amazonWishlist").click(function (e) {
                            if ($("#actCre").val() === user_id) {
                                if (e.target.checked) {
                                    if ($('.country-label').length > 0) {
                                        $(".delete_msg_sec_title").text("Are you sure you want to COMPLETE the following Todo ?");
                                        $("#completed_activity_div").show();
                                    } else {
                                        $(".delete_msg_sec_title").text("Are you sure you want to COMPLETE the following Todo ?");
                                        $("#completed_activity_div").show();
                                    }
                                } else {
                                    if ($('.country-label').length > 0) {
                                        $(".delete_msg_sec_title").text("Are you sure you want to REOPEN the following Todo ?");
                                        $("#reopen_activity_div").show();
                                    } else {
                                        $(".delete_msg_sec_title").text("Are you sure you want to REOPEN the following Todo ?");
                                        $("#reopen_activity_div").show();
                                    }

                                }
                            }

                        });

                        //upload file if there is any file has been tagged

                        if (filedata.length > 0) {
                            var arg_data = {
                                activity_id: confirmation.activityres.activity_id,
                                sender_id: user_id,
                                sender_img: user_img,
                                sender_name: user_fullname,
                                text: $("#file_comment").val(),
                                attach_files: filedata[0],
                                thread_root_id: 0,
                                root_msg_id: 0
                            };

                            socket.emit('todo_send_message', arg_data, (rep) => {

                                $("#viewUploadFileviewUploadFile").html('');
                                $("#viewUploadFileviewUploadFile").hide();
                                
                                if (cookieFiles.length > 0) {
                                    var imgfile = [];
                                    var audiofile = [];
                                    var videofile = [];
                                    var otherfile = [];

                                    $.each(cookieFiles, function (i, k) {
                                        var file_type = k.split('.').pop().toLowerCase();
                                        if (typeCheck(file_type) == 'img') {
                                            imgfile.push(k);
                                        } else if (typeCheck(file_type) == 'ado') {
                                            audiofile.push(k);
                                        } else if (typeCheck(file_type) == 'vdo') {
                                            videofile.push(k);
                                        } else if (typeCheck(file_type) == 'other') {
                                            otherfile.push(k);
                                        }
                                    });

                                    var arg_data = {
                                        msg_id: rep.res.msg.msg_id.toString(),
                                        activity_id: confirmation.activityres.activity_id,
                                        imgfile: imgfile,
                                        audiofile: audiofile,
                                        videofile: videofile,
                                        otherfile: otherfile
                                    };

                                    socket.emit('cokkieFilesUpdate', arg_data, (rep) => {
                                        console.log(rep);
                                    });
                                }
                            });
                        } else {

                            if (cookieFiles.length > 0) {

                                var imgfile = [];
                                var audiofile = [];
                                var videofile = [];
                                var otherfile = [];

                                $.each(cookieFiles, function (i, k) {
                                    var file_type = k.split('.').pop().toLowerCase();
                                    if (typeCheck(file_type) == 'img') {
                                        imgfile.push(k);
                                    } else if (typeCheck(file_type) == 'ado') {
                                        audiofile.push(k);
                                    } else if (typeCheck(file_type) == 'vdo') {
                                        videofile.push(k);
                                    } else if (typeCheck(file_type) == 'other') {
                                        otherfile.push(k);
                                    }
                                });

                                var arg_data = {
                                    activity_id: confirmation.activityres.activity_id,
                                    sender_id: user_id,
                                    sender_img: user_img,
                                    sender_name: user_fullname,
                                    text: "Files from connect",
                                    imgfile: imgfile,
                                    audiofile: audiofile,
                                    videofile: videofile,
                                    otherfile: otherfile,
                                    thread_root_id: 0,
                                    root_msg_id: 0
                                };

                                socket.emit('cokkieFilesSave', arg_data, (rep) => {
                                    console.log(rep);
                                });
                            }

                        }

                    }

                });
            }
        } else {
            $("#selectWorkspace").css('border', '1px solid RED');
        }
    } else {
        $("#todoTitle").css('border', '1px solid RED');
    }

    // console.log($("#upload-channel-photo").val());


}

function typeCheck(type) {
    switch (type) {
        case 'jpeg':
        case 'jpg':
        case 'png':
        case 'gif':
        case 'svg':
            return 'img';
            break;
        case 'mp3':
            return 'ado';
            break;
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
            return 'vdo';
            break;
        default:
            return 'other';
            break;
    }
}


// For update draft activity
function updateDraftActivity() {

    var todoTitle = $("#todoTitle").val();
    var selectecosystem = $("#selectWorkspace").val();
    var dueDateWS = $("#dueDatePicker").val();
    var notes_area = $("#notes_area").val();
    var activity_from = $("#timeFrom").val();
    var activity_to = $("#timeTo").val();
    var activity_reminder = $("#ReminderTime").val();

    if (todoTitle.length > 17) {
        var over_length = "over_length";
    }

    if (todoTitle != "") {
        if (selectecosystem != "") {
            if (dueDateWS == "") {
                $("#dueDatePicker").css('border', '1px solid RED');
            }
        } else {
            $("#selectWorkspace").css('border', '1px solid RED');
        }
    } else {
        $("#todoTitle").css('border', '1px solid RED');
    }

    // console.log($("#upload-channel-photo").val());
    var acid = $('#chat_icon').attr('data-activity_id');

    socket.emit('updateDraftActivity', {
        activityid: acid,
        clusteringkey: $('#activityCreatedAt').val(),
        activityTitle: todoTitle,
        activityDescription: notes_area,
        endTime: dueDateWS,
        ecosystem: selectecosystem,
        adminListUUID: sharedMemberList,
        todoFrom: activity_from,
        todoTo: activity_to,
        todoReminder: activity_reminder,
        createdBy: user_id
    },
        function (confirmation) {
            if (confirmation.activityres.status) {

                $('#toDoCheckListContainer').css('display', 'block');
                $('#sharePeopleList').css('display', 'block');
                $('.item_progress').css('display', 'block');
                $('.new-added-check-list').css('display', 'block');
                $('.button-section').css('display', 'none');
                $("#activity_" + acid).find('.draft').remove();
                $("#activity_" + acid).trigger('click');


                $('#chat_icon').css('pointer-events', 'auto');
                $('#toDoPinUnpinDiv').css('pointer-events', 'auto');
                $('#tagged_area').css('pointer-events', 'auto');
                $('.flag').css('pointer-events', 'auto');
                $('.more').css('pointer-events', 'auto');


                $("#amazonWishlist").click(function (e) {
                    if ($("#actCre").val() === user_id) {
                        if (e.target.checked) {
                            if ($('.country-label').length > 0) {
                                $(".delete_msg_sec_title").text("Are you sure you want to COMPLETE the following Todo ?");
                                $("#completed_activity_div").show();
                            } else {
                                $(".delete_msg_sec_title").text("Are you sure you want to COMPLETE the following Todo ?");
                                $("#completed_activity_div").show();
                            }
                        } else {
                            if ($('.country-label').length > 0) {
                                $(".delete_msg_sec_title").text("Are you sure you want to REOPEN the following Todo ?");
                                $("#reopen_activity_div").show();
                            } else {
                                $(".delete_msg_sec_title").text("Are you sure you want to REOPEN the following Todo ?");
                                $("#reopen_activity_div").show();
                            }

                        }
                    }

                });

                //upload file if there is any file has been tagged

                if (filedata.length > 0) {
                    var arg_data = {
                        activity_id: confirmation.activityres.activity_id,
                        sender_id: user_id,
                        sender_img: user_img,
                        sender_name: user_fullname,
                        text: $("#file_comment").val(),
                        attach_files: filedata[0],
                        thread_root_id: 0,
                        root_msg_id: 0
                    };

                    socket.emit('todo_send_message', arg_data, (rep) => {
                        // console.log(rep);
                        $("#viewUploadFileviewUploadFile").html('');
                        $("#viewUploadFileviewUploadFile").hide();
                    });
                }

            }

        });

}


function clearMemberSearch() {
    $('#search_members').val("");
    $('#search_members').blur();
    $('.inputGroup2 .remove').hide();
    $('#toggle_area .remove').hide();
    $('.suggested-type-list').hide();
}

function shareThisMember(dataID, imSrc) {
    if ($("#updateAction").val() == 0) {
        if (sharedMemberList.indexOf(dataID) == -1) {
            sharedMemberList.push(dataID);
            $('#toDoMember' + dataID + '').remove();
            clearMemberSearch();
            $('#sharePeopleList').show();
            if (sharedMemberList.length < 5) {
                viewMemberImg.push(dataID);
                $('#sharePeopleList .ownerThisToDo').after('<img onclick="viewShareList(event)" src="/images/users/' + imSrc + '" data-uuid="' + dataID + '" class="sharedIMG memberImg' + dataID + '">');
            }

            if (sharedMemberList.length > 4) {
                $('#sharePeopleList span').show();
                $('#sharePeopleList span').text('+' + (sharedMemberList.length - 4));
            }
        }
    } else if ($("#updateAction").val() !== 0 && $("#actCre").val() === user_id) {
        if ($("#actCre").val() !== 0) {
            if (sharedMemberList.indexOf(dataID) == -1) {
                sharedMemberList.push(dataID);
                $('#toDoMember' + dataID + '').remove();
                clearMemberSearch();
                $('#sharePeopleList').show();
                if (sharedMemberList.length < 5) {
                    viewMemberImg.push(dataID);
                    $('#sharePeopleList .ownerThisToDo').after('<img onclick="viewShareList(event)" src="/images/users/' + imSrc + '" data-uuid="' + dataID + '" class="sharedIMG memberImg' + dataID + '">');
                }

                if (sharedMemberList.length > 4) {
                    $('#sharePeopleList span').show();
                    $('#sharePeopleList span').text('+' + (sharedMemberList.length - 4));
                }
            }
            var acid = $('#chat_icon').attr('data-activity_id');
            socket.emit('toodoUpdate', {
                targetID: acid,
                type: 'addmember',
                contain: dataID,
                clusteringkey: $('#activityCreatedAt').val()
            },
                function (confirmation) {
                    // console.log(confirmation.msg);
                    let adminListUUID = [];
                    adminListUUID.push(dataID)
                    adminListUUID.push(user_id)
                    socket.emit('sendMsgOngroupMemberadddelete', {
                        activity_id: acid,
                        type: 'add',
                        adminListUUID: adminListUUID,
                        ecosystem: 'Navigate',
                        createdBy: user_id,
                        activityTitle: $("#todoTitle").val()
                    },
                    function (confirmation) {
                        console.log(confirmation);
                    });
                });
        }
    }
    if ($('.memberListContainer').is(':visible') == true) {
        var name = $('#viewMember' + dataID).find('.memberName').text();
        $('#viewMember' + dataID).remove();
        if ($("#actCre").val() === user_id) {
            var html = '<div class="list showEl" id="viewMember' + dataID + '" onclick="removeMember(uuID = \'' + dataID + '\', img = \'' + imSrc + '\', fullName = \'' + name + '\')">';
        } else {
            var html = '<div class="list showEl" id="viewMember' + dataID + '">';
        }
        html += '<img src="/images/users/' + imSrc + '">';
        html += '<span class="online_' + dataID + ' ' + (onlineUserList.indexOf(dataID) === -1 ? "offline" : "online") + '"></span>';
        html += '<h1 class="memberName">' + name + '</h1>';
        if ($("#actCre").val() === user_id) {
            html += '<span class="tagcheck forActive" onclick="removeMember(uuID = \'' + dataID + '\', img = \'' + imSrc + '\', fullName = \'' + name + '\')"></span>';
        }
        html += '</div>';
        $('#memberListBackWrap .memberList .creatorThisTodo').after(html);
        $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
        popupMouseEnter();

    }
    if ($('.backwrap').is(':visible') == false) {
        $('#search_members').focus();
    }
}

var viewShareList = (event) => {
    $('#memberListBackWrap').show();
    $('#memberListBackWrap .memberList').html("");
    $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
    var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
    $.each(user_list, function (ky, va) {
        if (sharedMemberList.indexOf(va.id) !== -1) {
            if ($("#actCre").val() == va.id ) {
                var uuID = va.id;
                var html = '<div class="list showEl creatorThisTodo" id="viewMember' + uuID + '">';
                html += '<img src="/images/users/' + va.img + '">';
                html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
                html += '<h1 class="memberName">' + va.fullname + '</h1>';
                html += '<span class="creator">Owner</span>';
                html += '</div>';
                $('#memberListBackWrap .memberList').append(html);
                popupMouseEnter();
            }
        }
    });
    $.each(user_list, function (ky, va) {
        if (sharedMemberList.indexOf(va.id) !== -1) {
            if ($("#actCre").val() !== va.id) {
                var uuID = va.id;
                if ($("#actCre").val() === user_id) {
                    var html = '<div class="list showEl" id="viewMember' + uuID + '" onclick="removeMember(uuID = \'' + uuID + '\', img = \'' + va.img + '\', fullName = \'' + va.fullname + '\')">';
                } else {
                    var html = '<div class="list showEl" id="viewMember' + uuID + '">';
                }
                html += '<img src="/images/users/' + va.img + '">';
                html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
                html += '<h1 class="memberName">' + va.fullname + '</h1>';
                if ($("#actCre").val() == va.id) {
                    html += '<span class="creator">Owner</span>';
                }
                if ($("#actCre").val() === user_id) {
                    html += '<span class="tagcheck forActive" onclick="removeMember(uuID = \'' + uuID + '\', img = \'' + va.img + '\', fullName = \'' + va.fullname + '\')"></span>';
                }
                html += '</div>';
                $('#memberListBackWrap .memberList').append(html);
                $('#memberListBackWrap .memberList .list.showEl:first').addClass("selected default");
                popupMouseEnter();
            }

        }
    });

    if ($("#actCre").val() === user_id) {
        $.each(user_list, function (ky, va) {
            if (sharedMemberList.indexOf(va.id) == -1) {
                var uuID = va.id;
                if (uuID !== user_id) {
                    var html = '<div class="list showEl" id="viewMember' + uuID + '" onclick="shareThisMember(\'' + uuID + '\',\'' + va.img + '\')">';
                    html += '<img src="/images/users/' + va.img + '">';
                    html += '<span class="online_' + va.id + ' ' + (onlineUserList.indexOf(va.id) === -1 ? "offline" : "online") + '"></span>';
                    html += '<h1 class="memberName">' + va.fullname + '</h1>';
                    html += '</div>';
                }
                $('#memberListBackWrap .memberList').append(html);
                $('#memberListBackWrap .memberList .list.showEl:first').addClass("selected default");
                popupMouseEnter();
            }
        });
    }
    $('#memberListBackWrap .search_List').focus();
}



$('.search_List').on('keyup', function (e) {
    var value = $(this).val();
    if (e.keyCode !== 40 && e.keyCode !== 38 && e.keyCode !== 13) {
        $(".memberName").each(function () {
            if ($(this).text().toLowerCase().search(value.toLowerCase()) > -1) {
                $(this).parent('.list').show();
                $(this).parent('.list').addClass('showEl');
            } else {
                $(this).parent('.list').hide();
                $(this).parent('.list').removeClass('showEl');
            }
        });

        $('.memberName').unhighlight();
        $('.memberName').highlight(value);
        $(".memberList .list").removeClass('selected');
        $(".memberList .list.showEl:first").addClass('selected');
    }
})



var removeMember = (uuID, img, fullName) => {
    removeA(sharedMemberList, uuID);
    removeA(currentMemberList, uuID);
    if (viewMemberImg.indexOf(uuID) !== -1) {
        removeA(viewMemberImg, uuID);
        $('.memberImg' + uuID + '').remove();
        var newMember = '';
        $.each(sharedMemberList, function (k, v) {
            if (viewMemberImg.indexOf(v) == -1) {
                if (viewMemberImg.length < 4) {
                    viewMemberImg.push(v);
                    newMember = v;
                }
            }
        });
        var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
        $.each(user_list, function (ky, va) {
            if (newMember == va.id && newMember !== $("#actCre").val()) {
                $('#sharePeopleList .ownerThisToDo').after('<img onclick="viewShareList(event)" src="/images/users/' + va.img + '" data-uuid="' + va.id + '" class="sharedIMG memberImg' + va.id + '">');
            }
        });
    }
    $('#viewMember' + uuID + '').remove();
    $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
    $('#sharePeopleList span').text('+' + (sharedMemberList.length - 4));


    if (sharedMemberList.length < 5) {
        $('#sharePeopleList span').hide();
    }

    // if (sharedMemberList.length == 1) {
    //     $('.closeBackwrap').trigger("click");
    //     $('#sharePeopleList').hide();
    // }

    if ($("#updateAction").val() !== '0') {
        var acid = $('#chat_icon').attr('data-activity_id');
        socket.emit('toodoUpdate', {
            targetID: acid,
            type: 'removemember',
            contain: uuID,
            clusteringkey: $('#activityCreatedAt').val()
        },
            function (confirmation) {
                // console.log(confirmation.msg);
                var html = '<div class="list showEl" id="viewMember' + uuID + '" onclick="shareThisMember(\'' + uuID + '\',\'' + img + '\')">';
                html += '<img src="/images/users/' + img + '">';
                html += '<span class="online_' + uuID + ' ' + (onlineUserList.indexOf(uuID) === -1 ? "offline" : "online") + '"></span>';
                html += '<h1 class="memberName">' + fullName + '</h1>';
                html += '</div>';
                $('#memberListBackWrap .memberList').append(html);
                $('#memberListBackWrap .memberList .list.showEl').removeClass("selected");
                $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
                popupMouseEnter();

                socket.emit('sendMsgOngroupMemberadddelete', {
                    activity_id: acid,
                    type: 'delete',
                    uuID: uuID,
                    ecosystem: 'Navigate',
                    createdBy: user_id,
                    activityTitle: $("#todoTitle").val()
                },
                function (confirmation) {
                    console.log(confirmation);
                });


            });
    }
    if($('#n_ToDo_item').is(':visible')){
        var html = '<div class="list showEl" id="viewMember' + uuID + '" onclick="shareThisMember(\'' + uuID + '\',\'' + img + '\')">';
            html += '<img src="/images/users/' + img + '">';
            html += '<span class="online_' + uuID + ' ' + (onlineUserList.indexOf(uuID) === -1 ? "offline" : "online") + '"></span>';
            html += '<h1 class="memberName">' + fullName + '</h1>';
            html += '</div>';
            $('#memberListBackWrap .memberList').append(html);
            $('#memberListBackWrap .memberList .list.showEl').removeClass("selected");
            $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
            popupMouseEnter();
    }
}

// async function setPin(){
//     return new Promise((resolve,reject)=>{

//     });
// } 

// async function setUnPin(){
//     return new Promise((resolve,reject)=>{

//     });
// } 


function todopinunpin(acid) {

    if ($("#pin_unpin").hasClass('pined')) {

        socket.emit('toodoUpdate', {
            targetID: acid,
            type: 'unpin',
            contain: user_id,
            clusteringkey: $('#activityCreatedAt').val()
        },
        function (confirmation) {
            // console.log(confirmation.msg);
            $("#pin_unpin").removeClass('pined');
            $("#pin_unpin").attr('src', '/images/basicAssets/custom_not_pin.svg');
            let disPlayCheck = ($("#fla_" + acid).is(':visible') ? "block" : "none");


            let remove = $("#activity_" + acid + ' .remove').length;
            let unrm = parseInt($("#activity_" + acid).attr('data-urm'));

            if (unrm > 0) {
                var urmDis = 'pointer-events: none; background-image: url(/images/basicAssets/greenChat.svg); background-size: 14px 14px; background-repeat: no-repeat; background-position: center; font-size: 12px; color: #000; background-color: white;';
            } else {
                var urmDis = 'background: transparent; pointer-events: none; ';
            }
            
            if ($("#activity_" + acid).hasClass('od_to')){
                var design = '<li id="activity_' + acid + '" data-activityid="' + acid + '" class="todoLink activeTodo od_to" onclick="startToDo(event)" data-urm=' + unrm + ' ><span class="newtoDo"></span><span class="toDoName">' + $("#activity_" + acid).find('.toDoName').text() + '</span><img id="fla_' + acid + '" class="Flagged sidebarFlag" src="/images/basicAssets/Flagged_red.svg" style="display:' + disPlayCheck + ';width: 13px; height: auto; position: absolute; top: 9px; right: 39px;"><span class="unreadMsgCount"  style="' + urmDis +'"></span>';
                if ($("#activity_" + acid + ' .remove').length > 0) {
                    design += '  <span class="remove" onclick="hideThisTodo(event,\'' + acid + '\')"></span>';
                }
                design += '  </li>';
                $("#activity_" + acid).remove();
                $("#overdueULlist").prepend(design);
            }else if ($("#activity_" + acid).hasClass('n_td')) {
                var design = '<li id="activity_' + acid + '" data-activityid="' + acid + '" class="todoLink activeTodo n_td" onclick="startToDo(event)" data-urm=' + unrm + ' ><span class="toDo"></span><span class="toDoName">' + $("#activity_" + acid).find('.toDoName').text() + '</span><img id="fla_' + acid + '" class="Flagged sidebarFlag" src="/images/basicAssets/Flagged_red.svg" style="display:' + disPlayCheck + ';width: 13px; height: auto; position: absolute; top: 9px; right: 39px;"><span class="unreadMsgCount"  style="' + urmDis +'"></span>';
                if ($("#activity_" + acid + ' .remove').length > 0) {
                    design += '  <span class="remove" onclick="hideThisTodo(event,\'' + acid + '\')"></span>';
                }
                design += '  </li>';
                $("#activity_" + acid).remove();
                $("#unpinTodoList").prepend(design);
            }

            sidebarFlagActiveAfterDynamicAppand();
        });

    } else {

        socket.emit('toodoUpdate', {
            targetID: acid,
            type: 'pin',
            contain: user_id,
            clusteringkey: $('#activityCreatedAt').val()
        },
        function (confirmation) {
            // console.log(confirmation.msg);
            $("#pin_unpin").addClass('pined');
            $("#pin_unpin").attr('src', '/images/basicAssets/custom_pinned.svg');
            let disPlayCheck = ($("#fla_" + acid).is(':visible') ? "block" : "none");

            let remove = $("#activity_" + acid + ' .remove').length;
            let unrm = parseInt($("#activity_" + acid).attr('data-urm'));

            if (unrm > 0) {
                var urmDis = 'pointer-events: none; background-image: url(/images/basicAssets/greenChat.svg); background-size: 14px 14px; background-repeat: no-repeat; background-position: center; font-size: 12px; color: #000; background-color: white;';
            } else {
                var urmDis = 'background: transparent; pointer-events: none; ';
            }

            if ($("#activity_" + acid).hasClass('od_to')) {
                var design = '<li id="activity_' + acid + '" data-activityid="' + acid + '" class="todoLink activeTodo od_to" onclick="startToDo(event)" data-urm=' + unrm + ' ><span class="toDo"></span><span class="toDoName">' + $("#activity_" + acid).find('.toDoName').text() + '</span><img id="fla_' + acid + '" class="Flagged sidebarFlag" src="/images/basicAssets/Flagged_red.svg" style="display:' + disPlayCheck + ';width: 13px; height: auto; position: absolute; top: 9px; right: 39px;"><span class="unreadMsgCount"  style="' + urmDis +'"></span>';
                if ($("#activity_" + acid + ' .remove').length > 0) {
                    design += '  <span class="remove" onclick="hideThisTodo(event,\'' + acid + '\')"></span>';
                }
                design += '  </li>';
                $("#activity_" + acid).remove();
                $("#pinnedToDoList").prepend(design);
            }else if ($("#activity_" + acid).hasClass('n_td')) {
                var design = '<li id="activity_' + acid + '" data-activityid="' + acid + '" class="todoLink activeTodo n_td" onclick="startToDo(event)" data-urm=' + unrm + ' ><span class="toDo"></span><span class="toDoName">' + $("#activity_" + acid).find('.toDoName').text() + '</span><img id="fla_' + acid + '" class="Flagged sidebarFlag" src="/images/basicAssets/Flagged_red.svg" style="display:' + disPlayCheck + ';width: 13px; height: auto; position: absolute; top: 9px; right: 39px;"><span class="unreadMsgCount"  style="' + urmDis +'"></span>';
                if ($("#activity_" + acid + ' .remove').length > 0) {
                    design += '  <span class="remove" onclick="hideThisTodo(event,\'' + acid + '\')"></span>';
                }
                design += '  </li>';
                $("#activity_" + acid).remove();
                $("#pinnedToDoList").prepend(design);
            }

            sidebarFlagActiveAfterDynamicAppand();

            

        });
    }

};
var show_flag_msg = () => {
    if (!$("#flaggedFilter").hasClass('activeComFilter')) {
        $("#flaggedFilter").addClass('activeComFilter');
        socket.emit('todosearch', {
            type: 'flag',
            userid: user_id,
            activity_list: currentSerchActivityList
        },
            function (confirmation) {
                if (confirmation.status) {
                    if (currentSerchActivityList.length > 0) {
                        if (!$("#c_flag_ed").is(':visible')) {
                            var design = '<div class="tag_item" id="c_flag_ed"><img src="/images/basicAssets/Flagged.svg" class="flagged"><p class="tagP">Flagged</p><img onclick="removeFlagFilter(\'c_flag_ed\')" class="tagIMG" src="/images/basicAssets/Close.svg"></div>';

                            $('.sideContainer  .tagg_list').append(design);
                        }

                        if ($(".sideContainer .tag_item").length > 0) {
                            $('.sideContainer  .tagg_list').show();
                        }

                        $(".com-t-l").hide();
                        if (confirmation.activities.length > 0) {
                            $.each(confirmation.activities, function (k, v) {
                                //console.log(v.activity_has_flagged);
                                if (v.activity_has_flagged != null) {
                                    if (v.activity_has_flagged.length > 0) {
                                        // console.log(v.activity_has_flagged.indexOf(user_id))
                                        if (v.activity_has_flagged.indexOf(user_id) > -1) {
                                            // console.log(v.activity_id)
                                            $("#activity_" + v.activity_id).show();
                                        }
                                    }
                                }
                            });
                        } else {
                            $('.sideContainer  .errMsg').show();
                            $('.sideContainer  .errMsg').text('No result(s) found');

                        }
                    } else {
                        if (!$("#c_flag_ed").is(':visible')) {
                            var design = '<div class="tag_item" id="c_flag_ed"><img src="/images/basicAssets/Flagged.svg" class="flagged"><p class="tagP">Flagged</p><img onclick="removeFlagFilter(\'c_flag_ed\')" class="tagIMG" src="/images/basicAssets/Close.svg"></div>';

                            $('.sideContainer  .tagg_list').append(design);
                        }

                        if ($(".sideContainer .tag_item").length > 0) {
                            $('.sideContainer  .tagg_list').show();
                        }
                        $(".com-t-l").hide();

                        if (confirmation.activities.length > 0) {
                            $.each(confirmation.activities, function (k, v) {
                                if (setFlagConvArray.indexOf(v) === -1) {
                                    setFlagConvArray.push(v);
                                }
                                $("#activity_" + v.activity_id).show();
                            });
                        } else {
                            $('.sideContainer  .errMsg').show();
                            $('.sideContainer  .errMsg').text('No result(s) found');

                        }
                    }
                }
            });
    } else {
        removeFlagFilter('c_flag_ed');
    }

}

var removeFlagFilter = (serID) => {
    setFlagConvArray = [];
    $('.sideContainer  .errMsg').text('');
    $('.sideContainer  .errMsg').hide();
    $("#" + serID).remove();
    $(".com-t-l").show();
    $("#flaggedFilter").removeClass('activeComFilter');

}

var hideThisTodo = (event,activityid) => {
    event.preventDefault();
    event.stopPropagation();
    // $(event.target).parent('li').remove();
    showRemovePopUp(activityid);
}


$("#selectWorkspace").change(function (e) {
    if ($("#updateAction").val() !== 0 && $("#actCre").val() === user_id) {
        var acid = $('#chat_icon').attr('data-activity_id');
        socket.emit('toodoUpdate', {
            targetID: acid,
            type: 'workspace',
            contain: $(e.target).val(),
            clusteringkey: $('#activityCreatedAt').val()
        },
        function (confirmation) {
            // console.log(confirmation.msg);
        });
    }
});

///tooltip for todo page

var tooltipforToDo = () => {
    $('#chat_icon').mouseenter(function () {
        var to_Do_Name = $("#todoTitle").val();
        var selector = $(this);
        setTimeout(function () {
            selector.attr({
                'data-balloon': 'Chat in "' + to_Do_Name + '"',
                'data-balloon-pos': 'up'
            });
        }, 1000);

    });
    $('#tagged_area').mouseenter(function () {
        var selector = $(this);
        setTimeout(function () {
            selector.attr({
                'data-balloon': 'Tag this Task',
                'data-balloon-pos': 'up'
            });
        }, 1000);

    });
    $('.flag').mouseenter(function () {
        var selector = $(this);
        setTimeout(function () {
            selector.attr({
                'data-balloon': 'Flag this Task',
                'data-balloon-pos': 'up'
            });
        }, 1000);

    });
    $('#toDoPinUnpinDiv').mouseenter(function () {
        var selector = $(this);
        setTimeout(function () {
            selector.attr({
                'data-balloon': 'Pin this Task',
                'data-balloon-pos': 'up'
            });
        }, 1000);

    });
    $('.more').mouseenter(function () {
        var selector = $(this);
        if($('.moreMenuPopup').is(':visible')){
            setTimeout(function () {
                selector.attr({
                    'data-balloon': 'Hide more option',
                    'data-balloon-pos': 'right'
                });
            }, 1000);
        }else{
            setTimeout(function () {
                selector.attr({
                    'data-balloon': 'See more option',
                    'data-balloon-pos': 'right'
                });
            }, 1000);
        }

    });
    $('.voice-call').mouseenter(function () {
        var to_Do_Name = $("#todoTitle").val();
        var selector = $(this);
        setTimeout(function () {
            selector.attr({
                'data-balloon': 'Conference call with members of "' + to_Do_Name + '"',
                'data-balloon-pos': 'up'
            });
        }, 1000);

    });
    $('.video-call').mouseenter(function () {
        var to_Do_Name = $("#todoTitle").val();
        var selector = $(this);
        setTimeout(function () {
            selector.attr({
                'data-balloon': 'Video Conference with members of "' + to_Do_Name + '"',
                'data-balloon-pos': 'up'
            });
        }, 1000);

    });
    $('.side_bar_list_item li').mouseenter(function () {
        var lengthCount = $(this).children('.toDoName').text().length;
        var thisName = $(this).children('.toDoName').text();
        var selector = $(this);
        if (lengthCount > 20) {
            setTimeout(function () {
                selector.attr({
                    'data-balloon-length': 'medium',
                    'data-balloon': '' + thisName + '',
                    'data-balloon-pos': 'up'
                });
            }, 1000);
        }
    });

    // $('.todoChelistLI').mouseenter(function (e) {
    //     var to_Do_Name = $(this).attr('data-createdby');
    //     $(this).attr({
    //         'data-balloon': 'Ceated by ' + to_Do_Name,
    //         'data-balloon-pos': 'right'
    //     });
    // });
}

tooltipforToDo();

$("#createConvTag").on('blur keyup', function (e) {
    if ((e.which >= 65 && e.which <= 90) || e.which == 189 || e.which == 13) {
        var str = $('#createConvTag').val().trim();
        str = str.replace(/<\/?[^>]+(>|$)/g, "");

        if (str != "") {

            $(".taggedList li").each(function () {
                if ($(this).text().toLowerCase().search(str.toLowerCase()) > -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });

            $('.taggedList li').unhighlight();
            $('.taggedList li').highlight(str);

            var code = e.keyCode || e.which;

            if (code == 13) { //Enter keycode = 13
                var roomid = $("#createConvTag").attr('data-acid');
                var tagTitle = $("#createConvTag").val();

                e.preventDefault();

                if (tagTitle != "") {

                    if (roomid == "") {
                        toastr["warning"]("You have to select a room or personal conversation", "Warning");
                        $(this).val("");
                    } else {

                        var tagArr = tagTitle.split(',');
                        var sendTagarr = [];
                        var pTag = [];

                        // console.log(tagArr);

                        $.each(tagArr, function (k, v) {

                            if (tagListTitle.indexOf(v.toLowerCase()) === -1) {
                                if (alltags.indexOf(v.toLowerCase()) === -1) {

                                    sendTagarr.push(v.trim().toLowerCase().replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''));
                                    tagListForFileAttach.push(v.toLowerCase());
                                    tagListTitle.push(v.toLowerCase());
                                    alltags.push(v.toLowerCase());

                                } else {

                                    $('.taggedList li').each(function (tagk, tagv) {
                                        if (v.toLowerCase() == $(tagv).text().toLowerCase()) {
                                            $(tagv).trigger('click');
                                            $("#tagItemList").text(tagListTitle.join(','));
                                        }
                                    });
                                }
                            }
                        });

                        $(".taggedList li").each(function () {
                            $(this).show();
                        });

                        $('.taggedList li').unhighlight();


                        if (sendTagarr.length > 0) {
                            socket.emit('saveTag', {
                                created_by: user_id,
                                conversation_id: roomid,
                                tagTitle: sendTagarr,
                                messgids: attachFileList,
                                msgIdsFtag: msgIdsFtag,
                                tagType: "TODO"
                            }, (callBack) => {
                                // console.log(callBack);
                                if (callBack.status) {
                                    $.each(callBack.tags, function (k, v) {
                                        var design = '<li onclick="removeLevel(\'' + v + '\',\'' + roomid + '\',\'' + callBack.roottags[k] + '\')">' + sendTagarr[k] + '<span class="tagcheck" id="level' + v + '" ></span></li>';

                                        tagLsitDetail.push({ 'cnvtagid': v, 'tagid': callBack.roottags[k], 'tagTitle': sendTagarr[k], 'roomid': roomid });
                                        $('.taggedList').append(design);

                                        /* var tag_itemdesign 	= '<div class="added-channel-members">';
                                        tag_itemdesign 	+= '	<input id="tag_'+callBack.roottags[k]+'" data-tagid="'+callBack.roottags[k]+'" data-tagtitle="'+sendTagarr[k]+'" class="checkToDo" type="checkbox">';
                                        tag_itemdesign 	+= '<label for="tag_'+callBack.roottags[k]+'">'+sendTagarr[k]+'</label>';
                                        tag_itemdesign 	+= '</div>';*/

                                        var tag_itemdesign = '<li class="added-tag-list">';
                                        tag_itemdesign +=       '<label for="tag_' + callBack.roottags[k] + '">' + sendTagarr[k] + '';
                                        tag_itemdesign +=           '<input id="tag_' + callBack.roottags[k] + '" data-tagid="' + callBack.roottags[k] + '" data-tagtitle="' + sendTagarr[k] + '" class="checkToDo" type="checkbox">';
                                        tag_itemdesign +=           '<span class="checkmark"></span>';
                                        tag_itemdesign +=       '</label>';
                                        tag_itemdesign +=    '</li>';

                                        $("#taggedItem").append(tag_itemdesign);

                                        my_tag_list[v] = sendTagarr[k];
                                        my_tag_id.push(v);
                                    });

                                    // all_action_for_selected_member();

                                    if (tagListTitle.length > 0) {
                                        $(".tagged").attr('src', '/images/basicAssets/custom_tagged.svg');
                                    }

                                    if (callBack.mtagsid != undefined) {
                                        if (callBack.mtagsid.length > 0) {
                                            $.each(callBack.mtagsid, function (k, v) {
                                                if (msgIdsFtag.indexOf(v) === -1) {
                                                    msgIdsFtag.push(v);
                                                }

                                            });
                                        }
                                    }

                                    $("#createConvTag").val("");
                                    $("#createConvTag").focus();
                                    $("#tagItemList").text(tagListTitle.join(','));

                                    $(".taggedList li").each(function () {
                                        $(this).show();
                                    });

                                    $('.taggedList li').unhighlight();


                                } else {
                                    if (callBack.err == 'at') {
                                        toastr["warning"]("\"" + tagTitle + "\" already tagged", "Warning");
                                    }
                                }
                            });
                        }
                    }
                } else {
                    $("#createConvTag").focus();
                }
            }
        } else {
            $(".taggedList li").each(function () {
                $(this).show();
            });

            $('#createConvTag').val($('#createConvTag').val().replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''));
        }
    } else {

        var str = $('#createConvTag').val().trim();
        str = str.replace(/<\/?[^>]+(>|$)/g, "");

        if (str == "") {
            $(".taggedList li").each(function () {
                $(this).show();
                $(this).unhighlight();
            });
        }

        if (e.which == 8) {
            $(".taggedList li").each(function () {
                if ($(this).text().toLowerCase().search(str.toLowerCase()) > -1) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });

            $('.taggedList li').unhighlight();
            $('.taggedList li').highlight(str);
        }

        if (e.which == 32) {
            $('#createConvTag').val($('#createConvTag').val().replace(" ", ""));
        } else {
            $('#createConvTag').val($('#createConvTag').val().replace(/[`~!@#$%^&*()|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ''));
        }

    }
});

var removeLevel = (lID, rommID, rootTag) => {
    var thisText = '';
    var indx = "";

    var sendTagaT = $("#level" + lID).parent('li').text().toLowerCase();

    socket.emit('deleteTag', {
        tagid: lID,
        rommID: rommID,
        msgIdsFtag: msgIdsFtag,
        tagtile: sendTagaT
    }, (callBack) => {
        if (callBack.status) {

            $("#level" + lID).parent('li').attr('id', 'tagLi' + rootTag);
            $("#level" + lID).parent('li').attr('onclick', 'addTagto(\'' + rootTag + '\',\'' + rommID + '\')');
            $("#level" + lID).remove();

            $.each(tagLsitDetail, function (tdk, tdv) {
                if (rootTag == tdv.tagid && rommID == tdv.roomid) {
                    thisText = tdv.tagTitle;
                    indx = tdk;
                }
            });

            removeA(tagListForFileAttach, thisText);
            removeA(tagListTitle, thisText);
            tagLsitDetail.splice(indx, 1);

            $("#tagItemList").text(tagListTitle.join(','));

            if (tagListTitle.length > 0) {
                $(".tagged").attr('src', '/images/basicAssets/custom_tagged.svg');
            }

            if (tagListTitle.length == 0) {
                $("#createConvTag").val("");
                $(".tagged").attr('src', '/images/basicAssets/custom_not_tag.svg');
            }
        }
    });
};

var addTagto = (lID, rommID) => {
    var sendTagarr = [];
    var tagssid = [];
    var sendTagaT = $("#tagLi" + lID).text().toLowerCase();
    socket.emit('saveConvTag', {
        tagid: lID,
        conversation_id: rommID,
        messgids: attachFileList,
        msgIdsFtag: msgIdsFtag,
        tagtile: sendTagaT
    }, (callBack) => {
        if (callBack.status) {

            $("#tagLi" + lID).removeAttr('onclick');
            $("#tagLi" + lID).html($("#tagLi" + lID).text() + '<span class="tagcheck" id="level' + callBack.id + '"></span>');

            $("#tagLi" + lID).attr('onclick', 'removeLevel(\'' + callBack.id + '\',\'' + rommID + '\',\'' + lID + '\')');
            $("#tagLi" + lID).removeAttr('id');

            tagListForFileAttach.push(sendTagaT.toLowerCase());
            tagListTitle.push(sendTagaT.toLowerCase());
            tagLsitDetail.push({ 'cnvtagid': callBack.id, 'tagid': lID, 'tagTitle': sendTagaT, 'roomid': rommID });

            if (tagListTitle.length > 0) {
                $("#tagItemList").text(tagListTitle.join(','));
                $(".tagged").attr('src', '/images/basicAssets/custom_tagged.svg');
            }

        } else {
            if (callBack.err == 'at') {
                toastr["warning"]("\"" + tagTitle + "\" already tagged", "Warning");
            }
        }
    });
}

$('.chat-upload-popup-content .tagged').on('click', function () {
    $(this).hide();
    $('.chat-upload-popup-content .addTagConv').show();
    $("#customAdd").focus();
});

//tags filter sratr here

var searchTag = (value) => {
    $("#taggedItem .added-tag-list").each(function () {

        if ($(this).find('label').text().toLowerCase().search(value.toLowerCase()) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    $("#taggedItem .added-tag-list").unhighlight();
    $("#taggedItem .added-tag-list").highlight(value);
}

var removeTagFilter = (id) => {

    $("#" + id + "_ed").remove();
    $("#" + id).prop('checked', false);

    var splitID = id.split("_");

    $("#pinnedToDoList li").hide();
    $("#overdueULlist li").hide();
    $("#unpinTodoList li").hide();

    removeA(taggedCheckedID, splitID[1]);

    for (var i = 0; i < taggedCheckedRoom.length; i++) {
        if (taggedCheckedRoom[i].tagid == splitID[1])
            taggedCheckedRoom.splice(i);
    }

    getTaggedData(taggedCheckedID);

    if ($(".checkToDo:checked").length == 0) {

        taggedCheckedRoom = [];
        taggedRoomID = [];
        taggedCheckedID = [];

        if (currentConv_list.length > 0) {
            $("#pinnedToDoList li").hide();
            $("#overdueULlist li").hide();
            $("#unpinTodoList li").hide();

            $.each(currentConv_list, function (k, v) {
                $("#activity_" + v).show();
            });

            $.each($('.msgs-form-users'), function () {
                $(this).prev('.msg-separetor').show();
                $(this).show();
            });

            $('.user-msg>p').unhighlight();
            $('.user-msg>p').highlight(searchTagList[searchTagList.length - 1].replace("_", " "));

            $.each($('.msgs-form-users'), function () {
                if ($(this).find('.highlight').length == 0) {
                    $(this).prev('.msg-separetor').hide();
                    $(this).hide();
                } else {
                    $(this).prev('.msg-separetor').show();
                    $(this).show();
                }
            });

            $("#searchText").val(searchTagList[searchTagList.length - 1].replace("_", " "));
            $('#sideBarSearch').val("");
            $('#sideBarSearch').hide();
            $(".side-bar-search-icon").show();
        } else {
            $("#pinnedToDoList li").show();
            $("#overdueULlist li").show();
            $("#unpinTodoList li").show();
        }
    }
}

$(".checkToDo").click(function (e) {

    if (e.target.checked) {

        var tagtitle = $("#" + e.target.id).attr('data-tagtitle');
        var tagid = $("#" + e.target.id).attr('data-tagid');

        $('#taggedItem .checkToDo').each(function (i, row) {
            if ($(row).is(':checked')) {
                if (taggedCheckedID.indexOf($(row).attr('data-tagid')) === -1) {
                    taggedCheckedID.push($(row).attr('data-tagid'));
                }
            }

        });

        $("#pinnedToDoList li").hide();
        $("#overdueULlist li").hide();
        $("#unpinTodoList li").hide();

        var design = '<div class="tag_item" id="' + e.target.id + '_ed"><img src="/images/basicAssets/custom_not_tag.svg" class="tagged"><p>' + tagtitle + '</p><img onclick="removeTagFilter(\'' + e.target.id + '\')" src="/images/basicAssets/Close.svg"></div>';

        $('.tagg_list').append(design);
        if ($(".tag_item").length > 0) {
            $('.tagg_list').show();
        }

        getTaggedData(taggedCheckedID);

    } else {

        $("#" + e.target.id + "_ed").remove();
        var tagid = $("#" + e.target.id).attr('data-tagid');

        $("#pinnedToDoList li").hide();
        $("#overdueULlist li").hide();
        $("#unpinTodoList li").hide();

        removeA(taggedCheckedID, tagid);


        for (var i = 0; i < taggedCheckedRoom.length; i++) {
            if (taggedCheckedRoom[i].tagid == tagid)
                taggedCheckedRoom.splice(i);
        }

        getTaggedData(taggedCheckedID);

        if ($(".checkToDo:checked").length == 0) {

            taggedCheckedRoom = [];
            taggedRoomID = [];
            taggedCheckedID = [];

            if (currentConv_list.length > 0) {
                $("#pinnedToDoList li").hide();
                $("#overdueULlist li").hide();
                $("#unpinTodoList li").hide();

                $.each(currentConv_list, function (k, v) {
                    $("#activity_" + v).show();
                });

                $.each($('.msgs-form-users'), function () {
                    $(this).prev('.msg-separetor').show();
                    $(this).show();
                });

                $('.user-msg>p').unhighlight();
                $('.user-msg>p').highlight(searchTagList[searchTagList.length - 1].replace("_", " "));

                $.each($('.msgs-form-users'), function () {
                    if ($(this).find('.highlight').length == 0) {
                        $(this).prev('.msg-separetor').hide();
                        $(this).hide();
                    } else {
                        $(this).prev('.msg-separetor').show();
                        $(this).show();
                    }
                });

                $("#searchText").val(searchTagList[searchTagList.length - 1].replace("_", " "));
                $('#sideBarSearch').val("");
                $('#sideBarSearch').hide();
                $(".side-bar-search-icon").show();
            } else {
                $("#pinnedToDoList li").show();
                $("#overdueULlist li").show();
                $("#unpinTodoList li").show();
            }
        }
    }
});

var taggedIDOnload = [];
var taggedRoomID = [];
var taggedCheckedID = [];
var taggedCheckedRoom = [];

function getTaggedData(Darray) {
    var promises = [];
    var itemRows = Darray;
    for (var i = 0; i < itemRows.length; i++) {
        var id = itemRows[i];
        var p = new Promise(function (resolve, reject) { dbData(id, resolve, reject); });
        promises.push(p);
    }
    Promise.all(promises).then(function (data) {
        recalcTotals(data);
    });
}

function dbData(id, resolve, reject) {
    socket.emit('taggedData', {
        tagid: id
    }, (callBack) => {
        if (callBack.status) {
            return resolve(callBack.tagDet);
        } else {
            return reject();
        }

    });
}

function search(tagid, roomid, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].tagid === tagid && myArray[i].roomid === roomid) {
            return myArray[i];
        }
    }
}

function countElement(item, array) {
    var count = 0;
    $.each(array, function (i, v) { if (v === item) count++; });
    return count;
}

var tagged_conv_list = [];

function recalcTotals(data) {
    if (data.length > 0) {
        var dbData = [];

        $.each(data, function (k, v) {
            $.each(v, function (kd, vd) {
                dbData.push(vd);
            });
        });

        $.each(dbData, function (k, v) {
            if (search(v.tag_id, v.conversation_id, taggedCheckedRoom) == undefined) {
                taggedCheckedRoom.push({ 'tagid': v.tag_id, 'roomid': v.conversation_id });
                taggedRoomID.push(v.conversation_id);
            }
        });

        $.each(taggedRoomID, function (k, v) {
            if (parseInt(taggedCheckedID.length) == parseInt(countElement(v, taggedRoomID))) {
                if (currentConv_list.length > 0) {
                    if (currentConv_list.indexOf(v) > -1) {
                        $("#activity_" + v).show();
                    }
                } else {
                    $("#activity_" + v).show();
                    if (tagged_conv_list.indexOf(v) === -1) {
                        tagged_conv_list.push(v);
                    }
                }
            }
        });

    }
}

// Delete message
var delete_this_msg = (event, all_active) => {
    
    tempUpdateAction = $('#updateAction').val();
    tempActivityCreatedAt = $('#actCre').val();
    tempActivityCreatedBy = $('#activityCreatedAt').val();

    var msgid = $(event.target).closest('.chat-message').attr('data-msgid');
    var imgSrc = $('.todo_msgid_' + msgid + '').find('.user-imgs').attr('src');
    var imgHtml = '<div class="msg-user-photo"><img src="' + imgSrc + '"></div>';
    $('.msg-more-popup').hide();
    $('#delete_msg_div').show();
    $('.main-deleted-msg').html(imgHtml);
    $('.main-deleted-msg').append('<div class="delbody">' + $('.todo_msgid_' + msgid).find('.chat-message-content').html() + '</div>');
    $('#delete_msg_div').find('.btn-msg-del').attr('data-id', msgid);
    $('#delete_msg_div').find('.btn-msg-del-all').attr('data-id', msgid);
    if (all_active)
        $('#delete_msg_div').find('.btn-msg-del-all').show();
    else
        $('#delete_msg_div').find('.btn-msg-del-all').hide();

    var checkdelete = $(event.target).closest('.chat-message').find('.silent_delete');
    if(checkdelete.length > 0){
        $('.btn-msg-del').hide();
        $('.btn-msg-del.btn-msg-del-all').hide();
        $('.btn-msg-del.removeLine').remove();
        $('#delete_msg_div').find('.btn-cancel').after('<button type="button" class="btn-msg-del removeLine" onclick="removeThisLine(event,\''+msgid+'\')" data-id="'+msgid+'">Delete</button>');
    }else{
        $('.btn-msg-del.removeLine').remove();
    }
};
var delete_commit = (e) => {
    var msgid = $(e).attr('data-id');
    var is_seen = $('.msg_id_del_status_' + msgid).attr('data-val');
    var remove_both_side = $(e).hasClass('btn-msg-del-all');
    var dataActivityid = $('.side_bar_list_item li.activeTodo').attr('data-activityid');
    // console.log(dataActivityid);
    $.ajax({
        url: '/hayven/commit_msg_delete_for_Todo',
        type: 'POST',
        data: { uid: user_id, activity_id: dataActivityid, msgid: msgid, is_seen: is_seen, remove: remove_both_side },
        dataType: 'JSON',
        success: function (res) {
            // console.log(res);
            if (res.status) {

                if (remove_both_side) {
                    socket.emit("one_user_deleted_this", { msgid: msgid });
                }
                var h4data = $('.todo_msgid_' + msgid).find('.chating_para_2').html();
                var delhtml = '<p> <i><img src="/images/delete_msg.png" class="deleteicon"> You deleted this message. </i><span  class="silent_delete" onclick="removeThisLine(event,\''+msgid+'\')"> (Remove this line)</span></p>';
                $('.todo_msgid_' + msgid).find('.chating_para_2').html('<p>' + delhtml + '</p>');
                closeAllPopUp();
            }
        },
        error: function (err) {
            console.log(err.responseText);
        }
    });
};

function removeThisLine (event,msgid){
    var dataActivityid = $('#updateAction').val();
    console.log(dataActivityid);
    $.ajax({
        url: '/hayven/permanent_msg_delete_todo',
        type: 'POST',
        data: { uid: user_id, activity_id: dataActivityid, msgid: msgid, is_seen: 'permanent_delete', remove: true },
        dataType: 'JSON',
        success: function (res) {
            if (res.status) {
                socket.emit('removethisline', { msgid, user_id });
                $('.todo_msgid_'+msgid).remove();
                if($('#delete_msg_div').is(':visible'))
                    closeAllPopUp();
            }
        },
        error: function (err) {
            console.log(err.responseText);
        }
    });

    closeAllPopUp();
}
socket.on('removedline', function (data) {
    $('.todo_msgid_' + data.msgid).remove();
    $('.todo_msgid_' + data.msgid).find('.createNTFC').remove();
});

socket.on("delete_from_all", function (data) {
    $('.todo_msgid_' + data.msgid).find('.chating_para_2').html("");
    $('.todo_msgid_' + data.msgid).find('.chating_para_2').html("<i><img src='/images/delete_msg.png' class='deleteicon'> This message deleted by sender</i><span  class='silent_delete' onclick='removeThisLine(event,\""+data.msgid+"\")'> (Remove this line)</span><br>");
});

var filter_unread = () => {
    $('.filterMainContainer').hide();
    $('#todosidecontainer').show();
    $('#todosidecontainer .backToChat').show();

    var click_1st_unread_thread = false;

    $.each($(".side_bar_list_item li"), function (k, per_li) {
        var has_unread = Number($(per_li).find(".unreadMsgCount").html());
        if (has_unread < 1) {
            $(per_li).hide();
        }
    });
    $.each($(".side_bar_list_item li:visible"), function (k, per_li) {
        var has_unread = Number($(per_li).find(".unreadMsgCount").html());
        if (has_unread > 0 && click_1st_unread_thread === false) {
            $(per_li).trigger("click");
            click_1st_unread_thread = true;
            return false;
        }
    });
};
/* End Filtaring */


function backToChat() {
    $("#todosidecontainer").hide();
    $('#connectAsideContainer').show();
    ur_replay2ur_msg();
    $(".com-t-l").show();
    $(".label_head_aside").show();
    $('#todosidecontainer .backToChat').hide();
}

var ur_replay2ur_msg = () => {
    $.each($(".side_bar_list_item li"), function (k, per_li) {
        var nom = Number($(per_li).attr('data-nom')) > 0 ? Number($(per_li).attr('data-nom')) : "";
        $(per_li).find('.unreadMsgCount').html(nom);
    });
};


///keyboard up arrow key and down arrow key
var suggestedActiveLi = function () {
    var activeLI;
    var ind = $('.inputGroup2 .suggested-list li.showEl').each(function (i) {
        if ($(this).hasClass('selected'))
            activeLI = i;
    })
    return activeLI;
}
var viewMemberListActiveLi = function () {
    var activeLI;
    var ind = $('.memberList .showEl').each(function (i) {
        if ($(this).hasClass('selected'))
            activeLI = i;
    })
    return activeLI;
}
var sidebarListActiveLi = function () {
    var activeLI;
    var ind = $('.side_bar_list_item li').each(function (i) {
        if ($(this).hasClass('selected'))
            activeLI = i;
    })
    return activeLI;
}
var sidebarCompActiveLi = function () {
    var activeLI;
    var ind = $('#completedUl li').each(function (i) {
        if ($(this).hasClass('selected'))
            activeLI = i;
    })
    return activeLI;
}



var arrowUpArrowDownKey = () => {
    /// ArrowUp value = 38
    /// ArrowDown value = 40
    $(document).keydown(function (e) {
        $('.memberList .list').removeClass('default');
        $('.memberList .showEl').removeClass('default');
        if (e.keyCode == 38) {
            e.preventDefault();
            if ($('.backwrap').is(':visible') == false) {
                if ($('.suggested-type-list').is(':visible') == true) {
                    var activeIndexLI = suggestedActiveLi();
                    var newIndexLi = activeIndexLI - 1;
                    var nextLi = $('.inputGroup2 .suggested-list li.showEl:eq(' + newIndexLi + ')');
                    var totalLi = $('.inputGroup2 .suggested-list li.showEl').length;
                    if (totalLi > newIndexLi) {
                        if (newIndexLi == -1) {
                            $('.suggested-type-list .os-viewport').animate({ scrollTop: 72 * totalLi }, 1);
                        } else {
                            if (totalLi > newIndexLi) {
                                newIndexLi -= 3;
                                $('.suggested-type-list .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
                            }
                        }
                    }
                    $('.inputGroup2 .suggested-list li.showEl').removeClass('selected');
                    if (nextLi.length) {
                        nextLi.addClass('selected');
                    }
                    //} else if(!$('#completedSidecontainer').is(':visible') && $('#todoTitle').is(':focus') == false && $('.todo-calender.hasDatepicker').is(':visible') == false && $('#addTodoCheckList').is(':focus') == false && $('.notes_area').is(':focus') == false && $('.checkName').is(':focus') == false && $('#chatbox').is(':focus') == false && $('#createConvTag').is(':focus') == false) {
                } else if (!$('#completedSidecontainer').is(':visible') && !$('#todoTitle').is(':focus') && !$('.todo-calender.hasDatepicker').is(':visible') && inputValueCountFun('addTodoCheckList', 'id') == false && inputValueCountFun('search_members', 'id') == false && inputValueCountFun('sideBarSearch', 'id') == false && !$('.notes_area').is(':focus') && !$('.checkName').is(':focus') && inputValueCountFun('chatbox', 'conte') == false && inputValueCountFun('createConvTag', 'id') == false && inputValueCountFun('todo_chat_search_input', 'id') == false && !$('#ChatFileUpload').is(':visible')) {
                    var activeIndexLI = sidebarListActiveLi();
                    var newIndexLi = activeIndexLI - 1;
                    var nextLi = $('.side_bar_list_item li:eq(' + newIndexLi + ')');
                    var sideBarHeight = $('#hayvenSidebar').height();
                    var sidebarLiCount = (sideBarHeight - 296) / 29;
                    var totalLi = $('.side_bar_list_item li').length;
                    if (totalLi > newIndexLi) {

                        if (newIndexLi == -1) {
                            $('.side-bar .os-viewport').animate({ scrollTop: 29 * totalLi }, 1);
                        } else {
                            if (totalLi > sidebarLiCount) {
                                sidebarLiCount -= 4;
                                $('.side-bar .os-viewport').animate({ scrollTop: 29 * newIndexLi }, 1);
                            }
                        }
                    }
                    $('.side_bar_list_item li').removeClass('selected');

                    if (nextLi.length) {
                        nextLi.addClass('selected');
                        // nextLi.click();
                    }
                    else {
                        $('.side_bar_list_item li:first').addClass('selected');
                        // $('.side_bar_list_item li:first').click();
                    }
                } else if (!$('#completedSidecontainer').is(':visible') && !$('#todoTitle').is(':focus') && !$('.todo-calender.hasDatepicker').is(':visible') && inputValueCountFun('addTodoCheckList', 'id') == false && inputValueCountFun('search_members', 'id') == false && inputValueCountFun('sideBarSearch', 'id') == false && !$('.notes_area').is(':focus') && !$('.checkName').is(':focus') && inputValueCountFun('chatbox', 'conte') == false && inputValueCountFun('createConvTag', 'id') == false && inputValueCountFun('todo_chat_search_input', 'id') == false && !$('#ChatFileUpload').is(':visible')) {
                    var activeIndexLI = sidebarCompActiveLi();
                    var newIndexLi = activeIndexLI - 1;
                    var nextLi = $('#completedSidecontainer li:eq(' + newIndexLi + ')');

                    $('.side_bar_list_item li').removeClass('selected');

                    if (nextLi.length) {
                        nextLi.addClass('selected');
                        // nextLi.click();
                    }
                    else {
                        $('#completedSidecontainer li:first').addClass('selected');
                        // $('.side_bar_list_item li:first').click();
                    }
                }
            }
            if ($('#memberListBackWrap').is(':visible') == true) {
                var activeIndexLI = viewMemberListActiveLi();
                var newIndexLi = activeIndexLI - 1;
                var nextLi = $('.memberList .list.showEl:eq(' + newIndexLi + ')');
                var totalLi = $('.memberList .list.showEl').length;
                if (totalLi > newIndexLi) {

                    if (newIndexLi == -1) {
                        $('.forScrollBar .os-viewport').animate({ scrollTop: 72 * totalLi }, 1);
                    } else {
                        if (totalLi > newIndexLi) {
                            newIndexLi -= 4;
                            $('.forScrollBar .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
                        }
                    }
                }

                $('.memberList .list.showEl').removeClass('selected');

                if (nextLi.length) {
                    nextLi.addClass('selected');
                }
                else {
                    $('.memberList .list.showEl:first').addClass('selected');
                    $('.forScrollBar .os-viewport').animate({ scrollTop: 0 }, 1);
                }
            }
        }

        if (e.keyCode == 40) {
            e.preventDefault();
            if ($('.backwrap').is(':visible') == false) {
                if ($('.suggested-type-list').is(':visible') == true) {
                    var activeIndexLI = suggestedActiveLi();
                    var newIndexLi = activeIndexLI + 1;
                    var nextLi = $('.inputGroup2 .suggested-list li.showEl:eq(' + newIndexLi + ')');
                    if (newIndexLi > 3) {
                        newIndexLi -= 3
                        $('.suggested-type-list .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
                    }

                    $('.inputGroup2 .suggested-list li.showEl').removeClass('selected');

                    if (nextLi.length) {
                        nextLi.addClass('selected');
                    }
                    else {
                        $('.inputGroup2 .suggested-list li.showEl:first').addClass('selected');
                        $('.suggested-type-list .os-viewport').animate({ scrollTop: 0 }, 1);
                    }
                } else if (!$('#completedSidecontainer').is(':visible') && !$('#todoTitle').is(':focus') && !$('.todo-calender.hasDatepicker').is(':visible') && inputValueCountFun('addTodoCheckList', 'id') == false && inputValueCountFun('search_members', 'id') == false && inputValueCountFun('sideBarSearch', 'id') == false && !$('.notes_area').is(':focus') && !$('.checkName').is(':focus') && inputValueCountFun('chatbox', 'conte') == false && inputValueCountFun('createConvTag', 'id') == false && inputValueCountFun('todo_chat_search_input', 'id') == false && !$('#ChatFileUpload').is(':visible')) {
                    var activeIndexLI = sidebarListActiveLi();
                    var newIndexLi = activeIndexLI + 1;
                    var nextLi = $('.side_bar_list_item li:eq(' + newIndexLi + ')');
                    var sideBarHeight = $('#hayvenSidebar').height();
                    var sidebarLiCount = (sideBarHeight - 500) / 29;
                    if (newIndexLi > sidebarLiCount) {
                        newIndexLi -= sidebarLiCount
                        $('.side-bar .os-viewport').animate({ scrollTop: 29 * newIndexLi }, 1);
                    }
                    $('.side_bar_list_item li').removeClass('selected');
                    if (nextLi.length) {
                        // nextLi.click();
                        nextLi.addClass('selected');
                    }
                    else {
                        $('.side_bar_list_item li:first').addClass('selected');
                        $('.side-bar .os-viewport').animate({ scrollTop: 0 }, 1);
                    }
                } else if (!$('#completedSidecontainer').is(':visible') && !$('#todoTitle').is(':focus') && !$('.todo-calender.hasDatepicker').is(':visible') && inputValueCountFun('addTodoCheckList', 'id') == false && inputValueCountFun('search_members', 'id') == false && inputValueCountFun('sideBarSearch', 'id') == false && !$('.notes_area').is(':focus') && !$('.checkName').is(':focus') && inputValueCountFun('chatbox', 'conte') == false && inputValueCountFun('createConvTag', 'id') == false && inputValueCountFun('todo_chat_search_input', 'id') == false && !$('#ChatFileUpload').is(':visible')) {
                    var activeIndexLI = sidebarCompActiveLi();
                    var newIndexLi = activeIndexLI + 1;
                    var nextLi = $('#completedSidecontainer li:eq(' + newIndexLi + ')');

                    $('.side_bar_list_item li').removeClass('selected');
                    if (nextLi.length) {
                        // nextLi.click();
                        nextLi.addClass('selected');
                    }
                    else {
                        $('#completedSidecontainer li:first').addClass('selected');
                    }
                }
            }
            if ($('#memberListBackWrap').is(':visible') == true) {
                var activeIndexLI = viewMemberListActiveLi();
                var newIndexLi = activeIndexLI + 1;
                var nextLi = $('.memberList .list.showEl:eq(' + newIndexLi + ')');
                if (newIndexLi > 4) {
                    newIndexLi -= 4
                    $('.forScrollBar .os-viewport').animate({ scrollTop: 64 * newIndexLi }, 1);
                }

                $('.memberList .list.showEl').removeClass('selected');

                if (nextLi.length) {
                    nextLi.addClass('selected');
                }
                else {
                    $('.memberList .list.showEl:first').addClass('selected');
                    $('.forScrollBar .os-viewport').animate({ scrollTop: 0 }, 1);
                }
            }
        }

        if (e.keyCode == 13) {
            if ($('.backwrap').is(':visible') == false) {
                if ($('.inputGroup2 .suggested-list').is(':visible') == true) {
                    $('.inputGroup2 .suggested-list li.selected').click()
                } else {
                    if (!$('#completedSidecontainer').is(':visible') && !$('#todoTitle').is(':focus') && !$('.todo-calender.hasDatepicker').is(':visible') && inputValueCountFun('addTodoCheckList', 'id') == false && inputValueCountFun('search_members', 'id') == false && inputValueCountFun('sideBarSearch', 'id') == false && !$('.notes_area').is(':focus') && !$('.checkName').is(':focus') && inputValueCountFun('chatbox', 'conte') == false && inputValueCountFun('createConvTag', 'id') == false && inputValueCountFun('todo_chat_search_input', 'id') == false && !$('#ChatFileUpload').is(':visible')) {
                        $('.side_bar_list_item li.selected').click();
                    }
                }
                if ($('.checkName').is(':focus') == true) {
                    e.preventDefault();
                    $('.checkName').blur();
                    $('.checkName').attr('contenteditable', 'auto');
                }
            }

            if ($('#memberListBackWrap').is(':visible') == true) {
                $('.memberList .list.selected').click();
                $('.memberList .list.showEl').removeClass('selected');
                $('.memberList .list.showEl:first').addClass('selected');
                $('.forScrollBar .os-viewport').animate({ scrollTop: 0 }, 1);
            }

        }
    });
}

arrowUpArrowDownKey();


function filter_completed() {
    if (!$('#completedFilter').hasClass('activeComFilter')) {
        $('#completedFilter').addClass('activeComFilter')
        socket.emit('getCompletedTodo', {
            user_id: user_id
        }, (response) => {
            if (response.res.status) {
                if (response.res.activities.length > 0) {
                    $(".activitySideBar").hide();

                    $("#completedSidecontainer").remove();

                    var html = '<div class="sideContainer" id="completedSidecontainer"><div class="tagg_list" style="display: none;"></div><span class="errMsg" style="display: none;"></span><div class="label_head_aside"><h3>Completed</h3><span class="add-items-icon acceptCheck"></span></div><ul class="side_bar_list_item" id="completedUl">';
                    $.each(response.res.activities, function (k, v) {
                        html += '<li id="activity_' + v.activity_id + '" data-activityid="' + v.activity_id + '" data-urm=0 class="com-t-l todoLink" onclick="startToDo(event)">';
                        html += '<span class="toDo"></span>';
                        html += '<span class="toDoName">' + v.activity_title + '</span>';
                        html += '<span class="unreadMsgCount"></span>';
                        html += '<span class="remove" onclick="hideThisTodo(event)"></span>';
                        html += '</li>';
                    });
                    html += '</ul></div>';
                    $("#hayvenSidebar .os-content").append(html);
                    $('#completedSidecontainer li:first').click();
                    $('#completedSidecontainer li:first').addClass('activeTodo');

                    if (!$("#c_com_ed").is(':visible')) {
                        var design = '<div class="tag_item" id="c_com_ed"><span class="acceptCheck flagged"></span><p class="tagP">Completed</p><img onclick="removeCompletedFilter(\'c_com_ed\')" class="tagIMG" src="/images/basicAssets/Close.svg"></div>';

                        $('.sideContainer  .tagg_list').append(design);
                    }

                    if ($(".sideContainer .tag_item").length > 0) {
                        $('.sideContainer  .tagg_list').show();
                    }

                } else {

                    $(".activitySideBar").hide();

                    $("#completedSidecontainer").remove();

                    var html = '<div class="sideContainer" id="completedSidecontainer"><div class="tagg_list" style="display: none;"></div><span class="errMsg" style="display: none;"></span><div class="label_head_aside" style="margin-top: 25px;"><h3>Completed</h3><span class="add-items-icon acceptCheck"></span></div></div>';
                    $("#hayvenSidebar .os-content").append(html);

                    if (!$("#c_com_ed").is(':visible')) {
                        var design = '<div class="tag_item" id="c_com_ed"><span class="acceptCheck flagged"></span><p class="tagP">Completed</p><img onclick="removeCompletedFilter(\'c_com_ed\')" class="tagIMG" src="/images/basicAssets/Close.svg"></div>';

                        $('.sideContainer  .tagg_list').append(design);
                    }

                    if ($(".sideContainer .tag_item").length > 0) {
                        $('.sideContainer  .tagg_list').show();

                        $('.sideContainer  .errMsg').text('No result found');
                        $('.sideContainer  .errMsg').show();
                    }

                }
            }
        });
    } else {
        removeCompletedFilter();
    }

}

function removeCompletedFilter() {
    $('#completedFilter').removeClass('activeComFilter')
    if (getCookie('lastActive') != "") {
        $('.side_bar_list_item li').removeClass('activeTodo selected');
        $("#activity_" + getCookie('lastActive')).trigger('click');
        $("#activity_" + getCookie('lastActive')).addClass('activeTodo selected');
    } else {
        $('.side_bar_list_item li').removeClass('activeTodo selected');
        $("ul#unpinTodoList li").first().click();
        $("ul#unpinTodoList li").first().addClass('activeTodo selected');
    }
    $("#completedSidecontainer").remove();
    $("#c_com_ed").remove();

    $(".activitySideBar").show();
    $("#pinnedToDoList li").hide();
    $("#overdueULlist li").hide();
    $("#unpinTodoList li").hide();

    $('.sideContainer  .errMsg').text('');
    $('.sideContainer  .errMsg').hide();

    $('.side_bar_list_item li').each(function (k, v) {
        $(v).show();
    });

    $('.side_bar_list_item>li').unhighlight();
}

$("#amazonWishlist").click(function (e) {
    if ($("#actCre").val() === user_id) {
        if (e.target.checked) {
            if ($('.country-label').length > 0) {
                $(".delete_msg_sec_title").text("Are you sure you want to COMPLETE the following Todo ?");
                $("#completed_activity_div").show();
                // $("#checkedYes").show();
                // $("#checkedNo").show();
                // $("#checkedOk").hide();
            } else {
                $(".delete_msg_sec_title").text("Are you sure you want to COMPLETE the following Todo ?");
                $("#completed_activity_div").show();
                // $("#checkedYes").hide();
                // $("#checkedNo").hide();
                // $("#checkedOk").show();
            }
        } else {
            if ($('.country-label').length > 0) {
                $(".delete_msg_sec_title").text("Are you sure you want to REOPEN the following Todo ?");
                $("#reopen_activity_div").show();
                // $("#reopenCheckedYes").show();
                // $("#reopenCheckedNo").show();
                // $("#reopenCheckedOk").hide();
            } else {
                $(".delete_msg_sec_title").text("Are you sure you want to REOPEN the following Todo ?");
                $("#reopen_activity_div").show();
                // $("#reopenCheckedYes").hide();
                // $("#reopenCheckedNo").hide();
                // $("#reopenCheckedOk").show();
            }

        }
    }

});


function checkedYes() {
    var acid = $('#chat_icon').attr('data-activity_id');
    socket.emit('toodoUpdate', {
        targetID: acid,
        type: 'completed',
        contain: 0,
        clusteringkey: $('#activityCreatedAt').val()
    },
        function (confirmation) {
            toastr['success']('TODO has been completed successfully', 'TODO Complete');
            $("#completed_activity_div").hide();
            $("#activity_" + acid).remove();
            $("ul#unpinTodoList li").first().click();
        });
}

function checkedNo() {
    var acid = $('#chat_icon').attr('data-activity_id');
    socket.emit('toodoUpdate', {
        targetID: acid,
        type: 'completed',
        contain: -1,
        clusteringkey: $('#activityCreatedAt').val()
    },
        function (confirmation) {
            toastr['success']('TODO has been completed successfully', 'TODO Complete');
            $("#completed_activity_div").hide();
            $("#activity_" + acid).remove();
            $("ul#unpinTodoList li").first().click();
        });
}

function checkedOk() {
    var acid = $('#chat_icon').attr('data-activity_id');
    socket.emit('toodoUpdate', {
        targetID: acid,
        type: 'completed',
        contain: 0,
        clusteringkey: $('#activityCreatedAt').val()
    }, function (confirmation) {
        toastr['success']('TODO has been completed successfully', 'TODO Complete');
        $("#completed_activity_div").hide();
        $("#activity_" + acid).remove();
        $("ul#unpinTodoList li").first().click();
    });
}

function reopenCheckedYes() {
    var acid = $('#chat_icon').attr('data-activity_id');
    socket.emit('toodoUpdate', {
        targetID: acid,
        type: 'incomplete',
        contain: 1,
        clusteringkey: $('#activityCreatedAt').val()
    },
        function (confirmation) {
            toastr['success']('TODO has been reopened successfully', 'TODO Reopen');
            $("#reopen_activity_div").hide();
            $("#activity_" + acid).remove();
            var comli = $('ul#completedUl > li:visible').length;
            if (comli === 0) {
                removeCompletedFilter('c_com_ed');
            } else {
                $("ul#completedUl li").first().click();
            }
        });
}

function reopenCheckedNo() {
    var acid = $('#chat_icon').attr('data-activity_id');
    socket.emit('toodoUpdate', {
        targetID: acid,
        type: 'incomplete',
        contain: -1,
        clusteringkey: $('#activityCreatedAt').val()
    },
        function (confirmation) {
            toastr['success']('TODO has been reopened successfully', 'TODO Reopen');
            $("#reopen_activity_div").hide();
            $("#activity_" + acid).remove();
            $("ul#completedUl li").first().click();
        });
}

function reopenCheckedOk() {
    var acid = $('#chat_icon').attr('data-activity_id');
    socket.emit('toodoUpdate', {
        targetID: acid,
        type: 'incomplete',
        contain: 1,
        clusteringkey: $('#activityCreatedAt').val()
    },
        function (confirmation) {
            toastr['success']('TODO has been reopened successfully', 'TODO Reopen');
            $("#reopen_activity_div").hide();
            $("#activity_" + acid).remove();
            $("ul#completedUl li").first().click();
        });
}

var thisCheckEdit = '';
var todoCheckid = ''
///edit checklist

var editThisCheckList = (event) => {
    $(event.target).parent('li').find('.checkName').css({ 'text-overflow': 'unset' });
    var data_chid = $(event.target).attr('data-chid');
    $(event.target).parent('li').find('.checkName').attr('contenteditable', 'true');
    $(event.target).parent('li').find('.checkName').attr('id', 'thisCheckId' + data_chid + '');
    todoCheckid = $(event.target).parent('li').find('.checkName').attr('id');
    $('#' + todoCheckid).focus();
    placeCaretAtEnd(document.getElementById(todoCheckid));

    var value = $(event.target).parent('li').find('.checkName').text();
    thisCheckEdit = value;
};

var editToDoCheckName = (event, chid) => {
    if (event.keyCode == 13) {
        if ($(event.target).text().length !== 0) {
            if ($("#updateAction").val() == 0) {
                checklistiTEM[$(event.target).attr('data-indexof')] = $(event.target).text();
                $(event.target).css({
                    'text-overflow': 'ellipsis'
                });
            } else {
                var clusteringkey = $('#chat_icon').attr('data-activity_id');
                socket.emit('toodoUpdate', {
                    targetID: chid,
                    type: 'checkitem',
                    contain: $(event.target).text(),
                    clusteringkey: clusteringkey
                },
                    function (confirmation) {
                        // console.log(confirmation.msg);
                        $(event.target).css({
                            'text-overflow': 'ellipsis'
                        });
                    });
            }
        } else {
            toastr['warning']('Please contact with todo creator', 'Warning');
        }
    }
}

var editCheckListOnBlur = (event, chid) => {
    if ($(event.target).text().length !== 0) {
        if ($("#updateAction").val() == 0) {
            checklistiTEM[$(event.target).attr('data-indexof')] = $(event.target).text();
            $(event.target).css({
                'text-overflow': 'ellipsis'
            });
        } else {
            var clusteringkey = $('#chat_icon').attr('data-activity_id');
            socket.emit('toodoUpdate', {
                targetID: chid,
                type: 'checkitem',
                contain: $(event.target).text(),
                clusteringkey: clusteringkey
            },
                function (confirmation) {
                    // console.log(confirmation.msg);
                    $(event.target).css({
                        'text-overflow': 'ellipsis'
                    });
                });
        }
    } else {
        toastr['warning']('Please contact with todo creator', 'Warning');
    }
}

var mytodolist = [];
var removeUsertag = (event) => {

    var roomid = $('#chat_icon').attr('data-activity_id');

    $('.side_bar_list_item li').each(function (k, v) {
        if (mytodolist.indexOf($(v).attr('data-activityid')) === -1) {
            mytodolist.push($(v).attr('data-activityid'));
        }
    });

    socket.emit('getAllTagsforList', {
        myconversation_list: mytodolist
    }, (callBack) => {

        // console.log(callBack);

        if (callBack.status) {
            var my_tagged_ids = callBack.data;
            $('#memberListBackWrap').show();
            $('#memberListBackWrap').html("");

            var html = '<div class="adminContainer">';
            html += '	<div class="closeBackwrap" onclick="closeAllPopUp()" data-balloon="Press Esc to close" data-balloon-pos="up"><img src="/images/basicAssets/close_button.svg"></div>';
            html += '	<div class="label">';
            html += '		<h1 class="label_Title">Tag(s) </h1>';
            html += '	</div>';
            html += '	<input type="text" class="searchMember" placeholder="Search by title" onkeyup="searchtags($(this).val());">';
            html += '	<span class="remove searchClear"></span>';
            html += '	<div class="suggest_Container overlayScrollbars" style="display: block;">';
            html += '		<ul class="suggested-list tagslistFloting">';

            $.each(my_tag_list, function (ky, va) {
                if (my_tagged_ids.indexOf(ky) !== -1) {
                    html += '		<li id="t_' + ky + '">';
                    html += '			<div class="list" id="member' + ky + '">';
                    html += '				<h1 class="memberName">' + va + '</h1>';
                    html += '				<span class="tagcheck"></span>';
                    html += '			</div>';
                    html += '		</li>';
                }
            });

            $.each(my_tag_list, function (ky, va) {
                if (my_tagged_ids.indexOf(ky) === -1) {
                    html += '		<li id="t_' + ky + '">';
                    html += '			<div class="list" id="member' + ky + '">';
                    html += '				<h1 class="memberName">' + va + '</h1>';
                    html += '				<span class="remove" onclick="removeTagsUnused(\'' + ky + '\',\'' + va + '\');"></span>';
                    html += '			</div>';
                    html += '		</li>';
                }
            });

            html += '		</ul>';
            html += '	</div>';
            html += '</div>';

            overlayScrollbars();
            $('#memberListBackWrap').append(html);
            $('.remove.searchClear').on('click', function () {
                $('.searchMember').val('');
                $('.adminContainer li').show();
                $('.adminContainer li').addClass('showEl');
                $('.adminContainer li.showEl').removeClass('selected');
                $('.adminContainer li.showEl:first').addClass('selected');
                $(this).hide();
            });
        }
    });
}

var removeTagsUnused = (id, title) => {

    socket.emit('deleteUnusedTag', {
        tagid: id
    }, (callBack) => {
        if (callBack.status) {
            $("#t_" + id).remove();
            var indx = '';

            $.each(tagLsitDetail, function (tdk, tdv) {
                if (id == tdv.tagid && title == tdv.tagTitle) {
                    indx = tdk;
                }
            });

            removeA(tagListForFileAttach, title);
            removeA(tagListTitle, title);
            removeA(alltags, title);
            removeA(my_tag_list, title);
            removeA(my_tag_id, id);

            tagLsitDetail.splice(indx, 1);

            $("#taggedList li").each(function () {
                if ($(this).text() == title) {
                    $(this).remove();
                }
            });
        }
    });
}

var searchtags = (thisval) => {

    $(".tagslistFloting li .memberName").each(function () {

        if ($(this).text().toLowerCase().search(thisval.toLowerCase()) > -1) {
            $(this).closest('li').show();
        } else {
            $(this).closest('li').hide();
        }
    });

    $('.tagslistFloting li .memberName').unhighlight();
    $('.tagslistFloting li .memberName').highlight(thisval);
}


function suggestedUserList() {
    var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
    if($('#actCre').val() == user_id){
       $.each(user_list, function (ky, va) {
            if (va.id !== user_id) {
                if (sharedMemberList.indexOf(va.id) == -1) {
                    var imSrc = va.img;
                    var dataID = va.id;
                    var definedList = '<li onclick="shareThisMember(\'' + dataID + '\',\'' + imSrc + '\')" id="toDoMember' + dataID + '" class="showEl">';
                    definedList += '      <img src="/images/users/' + va.img + '" class="profile">';
                    definedList += '      <spna class="name s-l-def-clas" data-uuid="' + va.id + '">' + va.fullname + '</spna> <spna class="designation-name">@ Navigate</spna>';
                    definedList += '    </li>';
                    $('.suggested-list').append(definedList);
                    $('.suggested-list li.showEl:first').addClass("selected default");
                }
            }

        }); 
   }else{
        $.each(user_list, function (ky, va) {
            if (sharedMemberList.indexOf(va.id) !== -1) {
                if(va.id == $('#actCre').val()){
                    var imSrc = va.img;
                    var dataID = va.id;
                    var definedList = '<li id="toDoMember' + dataID + '" class="showEl">';
                    definedList += '      <img src="/images/users/' + va.img + '" class="profile">';
                    definedList += '      <spna class="name s-l-def-clas" data-uuid="' + va.id + '">' + va.fullname + '</spna> <spna class="designation-name">@ Navigate</spna>';
                    definedList += '        <span class="creator" style="line-height:10px; margin-top:18px;">Owner</span>';
                    definedList += '    </li>';
                    $('.suggested-list').append(definedList);
                    $('.suggested-list li.showEl:first').addClass("selected default");
                }
            }
        });
        $.each(user_list, function (ky, va) {
            if (sharedMemberList.indexOf(va.id) !== -1) {
                if(va.id !== $('#actCre').val()){
                    var imSrc = va.img;
                    var dataID = va.id;
                    var definedList = '<li id="toDoMember' + dataID + '" class="showEl">';
                    definedList += '      <img src="/images/users/' + va.img + '" class="profile">';
                    definedList += '      <spna class="name s-l-def-clas" data-uuid="' + va.id + '">' + va.fullname + '</spna> <spna class="designation-name">@ Navigate</spna>';
                    definedList += '    <span class="tagcheck forActive" style="margin-top: 20px;"></span>';
                    definedList += '    </li>';
                    $('.suggested-list').append(definedList);
                    $('.suggested-list li.showEl:first').addClass("selected default");
                }
            }
        });
   }
    
}

$('#search_members').on('click', function () {
    var value = $(this).val();
    if (value == 0) {
        $('.suggested-type-list').show();
        $(".inputGroup2 .suggested-list li.showEl").removeClass('selected');
        $(".inputGroup2 .suggested-list li.showEl:first").addClass('selected default');
        $('.suggested-type-list .os-viewport').animate({ scrollTop: 0 }, 1);
    }
    $('.suggested-list').html("");
    suggestedUserList();
    popupMouseEnter();
});


// notify all members whoes are 
// eligible for todo Start 
// and End reminder

// socket.on('activityReminder', function (response) {
//     console.log(response);
//     toastr.options.closeButton = true;
//     toastr.options.timeOut = 0;
//     toastr.options.extendedTimeOut = 0;
//     toastr["warning"]("\"" + toDoName + "\" start after " + minToHour(v.minDiff), "Warning");
// });

//
socket.on('remove_on_fly', function (response) {

    if (response.status == '200') {
        if ($("#tdCLI" + response.message.checklist_id).is(':visible')) {
            var title = $("#tdCLI" + response.message.checklist_id + " .checkName").text();
            var createdby = $("#tdCLI" + response.message.checklist_id).attr('data-createdby');
            removeA(checklistiTEM, title);
            $("#tdCLI" + response.message.checklist_id).remove();

            countBoxes()
            isChecked();

            toastr.options.closeButton = true;
            toastr.options.timeOut = 2000;
            toastr.options.extendedTimeOut = 1000;
            toastr["success"](createdby + " has deleted" + " \"" + title + "\"  from quicklist", "Success");
        } else {
            var todoName = $("#activity_" + response.message.clusteringkey + " .toDoName").text();

            toastr.options.closeButton = true;
            toastr.options.timeOut = 2000;
            toastr.options.extendedTimeOut = 1000;
            toastr["success"]("Quick list item has deleted from " + " \"" + todoName + "\"  Task", "Success");
        }

    }
});

//

socket.on('new_checklist', function (response) {
    if (response.status == '200') {
        $.each(response.res.checklistids, function (k, v) {

            var checkListHtml = '<li class="todoChelistLI" id="tdCLI' + v + '"   data-createdby="' + userlistWithname[response.message.createdBy] + '" data-balloon="Ceated by ' + userlistWithname[response.message.createdBy] + '" data-balloon-pos="right">';
            // if ($("#updateAction").val() !== 0 && v.message.createdBy === user_id) {
            //     checkListHtml += '  <span class="remove" data-chtitle="' + val.checklist_title + '" data-chid="' + val.checklist_id + '" onclick="removeThisCheckList(event)"></span>';
            //     checkListHtml += '  <span class="edit" data-chtitle="' + val.checklist_title + '" data-chid="' + val.checklist_id + '" onclick="editThisCheckList(event)"></span>';
            // }

            checkListHtml += '  <label class="country-label"> ';
            checkListHtml += '  <span class="checkName" onblur="editCheckListOnBlur(event,\'' + v + '\')" onkeydown="editToDoCheckName(event,\'' + v + '\')">' + response.message.checklist[k] + '</span>';
            checkListHtml += '      <input class="todoCheckBoxInput" type ="checkbox" value="' + v + '" id="' + v + '">';
            // if (val.checklist_status == 0) {
            //     checkListHtml += '      <input class="todoCheckBoxInput" type ="checkbox" value="' + val.checklist_id + '" id="' + val.checklist_id + '">';
            // } else {
            //     checkListHtml += '      <input class="todoCheckBoxInput" type ="checkbox" value="' + val.checklist_id + '" checked id="' + val.checklist_id + '">';
            // }

            checkListHtml += '      <span class="checkmark"></span>';
            checkListHtml += '  </label>';
            checkListHtml += '</li>';

            $(".new-added-check-list").append(checkListHtml);
        });
    }

});

//broadcast activity on activity create

socket.on('CreateActivityBrdcst', function (response) {
    if (response.status == '200') {
        if (response.message.createdBy != user_id) {
            if (response.message.adminListUUID.indexOf(user_id) > -1) {
                getThisActivitydetail(response.result.activity_id.toString())
                    .then((result) => {

                        toastr.options.closeButton = true;
                        toastr.options.timeOut = 0;
                        toastr.options.extendedTimeOut = 0;
                        toastr.options.showEasing = 'easeOutBounce';
                        toastr.options.hideEasing = 'easeInBack';
                        toastr.options.closeEasing = 'easeInBack';

                        var myString = response.userMsdlist[user_id];

                        toastr["info"]('<div>You are assigned to a new todo "' + result.activity_title + '"</div><div><button type="button" class="btn btn-accept" onclick="acceptActivty(\'' + myString.substr(0, myString.length - 0) + '\',\'' + result.activity_id.toString() + '\',\'' + result.activity_title + '\',\'' + user_id + '\',\'' + result.activity_created_at + '\')">Accept</button><button type="button" class="btn btn-decline" onclick= declineActivity(\'' + myString.substr(0, myString.length - 0) + '\',\'' + result.activity_id.toString() + '\',\'' + result.activity_created_at + '\',\'' + user_id + '\')>Decline</button></div>', "Hello " + user_fullname + " !!!");

                    }).catch((err) => {
                        console.log(err);
                    });
            }
        }
    }
});

socket.on('update_activity_on_fly', function (response) {
    if (response.status == '200') {
        if (response.data.type != user_id) {
            switch (response.data.type) {
                case 'delete_to_do':
                    deleteTodo_onfly(response.data.targetID);
                    break;
                case 'title':
                    titleUpdate_onfly(response);
                    break;
                case 'checklistchecked':
                    checklistchecked_onfly(response);
                    break;
                case 'checklistunchecked':
                    checklistunchecked_onfly(response);
                    break;
                case 'checkitem':
                    checklistEdit_onfly(response);
                    break;
                case 'noteUp':
                    noteUpdate_onfly(response);
                    break;
                case 'duedate':
                    duedateUpdate_onfly(response);
                    break;
                case 'addmember':
                    addmember_onfly(response);
                    break;
                case 'removemember':
                    removemember_onfly(response);
                    break;
                case 'completed':
                    wishList_com_onfly(response);
                    break;
                case 'incomplete':
                    wishList_incom_onfly(response);
                    break;
                default:
                    break;
            }
        }
    }
});

function wishList_com_onfly(data) {
    if (data.data.type == 'completed') {
        if ($("#activity_" + data.data.targetID).is(':visible')) {
            $("#activity_" + data.data.targetID).remove();
            if ($("#updateAction").val() === data.data.targetID) {
                $('.side_bar_list_item li:first').click();
                $('.side_bar_list_item li:first').addClass('activeTodo selected');
            }
        }
    }
}

function wishList_incom_onfly(data) {
    if (data.data.type == 'incomplete') {
        if ($("#activity_" + data.data.targetID).is(':visible')) {
            $("#activity_" + data.data.targetID).remove();
            if ($("#updateAction").val() === data.data.targetID) {
                $('.side_bar_list_item li:first').click();
                $('.side_bar_list_item li:first').addClass('activeTodo selected');
            }
        }
    }
}


function titleUpdate_onfly(data) {
    if (data.data.type == 'title') {
        if ($("#activity_" + data.data.targetID).is(':visible')) {
            $("#activity_" + data.data.targetID + " .toDoName").text(data.data.contain);
            if ($("#updateAction").val() === data.data.targetID) {
                $("#todoTitle").val(data.data.contain)
            }
        }
    }
}

function noteUpdate_onfly(data) {
    if (data.data.type == 'noteUp') {
        if ($("#activity_" + data.data.targetID).is(':visible')) {
            if ($("#updateAction").val() === data.data.targetID) {
                $("#notes_area").val(data.data.contain)
            }
        }
    }
}

function checklistEdit_onfly(data) {
    if (data.data.type == 'checkitem') {
        if ($("#tdCLI" + data.data.targetID).is(':visible')) {

            let checkItemTitle = $("#tdCLI" + data.data.targetID + " .checkName").text();
            toastr.options.closeButton = true;
            toastr.options.timeOut = 2000;
            toastr.options.extendedTimeOut = 1000;
            toastr["success"]("\"" + checkItemTitle + "\" Checklist Item update to \"" + data.data.contain + "\"", "Success");
            $("#tdCLI" + data.data.targetID + " .checkName").text(data.data.contain);
        }
    }
}

function checklistchecked_onfly(data) {
    if (data.data.type == 'checklistchecked') {
        if ($("#tdCLI" + data.data.targetID).is(':visible')) {
            let checkItemTitle = $("#tdCLI" + data.data.targetID + " .checkName").text();
            let createdby = $("#tdCLI" + data.data.targetID).attr('data-createdby');
            toastr.options.closeButton = true;
            toastr.options.timeOut = 2000;
            toastr.options.extendedTimeOut = 1000;
            toastr["success"]("\"" + checkItemTitle + "\" Checklist Item checked by \"" + userlistWithname[data.data.usrid] + "\"", "Success");
            $("#" + data.data.targetID).prop('checked', true);
            countBoxes();
            isChecked();
        }
    }
}

function checklistunchecked_onfly(data) {
    if (data.data.type == 'checklistunchecked') {
        if ($("#tdCLI" + data.data.targetID).is(':visible')) {
            let checkItemTitle = $("#tdCLI" + data.data.targetID + " .checkName").text();
            let createdby = $("#tdCLI" + data.data.targetID).attr('data-createdby');
            toastr.options.closeButton = true;
            toastr.options.timeOut = 2000;
            toastr.options.extendedTimeOut = 1000;
            toastr["success"]("\"" + checkItemTitle + "\" Checklist Item unchecked by \"" + userlistWithname[data.data.usrid] + "\"", "Success");
            $("#" + data.data.targetID).prop('checked', false);
            countBoxes();
            isChecked();
        }
    }
}

function duedateUpdate_onfly(data) {
    if (data.data.type == 'duedate') {
        if ($("#activity_" + data.data.targetID).is(':visible')) {
            if ($("#updateAction").val() === data.data.targetID) {
                $("#dueDatePicker").val(data.data.contain)
            }
        }
    }

}

function deleteTodo_onfly(activityID) {
    if ($("#activity_" + activityID).is(':visible')) {
        var todoName = $("#activity_" + activityID + " .toDoName").text();

        toastr.options.closeButton = true;
        toastr.options.timeOut = 2000;
        toastr.options.extendedTimeOut = 1000;
        toastr["success"]("\"" + todoName + "\" Todo has been deleted", "Success");

        $("#activity_" + activityID).remove();
        var numrelated = $('.side_bar_list_item > li:visible').length;
        if (numrelated == 0) {
            createNewTodo();
        } else {
            if ($("#updateAction").val() === activityID) {
                if (getCookie('lastActive') != "") {

                    $('.side_bar_list_item li').removeClass('activeTodo selected');
                    if ($("#activity_" + getCookie('lastActive')).is(':visible')) {
                        $("#activity_" + getCookie('lastActive')).trigger('click');
                        $("#activity_" + getCookie('lastActive')).addClass('activeTodo selected');
                    } else {
                        $('.side_bar_list_item li:first').click();
                        $('.side_bar_list_item li:first').addClass('activeTodo selected');
                    }
                } else {
                    // createNewTodo();
                    $('.side_bar_list_item li:first').click();
                    $('.side_bar_list_item li:first').addClass('activeTodo selected');
                }
            }
        }
    }
}

function removemember_onfly(data) {
    if (data.data.type == 'removemember') {

        if (data.data.contain === user_id) {

            if ($("#activity_" + data.data.targetID).is(':visible')) {

                var todoName = $("#activity_" + data.data.targetID + " .toDoName").text();

                toastr.options.closeButton = true;
                toastr.options.timeOut = 2000;
                toastr.options.extendedTimeOut = 1000;
                toastr["success"]("You are removed from \"" + todoName + "\" Todo", "Success");

                $("#activity_" + data.data.targetID).remove();

                if ($("#updateAction").val() === data.data.targetID) {
                    $('.side_bar_list_item li:first').click();
                    $('.side_bar_list_item li:first').addClass('activeTodo selected');
                }
            }
        } else {

            let uuID = data.data.contain;

            removeA(sharedMemberList, uuID);
            removeA(currentMemberList, uuID);

            if (viewMemberImg.indexOf(uuID) !== -1) {
                removeA(viewMemberImg, uuID);
                $('.memberImg' + uuID + '').remove();
                var newMember = '';
                $.each(sharedMemberList, function (k, v) {
                    if (viewMemberImg.indexOf(v) == -1) {
                        if (viewMemberImg.length < 4) {
                            viewMemberImg.push(v);
                            newMember = v;
                        }
                    }
                });
                var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
                $.each(user_list, function (ky, va) {
                    if (newMember == va.id && newMember !== $("#actCre").val()) {
                        $('#sharePeopleList .ownerThisToDo').after('<img onclick="viewShareList(event)" src="/images/users/' + va.img + '" data-uuid="' + va.id + '" class="sharedIMG memberImg' + va.id + '">');
                    }
                });
            }
            let imgsrc = $('#viewMember' + uuID).find('img').attr('src');
            let img = imgsrc.split('/');
            $('#viewMember' + uuID + '').remove();
            $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
            $('#sharePeopleList span').text('+' + (sharedMemberList.length - 4));


            if (sharedMemberList.length < 5) {
                $('#sharePeopleList span').hide();
            }

            var html = '<div class="list showEl" id="viewMember' + uuID + '" onclick="shareThisMember(\'' + uuID + '\',\'' + img[img.length - 1] + '\')">';
            html += '<img src="/images/users/' + img[img.length - 1] + '">';
            html += '<span class="online_' + uuID + ' ' + (onlineUserList.indexOf(uuID) === -1 ? "offline" : "online") + '"></span>';
            html += '<h1 class="memberName">' + userlistWithname[uuID] + '</h1>';
            html += '</div>';
            $('#memberListBackWrap .memberList').append(html);
            $('#memberListBackWrap .memberList .list.showEl').removeClass("selected");
            $('#memberListBackWrap .list_Count').text('(' + sharedMemberList.length + ')');
            popupMouseEnter();
        }
    }
}


function addmember_onfly(data) {
    if (data.data.type == 'addmember') {
        if (data.data.contain === user_id) {
            if (!$("#activity_" + data.data.targetID).is(':visible')) {
                getThisActivitydetail(data.data.targetID)
                    .then((result) => {

                        toastr.options.closeButton = true;
                        toastr.options.timeOut = 0;
                        toastr.options.extendedTimeOut = 0;
                        toastr.options.showEasing = 'easeOutBounce';
                        toastr.options.hideEasing = 'easeInBack';
                        toastr.options.closeEasing = 'easeInBack';

                        toastr["info"]('<div>You are assigned to a new todo "' + result.activity_title + '"</div><div><button type="button" class="btn btn-accept" onclick="acceptActivty(\'\',\'' + result.activity_id.toString() + '\',\'' + result.activity_title + '\',\'' + user_id + '\',\'' + result.activity_created_at + '\')">Accept</button><button type="button" class="btn btn-decline" onclick= declineActivity(\'\',\'' + result.activity_id.toString() + '\',\'' + result.activity_created_at + '\',\'' + user_id + '\')>Decline</button></div>', "Hello " + user_fullname + " !!!");

                    }).catch((err) => {
                        console.log(err);
                    });
            }
        } else {
            if ($("#activity_" + data.data.targetID).is(':visible')) {
                if ($("#updateAction").val() === data.data.targetID) {

                    if (currentMemberList.indexOf(data.data.contain) === -1) {
                        currentMemberList.push(data.data.contain);
                    }

                    var user_list = _.orderBy(allUserdata[0].users, ["fullname"], ["asc"]);
                    $.each(user_list, function (ky, va) {
                        if (currentMemberList.indexOf(data.data.contain) !== -1) {
                            if (sharedMemberList.indexOf(data.data.contain) == -1) {
                                sharedMemberList.push(data.data.contain);
                                $(".count_member").text('' + sharedMemberList.length + ' members');
                            }
                            if (currentMemberList.length < 4 && va.id == data.data.contain) {
                                $('#sharePeopleList .ownerThisToDo').after('<img onclick="viewShareList(event)" src="/images/users/' + va.img + '" data-uuid="' + data.data.contain + '" class="sharedIMG memberImg' + data.data.contain + '">');
                                viewMemberImg.push(data.data.contain);
                            }

                            if (currentMemberList.length > 3) {
                                $('#sharePeopleList span').show();
                                $('#sharePeopleList span').text('+' + (currentMemberList.length - 3));
                            }
                        }
                    });

                }
            }

        }
    }
}



function designForUsers (type){
    if(type == 'admin'){
        $('#dueDatePicker').css('background-color', '#ffffff');
        $('#selectWorkspace').css('background-color', '#ffffff');
        $('#notes_area').css('background-color', '#ffffff');
        $('#dueDatePicker').css('border', '1px solid #E1E4E8');
        $('#selectWorkspace').css('border', '1px solid #E1E4E8');
        $('#notes_area').css('border', '1px solid #E1E4E8');
    }else{
        $('#dueDatePicker').css('background-color', '#FAFAFA');
        $('#selectWorkspace').css('background-color', '#FAFAFA');
        $('#notes_area').css('background-color', '#FAFAFA');
        $('#dueDatePicker').css('border', '1px solid #d8d8d8');
        $('#selectWorkspace').css('border', '1px solid #d8d8d8');
        $('#notes_area').css('border', '1px solid #d8d8d8');
    }
}