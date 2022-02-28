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

    function openInNewTab(links) {
        for (var x = 0; x < links.length; x++){
            window.open(links[x], '_blank').focus();
        }
    }

    function show_ewdSupporter() {
        $(".global-header").hide();
        $("html").css("margin-top", "0px");
        $("#main > div.entry-meta.sidebar > div:nth-child(2)").hide();
        
        const links = [
            "https://wordpress.org/support/plugin/ultimate-product-catalogue/active/",
            "https://wordpress.org/support/plugin/front-end-only-users/active/",
            "https://wordpress.org/support/plugin/order-tracking/active/",
            "https://wordpress.org/support/plugin/ultimate-faqs/active/",
            "https://wordpress.org/support/plugin/ultimate-reviews/active/",
            "https://wordpress.org/support/plugin/ultimate-slider/active/",
            "https://wordpress.org/support/plugin/color-filters/active/",
            "https://wordpress.org/support/plugin/ultimate-lightbox/active/",
            "https://wordpress.org/support/plugin/ultimate-appointment-scheduling/active/",
            "https://wordpress.org/support/plugin/ultimate-wp-mail/active/",
            "https://wordpress.org/support/plugin/business-profile/active/",
            "https://wordpress.org/support/plugin/food-and-drink-menu/active/",
            "https://wordpress.org/support/plugin/restaurant-reservations/active/",
            "https://wordpress.org/support/plugin/good-reviews-wp/active/"
        ];

        $.get(chrome.extension.getURL("assets/html/ewdSupporterControlsContainer.html"), function (data) {
            $(data).appendTo("body");
            
            if (window.location.href.indexOf("topic") > -1) {
                $("#bbpress-forums").find("a[rel='nofollow']").attr("target", "_blank");
            } else {
                $(".bbp-topic-permalink").parent().siblings(".bbp-topic-freshness").find(".bbp-author-name").each(function () {
                    if (this.innerHTML != "jaysupport" && this.innerHTML != "jssupport" && this.innerHTML != "Rustaurius") {
                        $(this).css("color", "red");
                        $(this).css("font-size", "20px");
                        $(this).css("background", "black");
                    }
                });
            }

            $('html, body').animate({
                scrollTop: $("#bbpress-forums").offset().top
            }, 500);

            $("#ewdSupporterOpenAllLinks").click(function () {
                openInNewTab(links);
            });

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