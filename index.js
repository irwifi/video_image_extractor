'use strict';
$(function() {
    var formdata = new FormData();
    var URL = window.URL || window.webkitURL
    var video = document.createElement("video");
    var thumbs = document.getElementById("thumbs");

    document.querySelector('input[type="file"]').addEventListener('change', function(e) { select_video(this); }, false);

    $("#start").on("click", playSelectedFile);

    video.addEventListener('loadeddata', function() {
        thumbs.innerHTML = "";
        video.currentTime = 0;
    }, false);

    video.addEventListener('seeked', function() {
        // now video has seeked and current frames will show at the time as we expect
        generateThumbnail();

        // if we are not passed end, seek to next interval
        if (video.currentTime + 1 <= video.duration) {
            // this will trigger another seeked event
            video.currentTime += 1;
        }
    }, false);

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
        if (canPlay === '') canPlay = 'maybe'
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
        video.autoplay = true;
        video.muted = true;
        video.preload = "auto";
        video.currentTime = 0;
        video.src = fileURL;
    }

    function generateThumbnail() {
        var c = document.createElement("canvas");
        c.id = "canvas";

        var ctx = c.getContext("2d");
        c.width = 160;
        c.height = 90;
        ctx.drawImage(video, 0, 0, 160, 90);
        thumbs.appendChild(c);
    }
});