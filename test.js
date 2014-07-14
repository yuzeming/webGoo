var goo = {};
goo.img = new Image();
goo.img.onload = init;
goo.img.src = "ball.png";
goo.size = 10;
goo.r = goo.size / 2;
goo.maxlen = 20;
goo.maxlink = 2;

var spring = {};
spring.img = new Image();
spring.img.scr = "spring_goo.png";

var canvas = document.getElementById("canvas");

var ctx = canvas.getContext("2d");

function Link(_len,_k,_node){
    this["len"] = _len || 10;
    this["k"] = _k || 1;
    this["node"] = _node || [];
    this.draw = function(ctx) {
        if (this.node.length == 2){
            ctx.set
            ctx.beginPath();
            ctx.moveTo(this.node[0].location.x,this.node[0].location.y);
            ctx.lineTo(this.node[1].location.x,this.node[1].location.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function Ball(_x,_y,_state,_link){
    this.type = goo;
    this.location = {"x":_x || 0, "y": _y || 0};
    this.state =_state || "fixed";
    this.link = _link || [];
    this.connect = function( _len,_k,_ball1,_ball2){
        if (!_ball2) { _ball2 = this; }
        var tmp = new Link(_len,_k,[ _ball1, _ball2 ]);
        _ball1.link.push(tmp);
        _ball2.link.push(tmp);
        links.push(tmp);
    };
    this.draw = function(ctx){
        ctx.drawImage(this.type.img,this.location.x-this.type.r,this.location.y-this.type.r,this.type.size,this.type.size);
    }
}


var balls = [];
var links = [];

function init(){
    balls.push( new Ball(10,10,"fixed") );
    balls.push( new Ball(10,40,"fixed") );
    balls.push( new Ball(36,25,"fixed") );
    balls.push( new Ball(40,40,"active") );

    balls[0].connect(10,1,balls[1]);
    balls[1].connect(10,1,balls[2]);
    balls[2].connect(10,1,balls[0]);
    setInterval(draw,10);
}

function draw(){
    ctx.clearRect(0,0,800,600);
    for (var x in balls){
        balls[x].draw(ctx);
    }
    for (var x in links){
        links[x].draw(ctx);
    }
}

function getPointOnCanvas( e ) {
    var box =canvas.getBoundingClientRect();
    return {
        x: e.clientX - box.left ,
        y: e.clientY - box.top
    };
}

function showCanLink(y) {
    for (var x in balls){
        if (balls[x].state == "fixed" && && (dist(balls[x].location,balls[y].location) <=balls[y].type.r)){

        }
    }
}

function sqr(x) { return x*x; }

function dist(a,b){
    return Math.sqrt(sqr(a.x- b.x) + sqr(a.y - b.y));
}

var nowSelect = -1;

function mouseDown( e ){
    var pos = getPointOnCanvas(e);
    for (var x in balls){
        if (balls[x].state == "active" && (dist(balls[x].location,pos) <=balls[x].type.r) ) {
            nowSelect = x;
            console.log("now select:" + x);
            break;
        }
    }
}

function mouseMove( e ){
    var pos = getPointOnCanvas(e);
    if (nowSelect != -1){
        balls[nowSelect].location = pos;
        showCanLink(nowSelect);
    }
}

function mouseUp( e ){
    var pos =getPointOnCanvas( e );
    nowSelect = -1;
}

canvas.addEventListener("mousedown",mouseDown);
canvas.addEventListener("mousemove",mouseMove);
canvas.addEventListener("mouseup",mouseUp);
