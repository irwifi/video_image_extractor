'use strict';
$(function() {
    var formdata = new FormData();
    var URL = window.URL || window.webkitURL

    document.querySelector('input[type="file"]').addEventListener('change', function(e) { select_video(this); }, false);

    $("#start").on("click", playSelectedFile);

    function select_video(file_obj) {
        var formData = new FormData();
        for (var i = 0, file; file = file_obj.files[i]; ++i) {
            formData.append(file.name, file);
        }

        var isError = test_video(document.querySelector('input[type="file"]').files[0]);
        if(isError === true) {
            $("#message").css("background", "rgb(230, 91, 58)");
        } else {
            $("#start").show();
        }
    }

    function test_video(file) {
        var type = file.type
        var videoNode = document.querySelector('video')
        var canPlay = videoNode.canPlayType(type)
        if (canPlay === '') canPlay = 'no'
        var message = 'Can play type "' + type + '": ' + canPlay
        var isError = canPlay === 'no'
        displayMessage(message, isError)
        return isError;
    }

    function displayMessage(message, isError) {
        var element = document.querySelector('#message')
        element.innerHTML = message;
        element.className = isError ? 'error' : 'info'
        $("#message").css("display", "inline-block");
    }

    function playSelectedFile(event) {
        $("#start").hide();
        $("#message").hide();
        $("#thumbs").show();

        var fileURL = URL.createObjectURL(document.querySelector('input[type="file"]').files[0])
        var i = 0;
        var video = document.createElement("video");
        var thumbs = document.getElementById("thumbs");

        video.addEventListener('loadeddata', function() {
            thumbs.innerHTML = "";
            video.currentTime = i;
        }, false);

        video.addEventListener('seeked', function() {
            // now video has seeked and current frames will show at the time as we expect
            generateThumbnail(i);

            // when frame is captured, increase
            i++;

            // if we are not passed end, seek to next interval
            if (i <= video.duration) {
                // this will trigger another seeked event
                video.currentTime = i;
            }
        }, false);

        video.preload = "auto";
        video.src = fileURL;

        var xCount = 0;

        function uploadCanvas(dataURL) {
            var blobBin = atob(dataURL.split(',')[1]);
            var array = [];
            for (var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], { type: 'image/png' });
            var formdata = new FormData();
            formdata.append("image", file);

            $.ajax({
                url: "/asdfs/zlock",
                type: "POST",
                data: formdata,
                processData: false, // important
                contentType: false // important
            }).complete(function(response) {
                console.log(response.status);
            });
        }

        function generateThumbnail() {
            var c = document.createElement("canvas");
            c.id = "canvas";

            var ctx = c.getContext("2d");
            c.width = 160;
            c.height = 90;
            ctx.drawImage(video, 0, 0, 160, 90);
            thumbs.appendChild(c);

            var imageData = c.toDataURL("image/png");
            var blobBin = atob(imageData.split(',')[1]);
            var array = [];
            for (var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], { type: 'image/png' });
            formdata.append("image[]", file, "abc" + thumbs.childElementCount);

            for (var pair of formdata.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
        }
    }
});