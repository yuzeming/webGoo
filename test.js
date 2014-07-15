var goo = {
    url:  "ball.png",
    size: 32,
    r: 16,
    maxlen: 200,
    minlen: 30,
    maxlink: 2
};

var spring = {
    url: "spring.png",
    width:32
};

var ground = 500;

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
    this.len = Math.max(dist(_ball1,_ball2),goo.minlen);
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
    }

}

var balls = [];
var links = [];

function init() {
    balls.push(new Ball(200, 200, "fixed"));
    balls.push(new Ball(200, 400, "fixed"));
    balls.push(new Ball(373, 250, "fixed"));

    for (var x = 0; x < 50; ++x) {
        balls.push(new Ball(600+x*20, 600+x*20, "active"));
    }

    balls[0].connect(balls[1]);
    balls[1].connect(balls[2]);
    balls[2].connect(balls[0]);
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
            if (dist(tmp_links[0],tmp_links[1]) <= goo.maxlen && dist(tmp_links[0],tmp_links[1])*1.2>=dist(tmp_links[0],b)+dist(tmp_links[1],b) ) {
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
    if (this.x.state == "active") {
        now_select = this.x;
    }
});

$("#gamebox").on("mousemove",function(e) {
    if (now_select){
        now_select.location = {"x": e.clientX,"y":e.clientY};
        showCanLink(now_select);
    }
});

$("#gamebox").on("mouseup",function(e) {

    if (now_select && tmp_links.length == 2){
        $("div.spring_x").remove();
        if (tmp_links.beLink){
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

    now_select = null;
});

var inertia = 0.8;
var MAXSPEED = 100;

function physics(){
    for (var x in balls){
        if (balls[x]!=now_select){
        var tmp = balls[x];
        var loc = tmp.location;
        tmp.speed.x= Math.max(Math.min(tmp.speed.x,MAXSPEED),-MAXSPEED);
        tmp.speed.y= Math.max(Math.min(tmp.speed.y,MAXSPEED),-MAXSPEED);
        if (tmp.location.y == ground+goo.r && sqr(tmp.speed.x) + sqr(tmp.speed.y) < 10000){
            tmp.speed.x=0;
            tmp.speed.y=0;
        }
        tmp.location = {"x":loc.x+tmp.speed.x,
                      "y":Math.min(loc.y + tmp.speed.y , ground+goo.r)};
    }}

    for (var x=0;x<balls.length;++x) {

        var tmp1 = balls[x];
        tmp1.speed.x *= inertia;
        tmp1.speed.y *= inertia;
        tmp1.speed.y += 3;
         if (balls[x].state == "fixed") {
             for (var y in tmp1.link) {
                var tmp2 = tmp1.link[y].node[0];
                if (tmp2 == tmp1){
                    tmp2 = tmp1.link[y].node[1];
                }
                var d = dist(tmp1, tmp2);
                var dx = tmp2.location.x - tmp1.location.x;
                var dy = tmp2.location.y - tmp1.location.y;
                var v = 0;
                if (d < 2 * goo.r) {
                    v = (2 * goo.r - d) / d;
                }
                var tmplink = tmp1.hasLinkto(tmp2);
                if (tmplink) {
                    v -= 0.5 * (d - tmplink.len) / tmplink.len;
                }
                tmp1.speed.x -= dx * v;
                tmp1.speed.y -= dy * v;
            }
        }
    }
}

init();
setInterval(physics,30);
