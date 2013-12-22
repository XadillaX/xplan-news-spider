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
    var image="";

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
    /**
     * newsurl
     */

    var newsurl=url;
    /**
     * image
     * <img alt="" src="http://www.cst.zju.edu.cn/uploadfile/2013/1218/20131218101413599.jpg" style="width: 600px; height: 450px">
     */
    var imageRegexp1 = /<table align="center" border="0" cellpadding="1" cellspacing="1" style="width: 500px">\s*<tbody>\s*<tr>\s*<td>\s*<img(?!.*?logo).*>/g;
    var imageRegexp2 =/src="(\S+)" /;
    var imageResult = html.match(imageRegexp1);
    //console.log(imageResult);
    if(imageResult) {
        image=[];
        for(var i = 0; i < imageResult.length; i++) {
        image[i]=imageResult[i].match(imageRegexp2)[1];

        }
        //console.log(image);
    }

    // store this news to mongoDB
    latecomer.store(origId, title, content,time,source, author,type,newsurl,image);

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
