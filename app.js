const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

const bodyParser = require('body-parser');
app.use(bodyParser.json());//数据JSON类型
app.use(bodyParser.urlencoded({ extended: false }));//解析post请求数据


app.get('/', function(req, res){
    res.sendFile(__dirname + '/html/index.html');
});
app.get('/admin', function(req, res){
    res.sendFile(__dirname + '/html/admin.html');
});

app.post('/adminVerify', function(req, res){
    // console.log("req.body: ", req.body);
    let code = 1;
    if (req.body.account === 'admin' && req.body.pwd === 'a123456') {
        code = 0;
    }
    res.send({code, msg: 'code:0密码正确, code:1密码错误'});
});
app.get('/jQuery', function (req, res) {
    res.sendFile(__dirname + '/js/jQuery.js');
});
/**
 * 图片
 */
app.get('/img/bg0.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg0.jpg');
});
app.get('/img/bg1.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg1.jpg');
});
app.get('/img/bg2.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg2.jpg');
});
app.get('/img/bg3.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg3.jpg');
});
app.get('/img/bg4.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg4.jpg');
});
app.get('/img/bg5.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg5.jpg');
});
app.get('/img/bg6.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg6.jpg');
});
app.get('/img/bg7.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg7.jpg');
});
app.get('/img/bg8.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg8.jpg');
});
app.get('/img/bg9.jpg', function (req, res) {
    res.sendFile(__dirname + '/img/bg9.jpg');
});
// audio
app.get('/audio/QQdididi.mp3', function (req, res) {
    res.sendFile(__dirname + '/audio/QQdididi.mp3');
});
app.get('/audio/QQcare.mp3', function (req, res) {
    res.sendFile(__dirname + '/audio/QQcare.mp3');
});


var onlineStr = "";
var onlineCount = 1;
var recentChatRecord = [];

io.on('connection', function(socket){
    socket.on('connectInit', function (msg) {
        //console.log("连接成功 msg: ", msg);
        if (msg.from) {
            io.emit('recentChatRecord', recentChatRecord);
            io.emit('connectInit', `${msg.from} 加入了群聊`);
            onlineMemberChange(msg.from);
        }
    });

    function onlineMemberChange(from) {
        if (from) {
            onlineStr = from + '进入了群聊';
            onlineCount++;
        } else {
            onlineStr = '有人离开了群聊';
            onlineCount--;
        }
        if (onlineCount <= 0) onlineCount = 1;
        io.emit('onlineList', onlineStr);
        io.emit('onlineCount', onlineCount);
    }


    /**
     *  处理所有的群聊消息
     */
    function groupChat(listen_str) {
        socket.on(listen_str, function(msgObj){
            // 消息内容处理
            if (!msgObj.content || typeof msgObj.content != "string") return;
            if (msgObj.content.length > 1000) {
                msgObj.content = msgObj.content.slice(0, 1000)
            }
            msgObj.content = msgObj.content.replace(/(你爸|你爷)/g, '你儿子~');

            // 发送回去
            io.emit(listen_str, msgObj);

            // 改变最近20条聊天记录的内容
            recentChatRecord.push(msgObj);
            if (recentChatRecord.length > 20) {
                recentChatRecord.splice(0, recentChatRecord.length - 20);
            }
            /**
             * 保存聊天记录
             */
            var writeContent = 'Time: ' + new Date().toLocaleTimeString() +"\n"+
                msgObj.from + '说: ' + msgObj.content +"\n";
            //console.log(writeContent);
            var saveRecordDate = new Date().toLocaleDateString();
            fs.appendFile('./chatRecord/'+saveRecordDate+'.txt', writeContent, function (err) {
                if (err) console.log("err: ", err);
            });

        });
    }
    groupChat('group chat');
    groupChat('adminMsg');



    /**
     *  real-time input
     */
    socket.on('inputting', function (from) {
        io.emit('inputting', from+'正在输入中');
    });

    socket.on('forceExit', function (from) {
        io.emit('forceExit', from);
    });

    /**
     *  监听客户端退出
     */
    socket.on('disconnect', function(msg){
        // console.log("有人走了: " + Date.now());
        onlineMemberChange();
    });


});



http.listen(4001, function(){
    console.log('localhost port 4001');
    console.log('对外 port 4000');
});

