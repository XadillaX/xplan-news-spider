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
    var image = "";

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

    var newsurl = url;

    /**
     * image
     *  <img alt="" src="http://www.cst.zju.edu.cn/uploadfile/2013/1218/20131218101327623.jpg" style="width: 600px; height: 450px">
     *  <img src="/upfiles/20110223133043159.jpg" border="0">
     *  <img src="http://www.cst.zju.edu.cn/uploadfile/2013/1025/20131025085657376.jpg">
     */
    //var imageRegexp1 = /<table align="center" border="0" cellpadding="1" cellspacing="1" style="width: 500px">\s*<tbody>\s*<tr>\s*<td>\s*<img(?!.*?logo).*>/g;

    var imageRegexp1 = /<img .+?>/g;
    var imageRegexp2 = /<IMG .+?>/g;
    var imageRegexp3 = /src="(\S+)" /;
    var imageResult1 = contentResult[1].match(imageRegexp1);
    var imageResult2 = contentResult[1].match(imageRegexp2);
    var imageResult1length = 0;
    var imageResult2length = 0;
    image = [];
    if(imageResult1) {
        imageResult1length = imageResult1.length;

        for(var i = 0; i < imageResult1length; ) {
            if(imageResult1[i].match(imageRegexp3)) {
                image[i]=imageResult1[i].match(imageRegexp3)[1];
                i++;
            } else {
                imageResult1length = imageResult1length - 1;
            }
        }
    }

    if(imageResult2) {
        imageResult2length = imageResult1length + imageResult2.length;

        for(var i = imageResult1length; i < imageResult2length; ) {
            if(imageResult2[i - imageResult1length].match(imageRegexp3)) {
                image[i] = imageResult2[i - imageResult1length].match(imageRegexp3)[1];
                i++;
            }else{
                imageResult2length = imageResult2length - 1;
            }
        }
    }

    // store this news to mongoDB
    latecomer.store(origId, title, content, time, source, author, type, newsurl, image);

    console.log("[" + origId + "]" + type + " - " + title);
});

latecomer.start("amqp://localhost", "test");
