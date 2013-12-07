/**
 * Created by XadillaX on 13-12-3.
 */
var SpiderPioneer = require("xplanspider").SpiderPioneer;

// spider pioneer
var pioneer = new SpiderPioneer();

// all type of list
pioneer.addListPage("http://www.cst.zju.edu.cn/index.php?c=Index&a=tlist&catid=31&p=:page");

// the page count function
pioneer.setGetPageCountFunc(function(urlWithPage, spider, cb) {
    urlWithPage = urlWithPage.replaceAll(":page", 1);
    spider.get(urlWithPage, function(html, status, respHeader) {
        var regExp = /当前第 \d+\/(\d+) 页/;
        var result = html.match(regExp);
        if(result) {
            var count = parseInt(result[1]);
            var array = [];
            for(var i = 1; i <= count; i++) array.push(i);

            // callback function of the pioneer.
            cb(array);
        }
    }, {}, pioneer.encoding);
});

// the list parser function
pioneer.setParseListFunc(function(status, html, respHeader) {
    // eg.
    // <li><span class="lm_new_zk"><a href="index.php?c=Index&a=detail&catid=31&id=1849" target="_blank">
    // <font color="#e58100">				浙江大学宁波理工学院来我院交流思政工作信息化建设				</font>				</a></span>
    //     <span class="fr">2013-12-05</span></li>
    var regExp1 = /<li><span class="lm_new_zk"><a href="(\S+)" target="_blank">/g;
    var regExp2 = /<li><span class="lm_new_zk"><a href="(\S+)" target="_blank">/;
    var result = html.match(regExp1);
    if(result) {
        var rtn = [];
        for(var i = 0; i < result.length; i++) {
            rtn.push("http://www.cst.zju.edu.cn/" + result[i].match(regExp2)[1]);
        }

        return rtn;
    } else {
        return false;
    }
});

// start the service
pioneer.start("amqp://localhost", "test", 100000);
