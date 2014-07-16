var goo = {
    url:  "ball.png",
    size: 32,
    r: 16,
    maxlen: 200,
    minlen: 50,
    maxlink: 2
};

var spring = {
    url: "spring.png",
    width:32
};

var ground = 3000;

function sqr(x) { return x*x; }

function dist(a,b){
    if (a instanceof Ball) { a = a.location }
    if (b instanceof Ball) { b = b.location }
    return Math.sqrt(sqr(a.x- b.x) + sqr(a.y - b.y));
}

function DomDiv(_class) {
    var ret = document.createElement("div");
    if (_class){
        ret.classList.add(_class)
    }
    var gamebox = document.getElementById("gamebox").appendChild(ret);
    return ret;
}

function Link(_ball1,_ball2,_class){
    this.node = [_ball1,_ball2];
    this.len = Math.max(dist(_ball1,_ball2)-1,goo.minlen);
    this.dom = new DomDiv(_class||"spring");
    this.dom.x=this;
    this.update = function(){
        if (this.node.length!=2){
            return null;
        }

        var a = this.node[0].location, b = this.node[1].location;

        var h = dist(a,b)-4;
        var w = 16;

        this.dom.style["height"] = h + "px";
        var val = {
            x : ( a.x + b.x - w + 4) / 2,
            y : ( a.y + b.y - h + 4) / 2
        };
        var deg =- Math.atan2(a.x - b.x, a.y - b.y)*180/Math.PI;
        this.dom.style["-webkit-transform"] = "translate("+val.x+"px,"+val.y+"px) rotate("+deg+"deg)";
    };
    if (this.node.length == 2){
        this.update();
    }
}

function Ball(_x,_y,_state,_link){

    this.dom = new DomDiv("ball");
    this.dom.x=this;

    this.__defineSetter__("location",function(val){
        val.x = Math.max(Math.min(val.x,3000),0);
        val.y = Math.max(Math.min(val.y,3000),0);
        this._location = val;
        this.dom.style["-webkit-transform"] = "translate("+(val.x-16)+"px,"+(val.y-16)+"px)";
        for (var x in this.link){
            this.link[x].update();
        }
    });

    this.__defineGetter__("location",function(){return this._location;});

    this.location = {"x":_x || 0, "y": _y || 0};
    this.speed = {"x":0,"y":0};
    this.state =_state || "fixed";
    this.link = _link || [];
    this.connect = function(_ball1,_ball2){
        if (!_ball2) { _ball2 = this; }
        var tmp = new Link( _ball1, _ball2 );
        _ball1.link.push(tmp);
        _ball2.link.push(tmp);
        links.push(tmp);
        tmp.update();
    };

    this.hasLinkto = function(_ball1,_ball2){
        if (!_ball2) { _ball2 = this; }
        for (var x in _ball2.link){
            if (_ball2.link[x].node[0] == _ball1 || _ball2.link[x].node[1] == _ball1){
                return _ball2.link[x];
            }
        }
        return false;
    };

    this.walk = function(){
        if (this.state=="active" && this.location.y == ground &&(Math.random()<0.1||this.speed.x==0)){
           this.speed.x =(Math.random ()*3+1) * ((1500 - this.location.x)>0?1:-1);
        }
    };

    this.stop = false;

}

var balls = [];
var links = [];

function init() {
    $("div.ball").remove();
    $("div.spring").remove();
    balls = [];
    links = [];
    balls.push(new Ball(1500, 2826.8, "fixed"));
    balls.push(new Ball(1400, 3000, "fixed"));
    balls.push(new Ball(1600, 3000, "fixed"));

    for (var x = 0; x < 20; ++x) {
        balls.push(new Ball(600+x*40, 2600, "active"));
    }

    //balls.push(new Ball(1500,2600,"active"));

    balls[0].connect(balls[1]);
    balls[1].connect(balls[2]);
    balls[2].connect(balls[0]);
    window.scrollTo(1500,3000);
}

var tmp_links = [];

function showCanLink( b ) {
    tmp_links = [];
    for (var x in balls){
        if (balls[x].state=="fixed" && dist(b, balls[x]) <= goo.maxlen){
            var tmp = balls[x];
            var tmp_dist = dist(tmp, b);
            for (var y=0;y<goo.maxlink&&tmp!=null;++y){
                if (tmp_links[y]==null || tmp_dist < dist(tmp_links[y],b) ){
                    var t = tmp_links[y] || null;
                    tmp_links[y] = tmp;
                    tmp = t;
                    if (t) {
                        tmp_dist = dist(tmp, b);
                    }
                }
            }
        }
    }

    $("div.spring_x").remove();

    if (tmp_links.length > 1) {
        if (tmp_links[0].hasLinkto(tmp_links[1])) {
            if (dist(tmp_links[0],tmp_links[1])*1.05<dist(tmp_links[0],now_select)+dist(tmp_links[1],now_select)){
                for (var x in tmp_links) {
                    new Link(tmp_links[x], b, "spring_x");
                    tmp_links.beLink = false;
                }
            } else {
                tmp_links = [];
                tmp_links.beLink = false;
            }
        } else {
            if (dist(tmp_links[0],tmp_links[1]) <= goo.maxlen*1.5 && dist(tmp_links[0],tmp_links[1])*1.2>=dist(tmp_links[0],b)+dist(tmp_links[1],b) ) {
                new Link(tmp_links[0], tmp_links[1], "spring_x");
                tmp_links.beLink = true;
            } else {
                tmp_links = [];
                tmp_links.beLink = false;
            }
        }
    }
    b.dom.style["display"] = tmp_links.beLink?"none":"block";
}

var now_select = null;

$("#gamebox").on("mousedown","div.ball",null,function(e) {
    if (this.x.state != "fixed") {
        now_select = this.x;
    }
});

var mouse_pos = null;

$("#gamebox").on("mousemove",function(e) {
    mouse_pos = e;
    if (now_select){
        now_select.location = {"x": e.clientX+window.pageXOffset,"y":e.clientY+window.pageYOffset};
        showCanLink(now_select);
    }
});

var disable_mouseover = false;

$("#gamebox").on("mouseup",function(e) {

    if (now_select){
        if (tmp_links.length == 2) {
            $("div.spring_x").remove();
            if (tmp_links.beLink) {
                tmp_links[0].connect(tmp_links[1]);
                now_select.state = "hide";

            } else {
                for (var x = 0; x < tmp_links.length; ++x) {
                    now_select.connect(tmp_links[x]);
                }
                now_select.state = "fixed";

            }
        } else {
            now_select.state = "active";

        }
    }
    now_select.stop = false;
    now_select.dom.classList.remove("hover");
    now_select = null;
    disable_mouseover = true;

    setTimeout(function(){disable_mouseover = false},200);
});

$("#gamebox").on("mouseout",function(){
   mouse_pos = null;
});

$("#gamebox").on("mouseover","div.ball",function(){
    if (disable_mouseover) return ;
    var b = this.x;
    if (b.state !="fixed") {
        b.stop = true;
        this.classList.add("hover");
    }
});

$("#gamebox").on("mouseout","div.ball",function(){
    var b = this.x;
    b.stop = false;
    this.classList.remove("hover");

});

var inertia = 0.6;

var max_height = 0;

var center_x = 0;
var center_y = 0;
var center_tmp = 0;

var MAXSPEED = 1;

var walk_speed = 2;

function physics(){
    max_height = 0;
    center_x = 0;center_y=0;center_tmp=0;
    for (var x in balls){
        if (balls[x]!=now_select && !balls[x].stop){
            var tmp = balls[x];
            var loc = tmp.location;
            if (tmp.state == "fixed") {
                if (tmp.location.y == ground && sqr(tmp.speed.x) + sqr(tmp.speed.y) <= 610){
                    tmp.speed.x=0;
                    tmp.speed.y=0;
                }
                tmp.speed.x = Math.max(Math.min(tmp.speed.x, MAXSPEED), -MAXSPEED);
                tmp.speed.y = Math.max(Math.min(tmp.speed.y, MAXSPEED), -MAXSPEED);

                if (Math.abs(tmp.speed.y)<0.3) tmp.speed.y=0;
                if (Math.abs(tmp.speed.x)<0.3) tmp.speed.x=0;
                tmp.location = {"x":loc.x+tmp.speed.x,
                          "y":Math.min(loc.y + tmp.speed.y , ground)};
            }

            if (tmp.state == "onspring"){
                var dx = tmp.spring.node[1].location.x - tmp.spring.node[0].location.x;
                var dy = tmp.spring.node[1].location.y - tmp.spring.node[0].location.y;
                loc.x = tmp.spring.node[0].location.x + dx * tmp.k;
                loc.y = tmp.spring.node[0].location.y + dy * tmp.k;
                tmp.location = loc;
            }

            if (tmp.state == "active"){
                tmp.location = {"x":loc.x+tmp.speed.x,
                          "y":Math.min(loc.y + tmp.speed.y , ground)};
            }
        max_height=Math.max(max_height, (ground-tmp.location.y));
         }
    }
    $("#max_height").html ( "当前高度:<b>" + Math.round(max_height/10) / 10) +"米</b>";

    for (var x=0;x<balls.length;++x) {
        var tmp1 = balls[x];
        if (tmp1.stop) {continue;}
         if (tmp1.state == "fixed") {
             for (var y in tmp1.link) {
                var tmp2 = tmp1.link[y].node[0];
                if (tmp2 == tmp1){
                    tmp2 = tmp1.link[y].node[1];
                }

                var d = dist(tmp1, tmp2);
                var dx = tmp2.location.x - tmp1.location.x;
                var dy = tmp2.location.y - tmp1.location.y;
                var v = 0;
                var tmplink = tmp1.hasLinkto(tmp2);
                if (tmplink) {
                        v -= 1.7 * (d - tmplink.len) / tmplink.len;
                }
                tmp1.speed.x -= dx * v;
                tmp1.speed.y -= dy * v;

            }
            tmp1.speed.x *= inertia;
            tmp1.speed.y *= inertia;
            tmp1.speed.y += 5;
        }
        if (tmp1.state == "active"){
            for (var y=0;y<balls.length;++y){
                if (x!=y&&balls[y].state == "active"){
                    var tmp2 = balls[y];
                    var d = dist(tmp1, tmp2);
                    var dx = tmp2.location.x - tmp1.location.x;
                    var dy = tmp2.location.y - tmp1.location.y;
                    var v = 0;
                    if (d< 2 * goo.r){
                        v = (2 * goo.r - d) / d / 2;
                    }
                    tmp1.speed.x -= dx * v;
                    tmp1.speed.y -= dy * v;

                }
            }

            if (tmp1.location.y == ground){
                for (var y=0;y<links.length;++y){
                    if (Math.abs(dist(tmp1,links[y].node[0]) + dist(tmp1,links[y].node[1]) -dist(links[y].node[0],links[y].node[1])) < 10){
                        var len = dist(links[y].node[0],links[y].node[1]);
                        tmp1.state = "onspring";
                        tmp1.spring = links[y];
                        tmp1.fx =  walk_speed / len * (Math.random() <0.5 ? 1:-1);
                        tmp1.k = dist(tmp1,links[y].node[0]) / len;
                        break;
                    }
                }
            }
            tmp1.speed.y += 0.1;
        }
        if (tmp1.state == "onspring"){
            tmp1.k += tmp1.fx;
            if (tmp1.k<=0){
                randSelectLink(tmp1.spring.node[0],tmp1);
            } else if (tmp1.k>=1) {
                randSelectLink(tmp1.spring.node[1],tmp1);
            }
        }
    }

    if (now_select){
        now_select.speed.x = 0;
        now_select.speed.y = 0.5;
    }

}

function randSelectLink(fnode,wnode){
    var link = fnode.link[Math.floor(Math.random()*fnode.link.length)];
    wnode.spring = link;
    var len = dist(link.node[0],link.node[1]);
    if (link.node[0] == fnode){
        wnode.fx =  walk_speed / len;
        wnode.k = 0.01;
    } else {
        wnode.fx = -walk_speed / len;
        wnode.k = 0.99;
    }
}

function autoscroll(){
    var e = mouse_pos;
    if (!e) return ;
    if (e.clientX < 100){
        window.scrollTo(window.pageXOffset - 20,window.pageYOffset);
    }
    if (e.clientY < 100){
        window.scrollTo(window.pageXOffset,window.pageYOffset - 20);
    }
    if (e.clientX + 100 >window.innerWidth){
        window.scrollTo(window.pageXOffset + 20,window.pageYOffset);
    }
    if (e.clientY + 100 >window.innerHeight){
        window.scrollTo(window.pageXOffset, window.pageYOffset + 20);
    }

}

var bg2 = document.getElementById("bg2");
var bg3 = document.getElementById("bg3");


window.onscroll = function(){
    var _x = window.pageXOffset,_y = window.pageYOffset;
    bg2.style["-webkit-transform"] = "translate("+ - _x / 6+"px,"+  (3000-_y) / 6+"px)";
    bg3.style["-webkit-transform"] = "translate("+ - _x / 3+"px,"+  (3000-_y) / 3+"px)";
};

function makeBallJump() {
    for (var x=0;x<balls.length;++x){
        balls[x].walk();
    }
}

init();
setInterval(physics,20);
setInterval(autoscroll,20);
setInterval(makeBallJump,1000);

$("#coverClose").on("click",function(){
    $("#coverClose").hide();
    $("#coverOpen").show();
});


$("#coverOpen").on("click",function(){
    $("#coverOpen").hide();
    $("#coverClose").show();
});

$("#button").on("click",function(){
    $("#coverOpen").click();
    init();
});