$(document).ready(function () {
    var ewdSupporter = true;

    chrome.storage.sync.get(["ewdSupporter"], function (result) {
        if (result.ewdSupporter != null) {
            ewdSupporter = result.ewdSupporter;
            
            if (ewdSupporter) {
                show_ewdSupporter();
            }
        }
    });

    function show_ewdSupporter() {
        $.get(chrome.extension.getURL("assets/html/ewdSupporterBookmarkContainer.html"), function (data) {
            $(data).appendTo("body");
            
            if (window.location.href.indexOf("topic") > -1) {
                $("#bbpress-forums").find("a[rel='nofollow']").attr("target", "_blank");
            } else {
                $(".bbp-topic-permalink").parent().siblings(".bbp-topic-freshness").find(".bbp-author-name").each(function () {
                    if (this.innerHTML != "jaysupport" && this.innerHTML != "jssupport" && this.innerHTML != "Rustaurius") {
                        $(this).css("color", "#f44336");
                    }
                });
            }

            $('html, body').animate({
                scrollTop: $(".page-header, .bbp-pagination").offset().top
            }, 500);
        });
    }

    function setToStorage(obj) {
        chrome.storage.sync.set(obj);
    }

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