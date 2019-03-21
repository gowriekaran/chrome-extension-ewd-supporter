//Global colors
var GREEN = "#4CAF50";
var RED = "#f44336";
var YELLOW = "#FFC107";
var ORANGE = "#FF9800";

$(document).ready(function () {

    //Run only if EWD
    if (!$(".display-name").length && $(".display-name").html() != "EtoileWebDesign") {
        return;
    }

    //Append bookmark container
    $.get(chrome.extension.getURL("assets/html/ewdSupporterBookmarkContainer.html"), function (data) {
        $(data).appendTo("body");

        //If on viewing topic, append status container
        if (window.location.href.indexOf("https://wordpress.org/support/topic/") > -1) {
            $.get(chrome.extension.getURL("assets/html/ewdSupporterStatusContainer.html"), function (data) {
                $(data).appendTo("body");

                //Set the page
                setPage();
            });

            //Enforce all URLs on topic pages to open in external tabs
            $(".wporg-bbp-topic-site-url > a").not(".ewdSupporterBookmark").attr("target", "_blank");
        }

        //Viewing root
        else {

            //Scroll to .bbp-pagination
            $('html, body').animate({
                scrollTop: $(".bbp-pagination").offset().top
            }, 500);

            //Set non resolved threads to orange
            $(".bbp-topic-permalink").not(":has(.resolved)").css("color", ORANGE);
            $(".bbp-topic-permalink").not(":has(.resolved)").parent().siblings(".bbp-topic-freshness").find(".bbp-author-name").each(function () {

                //Set non resolved threads  that I didnt reply to last to orange
                if (this.innerHTML != "EtoileWebDesign") {
                    $(this).css("color", ORANGE);
                }

                // If I did, set it to green
                else {
                    $(this).css("color", GREEN);
                }
            });
        }
    });

    function setPage() {

        //Get the topics ID
        var postID = $("input[name='topic_id']").val();

        //Append prefix for storage.sync
        postID = "ewdSupporterReplyMessage_" + postID;

        //If data exists in storage.sync, append it to the textarea
        chrome.storage.sync.get([postID], function (result) {
            if (result[postID] != null) {
                $("#bbp_reply_content").val($("#bbp_reply_content").val() + "\nRecovered:\n" + result[postID]);
            }
        });

        //Track changes in textarea and save it to storage.sync
        var oldVal = "";
        $("#bbp_reply_content").change(function () {
            var currentVal = $(this).val();
            if (currentVal == oldVal) {
                return;
            }
            oldVal = currentVal;
            chrome.storage.sync.set({
                [postID]: currentVal
            });
        });

        //Update the status container to the currently selected thread status
        $(".ewdSupporterStatus[value='" + $("#topic-resolved").val() + "']").addClass("selected");

        //Set status button color based on selected thread status
        setStatusColor($("#topic-resolved").val());

        //Trigger thread submit
        $(".ewdSupporterStatus").click(function () {
            $("#topic-resolved option:selected").removeAttr("selected");
            $('#topic-resolved option[value="' + $(this).attr("value") + '"]').attr("selected", "selected");
            $(".ewdSupporterStatus").removeClass("selected");
            $(".ewdSupporterStatus[value='" + $("#topic-resolved").val() + "']").addClass("selected");
            $("input[name='submit']").click();
        });

        //Empty the storage.sync data for this topic
        $("button[name='bbp_reply_submit']").click(function () {
            chrome.storage.sync.set({
                [postID]: ""
            });
        });
    }

    function setStatusColor(val) {
        switch (val) {
            case "yes":
                $(".selected").css("background-color", GREEN);
                break;
            case "no":
                $(".selected").css("background-color", RED);
                break;
            case "mu":
                $(".selected").css("background-color", YELLOW);
                break;
        }
    }
});