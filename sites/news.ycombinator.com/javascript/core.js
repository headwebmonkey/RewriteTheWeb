//
// ReWrite The Web
// 
// File: core.js
// Description: JS overrides for news.ycombinator.com 
// Contributors: Kody Peterson (headwebmonkey)
// 

var script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute("id", "RWTW");
script.setAttribute("src", "chrome-extension://pommjepgielmmlkhfgdhdddkfhkdohfg/extensionCore/javascript/jquery.js");
document.documentElement.appendChild(script);

$(function() {
    $("table tr:nth-child(1) table td:nth-child(2) span").html($("table tr:nth-child(1) table td:nth-child(2) span").html().replace(/\|/g, ''));
    if ($("table tr:nth-child(1) table td:nth-child(3) .pagetop").children().length > 1){
        $("table tr:nth-child(1) table td:nth-child(3) .pagetop").addClass("loggedIn");
        $("table tr:nth-child(1) table td:nth-child(3)").addClass("loggedIn");
        $("table tr:nth-child(1) table td:nth-child(3) .pagetop").html($("table tr:nth-child(1) table td:nth-child(3) .pagetop").html().replace("&nbsp;|&nbsp;", "</a>"));
        $("table tr:nth-child(1) table td:nth-child(3) .pagetop").html($("table tr:nth-child(1) table td:nth-child(3) .pagetop").html().replace("&nbsp;", "<a>"));
        $("table tr:nth-child(1) table td:nth-child(3) .pagetop").html($("table tr:nth-child(1) table td:nth-child(3) .pagetop").html().replace("(", "").replace(")", ""));

        var width = 0;
        $(".pagetop.loggedIn a").each(function(){
            width += $(this).outerWidth();
        });
        $("td.loggedIn").css("width", width+"px");
    }  
    var newContent = "";
    var story = "";
    var count = 0;
    var rowCount = 0;

    var newsReCode = function(){
        count ++;
        rowCount ++;
        if(count == 3){
            count = 0;
        } else {
            if(rowCount == 92){
                story = "";
                story += "<li>";
                    story += "<div class='more'>";
                        story += $("body > center > table > tbody > tr:nth-child(3) table tr:nth-child("+rowCount+") .title").html();
                    story += "</div>";
                story += "</li>";
                newContent += story;
                story = "";
            } else {
                if(count == 1){
                    story += "<li>";
                        story += "<div class='front'>";
                            story += "<span class='index'>"+$("body > center > table > tbody > tr:nth-child(3) table tr:nth-child("+rowCount+") td:nth-child(1)").html()+"</span>";
                            var upvote = $("body > center > table > tbody > tr:nth-child(3) table tr:nth-child("+rowCount+") td:nth-child(2) center").html();
                            if (upvote == undefined){
                                story += "<span class='vote' style='visibility:hidden'></span>";
                            } else {
                                story += upvote;
                            }
                        story += "</div>";
                        story += $("body > center > table > tbody > tr:nth-child(3) table tr:nth-child("+rowCount+") td:nth-child(3)").html();
                }else{
                        story += "<div class='foot'>";
                            story += $("body > center > table > tbody > tr:nth-child(3) table tr:nth-child("+rowCount+") .subtext").html();
                        story += "</div>";
                    story += "</li>";
                }
                if(count == 2){
                    newContent += story;
                    story = "";
                }
            }
        }
    };
    
    $(".news_ycombinator_com > center > table > tbody > tr:nth-child(3) > td > table > tbody > tr").each(newsReCode);
    $(".news_ycombinator_com_newest > center > table > tbody > tr:nth-child(3) > td > table > tbody > tr").each(newsReCode);
    $(".news_ycombinator_com > center > table > tbody > tr:nth-child(3) table tbody").html("<tr><td><ul class='list'>"+newContent+"</ul></td></tr>");
    $(".news_ycombinator_com_newest > center > table > tbody > tr:nth-child(3) table tbody").html("<tr><td><ul class='list'>"+newContent+"</ul></td></tr>");
});