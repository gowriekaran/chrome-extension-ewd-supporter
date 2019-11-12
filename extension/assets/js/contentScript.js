$(document).ready(function () {
    // Enable/Disable the extension
    var ewdSupporter = true;

    // Enable/Disable debug mode
    var ewdSupporter_debug = false;

    // Global colors
    var ewdSupporter_GREEN = "#4CAF50";
    var ewdSupporter_RED = "#f44336";
    var ewdSupporter_YELLOW = "#FFC107";
    var ewdSupporter_ORANGE = "#FF9800";

    // Preview mode (BETA)
    var ewdSupporterPreviewMessage = false;

    // Misc variables for verification
    var ewdSupporter_loggedInUser;
    var ewdSupporter_pluginName;
    var ewdSupporter_etoilePluginsList = [
        "Product Catalog",
        "Front End Users",
        "Status and Order Tracking",
        "Ultimate FAQ",
        "Ultimate Reviews",
        "Slider Ultimate",
        "Ultimate WooCommerce Filters",
        "Lightbox Ultimate",
        "Ultimate Appointment Booking & Scheduling",
        "Ultimate WP Mail"
    ];
    var ewdSupporter_fivePluginsList = [
        "Five Star Restaurant Reservations",
        "Five Star Restaurant Menu",
        "Five Star Business Profile"
    ];

    /*
        Purpose: Verify if WP Account owns plugins
    */
    function loginCheck(currentPlugin, pluginsList) {
        for (var x = 0; x < pluginsList.length; x++) {
            if (currentPlugin == pluginsList[x]) {
                alert("WARNING: You are logged in as " + ewdSupporter_loggedInUser + "!");
            }
        }
    }

    /*
        Purpose: Verify if user enabled/disabled the extension
    */
    chrome.storage.sync.get(["ewdSupporter"], function (result) {
        if (result.ewdSupporter != null) {
            ewdSupporter = result.ewdSupporter;
            if (ewdSupporter_debug) console.log("ewdSupporter:", ewdSupporter);
            if (ewdSupporter) {
                show_ewdSupporter();
            }
        }
    });

    /*
        Purpose: Verify if user enabled/disabled Preview mode (BETA)
    */
    chrome.storage.sync.get(["ewdSupporterPM"], function (result) {
        if (result.ewdSupporterPM != null) {
            ewdSupporterPreviewMessage = result.ewdSupporterPM;
        }
    });

    /*
        Purpose: To load the extension
    */
    function show_ewdSupporter() {
        /*
            Purpose: Check who is logged in, if user is logged in
        */
        if ($(".display-name")[0]) {
            ewdSupporter_loggedInUser = $(".display-name").first().text();
        }

        /*
            Purpose: Check which plugin the user is viewing, if on plugin page
        */
        if ($(".bbp-breadcrumb-forum")[0]) {
            ewdSupporter_pluginName = $(".bbp-breadcrumb-forum").first().text();
        }

        /*
            Purpose: Check if user owns plugins
        */
        if (ewdSupporter_loggedInUser != null && ewdSupporter_pluginName != null) {
            if (ewdSupporter_loggedInUser == "EtoileWebDesign") {
                loginCheck(ewdSupporter_pluginName, ewdSupporter_fivePluginsList);
            } else if (ewdSupporter_loggedInUser == "fivestarplugins") {
                loginCheck(ewdSupporter_pluginName, ewdSupporter_etoilePluginsList);
            }
        }

        /*
            Purpose: Append bookmarks container
        */
        $.get(chrome.extension.getURL("assets/html/ewdSupporterBookmarkContainer.html"), function (data) {
            $(data).appendTo("body");

            /*
                Purpose: If on viewing topic, append status container
            */
            if (window.location.href.indexOf("topic") > -1) {
                $.get(chrome.extension.getURL("assets/html/ewdSupporterStatusContainer.html"), function (data) {
                    $(data).appendTo("body");

                    /*
                        Purpose: Set the page status
                    */
                    setPageStatus();
                });

                /*
                    Purpose: Load Preview mode feature (BETA)
                */
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

                    /*
                        Purpose: Set message box functions
                    */
                    supportReply();
                });

                /*
                    Purpose: Enforce all URLs on topic pages to open in external tabs
                */
                $("#bbpress-forums").find("a[rel='nofollow']").attr("target", "_blank");
            }

            /*
                Purpose: Viewing root
            */
            else {
                /*
                    Purpose: Set non resolved threads to orange
                */
                $(".bbp-topic-permalink").not(":has(.resolved)").css("color", ewdSupporter_ORANGE);

                $(".bbp-topic-permalink").parent().siblings(".bbp-topic-freshness").find(".bbp-author-name").each(function () {

                    /*
                        Purpose: If last author is not etoile set color to red
                    */
                    if (this.innerHTML != "EtoileWebDesign" && this.innerHTML != "fivestarplugins") {
                        $(this).css("color", ewdSupporter_RED);
                    }
                });
            }

            /*
                Purpose: Scroll to main content
            */
            $('html, body').animate({
                scrollTop: $(".page-header, .bbp-pagination").offset().top
            }, 500);
        });
    }

    function supportReply() {
        /*
            Purpose: Get the topics ID
        */
        var postID = $("input[name='topic_id']").val();

        /*
            Purpose: Append prefix for storage.sync
        */
        postID = "ewdSupporterReplyMessage_" + postID;

        /*
            Purpose: If data exists in storage.sync, append it to the textarea
        */
        chrome.storage.sync.get([postID], function (result) {
            if (result[postID] != null && result[postID] != "") {
                $("#bbp_reply_content").val(result[postID]);
                $("#ewdSupporterPreviewMessage").html(swaplineBreaks(result[postID]));
                $("#ewdSupporterPreviewMessage").children("p:empty").remove();
                $("#ewdSupporterPreviewMessage pre code").children("p:empty").remove();
            }
        });

        /*
            Purpose: Track changes in textarea and save it to storage.sync
        */
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

            /*
                Purpose: Update preview container on change
            */
            $("#ewdSupporterPreviewMessage").html(swaplineBreaks(oldVal));
            $("#ewdSupporterPreviewMessage").children("p:empty").remove();
            $("#ewdSupporterPreviewMessage pre code").children("p:empty").remove();
        });

        /*
            Purpose: Empty the storage.sync data for this topic
        */
        $("button[name='bbp_reply_submit']").click(function () {
            setToStorage({
                [postID]: ""
            });
        });
    }

    function swaplineBreaks(message) {
        /*
            Purpose: Swap all line breaks with p tags
        */
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
        /*
            Purpose: Update the status container to the currently selected thread status
        */
        $(".ewdSupporterStatus[value='" + $("#topic-resolved").val() + "']").addClass("selected");

        /*
            Purpose: Set status button color based on selected thread status
        */
        setStatusColor($("#topic-resolved").val());

        /*
            Purpose: Trigger thread submit
        */
        $(".ewdSupporterStatus").click(function () {
            $("#topic-resolved option:selected").removeAttr("selected");
            $('#topic-resolved option[value="' + $(this).attr("value") + '"]').attr("selected", "selected");
            $(".ewdSupporterStatus").removeClass("selected");
            $(".ewdSupporterStatus[value='" + $("#topic-resolved").val() + "']").addClass("selected");
            $("input[name='submit']").click();
        });
    }

    function setStatusColor(val) {
        /*
            Purpose: Set correct color
        */
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
        /*
            Purpose: Save value in storage sync
        */
        chrome.storage.sync.set(obj);
    }

    /*
        Purpose: Listen to extension click events: Flip the switch (on/off) on click
    */
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