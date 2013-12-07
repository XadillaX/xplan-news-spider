/**
 * Created by XadillaX on 13-12-7.
 */
var SpiderLatecomer = require("xplanspider").SpiderLatecomer;

var latecomer = new SpiderLatecomer("mongodb://127.0.0.1/zju-cst-xplan");
latecomer.on("content", function(url, html, status, respHeader) {
    var origId = "";
    var title = "";
    var content = "";
    var time = 0;
    var source = "";
    var author = "";
    var type = "";

    /**
     * search for origId
     */
    var origIdPos = url.indexOf("&id=");
    origId = url.substr(origIdPos + 4);

    /**
     * title
     */
    var titleRegexp = /<div class="detailed_bt">(.*)<\/div>/;
    var titleResult = html.match(titleRegexp);
    if(titleResult) title = titleResult[1];

    /**
     * content
     */
    var contentRegexp = /<div class="vid_wz">([\s\S]*)<\/div>\s*<br \/>\s*<br \/>\s*<div align="center" style="margin-top:20px;">\s*<Br><\/Br>\s*<input type="button" onclick="javascript:window.close\(\);" value="关闭" style="width:100px;height:39px;"\/>\s*<\/div>/;
    var contentResult = html.match(contentRegexp);
    if(contentResult) content = contentResult[1];

    /**
     * time, source, author
     */
    var tipRegexp = /<div class="detailed_ly">作 者: (.*) 来 源: (.*)  发布时间: (\S*)/;
    var tipResult = html.match(tipRegexp);
    if(tipResult) {
        time = parseInt(Date.create(tipResult[3]) / 1000);
        source = tipResult[2];
        author = tipResult[1];
    }

    /**
     * type
     */
    var typeRegexp = /您现在的位置：<.*>网站首页<.*>.*<a\s*href=".*">\s*(\S*)\s*<\/a>/;
    var typeResult = html.match(typeRegexp);
    if(typeResult) {
        type = typeResult[1];
    }

    // store this news to mongoDB
    latecomer.store(origId, title, content, time, source, author, type);

    console.log("[" + origId + "]" + type + " - " + title);

    // test
//    var result = {
//        origId: origId,
//        title: title,
//        content: content,
//        pubTime: time,
//        source: source,
//        author: author,
//        type: type
//    };
//    console.log(result);
});

latecomer.start("amqp://localhost", "test");
