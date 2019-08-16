//Global colors
var ewdSupporter_GREEN = "#4CAF50";
var ewdSupporter_RED = "#f44336";
var ewdSupporter_YELLOW = "#FFC107";
var ewdSupporter_ORANGE = "#FF9800";

$(document).ready(function () {

    var ewdSupporterPreviewMessage = false;
    var ewdSupporter = true;

    //Enable functionality only if user has plugin turned on.
    chrome.storage.sync.get(["ewdSupporter"], function (result) {
        if (result.ewdSupporter != null) {
            ewdSupporter = result.ewdSupporter;
            if (ewdSupporter) {
                show_ewdSupporter();
            }
        }
    });

    chrome.storage.sync.get(["ewdSupporterPM"], function (result) {
        if (result.ewdSupporterPM != null) {
            ewdSupporterPreviewMessage = result.ewdSupporterPM;
        }
    });

    function show_ewdSupporter() {
        //Run only if EWD
        if (!$(".display-name").length && $(".display-name").html() != "EtoileWebDesign") {
            return;
        }

        //Append bookmark container
        $.get(chrome.extension.getURL("assets/html/ewdSupporterBookmarkContainer.html"), function (data) {
            $(data).appendTo("body");

            //If on viewing topic, append status container
            if (window.location.href.indexOf("topic") > -1) {
                $.get(chrome.extension.getURL("assets/html/ewdSupporterStatusContainer.html"), function (data) {
                    $(data).appendTo("body");

                    //Set the page status
                    setPageStatus();
                });

                $.get(chrome.extension.getURL("assets/html/ewdSupporterPreviewMessage.html"), function (data) {
                    $(data).appendTo("body");
                    if (!ewdSupporterPreviewMessage) {
                        $("#ewdSupporterPreviewMessage").animate({
                            bottom: "-100%"
                        }, 500);
                    } else {
                        $("#main").css("margin-left", "2em");
                    }

                    $("#ewdSupporterPreviewMessageButton").click(function () {
                        if (ewdSupporterPreviewMessage) {
                            $("#ewdSupporterPreviewMessage").animate({
                                bottom: "-100%"
                            }, 500);

                            $("#main").css("margin-left", "");
                        } else {
                            alert("This feature is still in BETA. Use at risk lol");
                            $("#ewdSupporterPreviewMessage").animate({
                                bottom: "63px"
                            }, 500);

                            $("#main").animate({
                                marginLeft: "2em"
                            }, 500);
                        }
                        ewdSupporterPreviewMessage = !ewdSupporterPreviewMessage;

                        setToStorage({
                            ewdSupporterPM: ewdSupporterPreviewMessage
                        });
                    });

                    //Set message box functions
                    supportReply();
                });


                //Enforce all URLs on topic pages to open in external tabs
                $("#bbpress-forums").find("a[rel='nofollow']").attr("target", "_blank");

            }

            //Viewing root
            else {
                //Set non resolved threads to orange
                $(".bbp-topic-permalink").not(":has(.resolved)").css("color", ewdSupporter_ORANGE);

                $(".bbp-topic-permalink").parent().siblings(".bbp-topic-freshness").find(".bbp-author-name").each(function () {

                    //If last author is not etoile set color to orange
                    if (this.innerHTML != "EtoileWebDesign") {
                        $(this).css("color", ewdSupporter_ORANGE);
                    }
                });
            }

            //Scroll to main content
            $('html, body').animate({
                scrollTop: $(".page-header, .bbp-pagination").offset().top
            }, 500);
        });
    }

    function supportReply() {
        //Get the topics ID
        var postID = $("input[name='topic_id']").val();

        //Append prefix for storage.sync
        postID = "ewdSupporterReplyMessage_" + postID;

        //If data exists in storage.sync, append it to the textarea
        chrome.storage.sync.get([postID], function (result) {
            if (result[postID] != null && result[postID] != "") {
                $("#bbp_reply_content").val(result[postID]);
                $("#ewdSupporterPreviewMessage").html(swaplineBreaks(result[postID]));
                $("#ewdSupporterPreviewMessage").children("p:empty").remove();
                $("#ewdSupporterPreviewMessage pre code").children("p:empty").remove();
            }
        });

        //Track changes in textarea and save it to storage.sync
        var oldVal = "";
        $("#bbp_reply_content").on("input", function () {
            var currentVal = $(this).val();
            if (currentVal == oldVal && currentVal != "") {
                return;
            }
            oldVal = currentVal;
            setToStorage({
                [postID]: currentVal
            });

            //Update preview container on change
            $("#ewdSupporterPreviewMessage").html(swaplineBreaks(oldVal));
            $("#ewdSupporterPreviewMessage").children("p:empty").remove();
            $("#ewdSupporterPreviewMessage pre code").children("p:empty").remove();
        });

        //Empty the storage.sync data for this topic
        $("button[name='bbp_reply_submit']").click(function () {
            setToStorage({
                [postID]: ""
            });
        });
    }

    function swaplineBreaks(message) {
        //Swap all line breaks with p tags
        var lineBreak = "</p><p>";
        message = message.replace(/\r\n|\r|\n/g, lineBreak);
        message = "<p>" + message + "</p>";

        var output = "";
        var first = true;
        for (var index = 0; index < message.length; index++) {
            if (message.charAt(index) != "`") {
                if (!first) {
                    if (message.charAt(index) == "<") {
                        if (message.charAt(index + 1) == "p") {
                            index += 2;
                            continue;
                        } else if (message.charAt(index + 1) == "/") {
                            index += 3;
                            continue;
                        }
                    }
                }
                output += message.charAt(index);
            } else {
                if (first)
                    output += "<pre><code>";
                else
                    output += "</code></pre>";
                first = !first;
            }
        }

        return output;
    }

    function setPageStatus() {
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
    }

    function setStatusColor(val) {
        //Set correct color
        switch (val) {
            case "yes":
                $(".selected").css("background-color", ewdSupporter_GREEN);
                break;
            case "no":
                $(".selected").css("background-color", ewdSupporter_RED);
                break;
            case "mu":
                $(".selected").css("background-color", ewdSupporter_YELLOW);
                break;
        }
    }

    function setToStorage(obj) {
        //Save value in storage sync
        chrome.storage.sync.set(obj);
    }

    //Listen to extension click events: Flip the switch (on/off) on click
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.run_ewdSupporter == 1) {
                ewdSupporter = !ewdSupporter;
                setToStorage({
                    ewdSupporter: ewdSupporter
                });
                location.reload();
            }
        }
    );
});