$(document).ready(function () {
    // Enable/Disable the extension
    var ewdSupporter = true;

    // Enable/Disable debug mode
    var ewdSupporter_debug = false;

    // Global colors
    var ewdSupporter_RED = "#f44336";
    var ewdSupporter_ORANGE = "#FF9800";

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
        Purpose: To load the extension
    */
    function show_ewdSupporter() {

        /*
            Purpose: Append bookmarks container
        */
        $.get(chrome.extension.getURL("assets/html/ewdSupporterBookmarkContainer.html"), function (data) {
            $(data).appendTo("body");

            /*
                Purpose: If on viewing topic, append status container
            */
            if (window.location.href.indexOf("topic") > -1) {

                /*
                    Purpose: Enforce all URLs on topic pages to open in external tabs
                */
                $("#bbpress-forums").find("a[rel='nofollow']").attr("target", "_blank");
            } else {

                /*
                    Purpose: Set authors to orange
                */
                $(".bbp-topic-permalink").parent().siblings(".bbp-topic-freshness").find(".bbp-author-name").each(function () {

                    /*
                        Purpose: If last author is not jaysupport or Rustaurius set color to red
                    */
                    if (this.innerHTML != "jaysupport" && this.innerHTML != "Rustaurius") {
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