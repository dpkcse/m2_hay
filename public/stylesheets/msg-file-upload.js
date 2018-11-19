var formDataTemp = [];
var add_file_data = (data) => {
    filedata = [];
    audiofile = [];
    videofile = [];
    imgfile = [];
    otherfile = [];
    $.each(data, function(k, v) {
        var mime = v.mimetype;
        if (mime.indexOf('image') != -1)
            imgfile.push(v.filename);
        else if (mime.indexOf('video') != -1)
            videofile.push(v.filename);
        else if (mime.indexOf('audio') != -1)
            audiofile.push(v.filename);
        else
            otherfile.push(v.filename);
    });
    filedata = [{ audiofile, imgfile, otherfile, videofile }];
};
var submit_form_data = () => {
    // var data = new FormData();
    // $.each($('#msg_file')[0].files, function(i, file) {
    //     data.append('attach_file', file);
    // });
    // var form = $('#message-form')[0];
    var formData = new FormData($('#message-form')[0]);
    $.ajax({
        xhr: function() {
            $('.progress').show();
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    var percom = Math.ceil(percentComplete * 100) - 1;
                    // console.log(percom);
                    $(".progress-bar").html(percom + "%");
                    $(".progress-bar").css("width", percom + "%");
                    $(".progress-bar").attr("aria-valuenow", percom);
                }
            }, false);
            return xhr;
        },
        url: '/hayven/send_message',
        type: "POST",
        data: formData,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function(res) {
            if (res.file_info.length) {
                $('.progress').hide();
                add_file_data(res.file_info);
                $("#attach_file_preview").html("");
                $("#attach_file_preview").hide();
            } else {
                alert(res.msg);
            }
        }
    });
};

var submit_form_data1 = (files) => {
    $("#attach_file_preview").show();
    var fileList = document.getElementById("attach_file_preview_con");

    for (var i = 0; i < files.length; i++) {

        var has_already = false;
        formDataTemp.forEach(function(vv) {
            if (vv.name == files[i].name) {
                has_already = true;
            }
        });
        if (has_already === true) continue;
        formDataTemp.push(files[i]);

        var file_ext = files[i].name.split('.').pop().toLowerCase();
        switch (file_ext) {
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
                file_ext = file_ext;
                break;
            default:
                file_ext = 'other';
        }

        var div = document.createElement("div");
        fileList.appendChild(div);

        var img = document.createElement("img");
        if (files[i].type.startsWith('image/')) {
            img.setAttribute('class', 'fileobj imgobj');
            img.src = window.URL.createObjectURL(files[i]);
        } else {
            img.setAttribute('class', 'fileobj');
            img.src = "/images/file_icon/80px/" + file_ext + ".png";
        }
        img.alt = window.URL.createObjectURL(files[i]);
        img.setAttribute('data-filetype', files[i].type);
        img.setAttribute('data-name', files[i].name);

        img.onload = function() {
            window.URL.revokeObjectURL(this.src);
        }

        div.appendChild(img);
        var close = document.createElement("span");
        // close.setAttribute('class', 'per_file');
        close.onclick = function() {
            this.parentNode.remove();
            if ($("#attach_file_preview_con").find('div').length < 1)
                $("#attach_file_preview").hide();
        }
        close.innerHTML = 'x';
        div.appendChild(close);

        var info = document.createElement("p");
        info.innerHTML = files[i].name;
        // info.innerHTML = files[i].name + ": " + files[i].size + " bytes";
        div.appendChild(info);
    }

    $('#message-form .action-btn').trigger('click');
    $('#msg').html("Files selected...");
    $('#msg').focus();
};


$(".attach_prev").click(function() {
    var $item = $("#attach_file_preview_con div"),
        visible = 4,
        index = 0,
        endIndex = ($item.length / visible) - 1;

    if (index < endIndex) {
        index--;
        $item.animate({ 'left': '+=300px' });
    }
});

$(".attach_next").click(function() {
    var $item = $("#attach_file_preview_con div"),
        visible = 4,
        index = 0,
        endIndex = ($item.length / visible) - 1;

    if (index < endIndex) {
        index++;
        $item.animate({ 'left': '-=300px' });
    }
});