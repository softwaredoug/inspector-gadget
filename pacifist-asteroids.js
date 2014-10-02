'use strict';

/*jshint camelcase: false*/
/*global d3,alert*/
var Space = function(params /*{width, height}*/, sel) {
  this.width = params.width;
  this.height = params.height;

  this.asteroids = [];

  this.vis = d3.select(sel)
    .append('svg:svg')
    .attr('width', this.width)
    .attr('height', this.height);
};

Space.prototype.add = function(body) {
  var pointStr = '';
  for(var i = 0; i < body.x_points.length; i++) {
    pointStr+= body.x_points[i]+',' + body.y_points[i]+' ';
  }
  body.set_shape(this.vis.append('svg:polygon').attr('points',pointStr));
};

Space.prototype.add_spaceship = function(spaceship) {
  this.spaceship = spaceship;
  this.add(spaceship);
};

Space.prototype.add_asteroid = function(asteroid) {
  this.asteroids.push(asteroid);
  this.add(asteroid);
};

Space.prototype.simulate = function(delta_time) {
  var space = this;

  var hasCrashed = false;

  var refresh = function() {
    for(var i in space.asteroids) {
      if(space.asteroids[i].collidesWith(space.spaceship) && !hasCrashed ) {
        hasCrashed = true;
      }
    }

    var bodies = [].concat(space.asteroids);
    bodies.push(space.spaceship);
    for(i in bodies) {
      var body = bodies[i];
      body.integrate(delta_time);
      body.redraw();

      //clamp
      if( body.y > space.height ) {
        body.y = 0;
      } else if ( body.y < 0 ) {
        body.y = space.height;
      }
      if( body.x > space.width ) {
        body.x = 0;
      } else if (body.x < 0 ) {
        body.x = space.width;
      }
    }
  };
  setInterval(refresh, delta_time);
};

var Body = function(params /*{x,y,vx,vy,theta,yaw,x_points,y_points}*/) {
  this.x = params.x;
  this.y = params.y;
  this.vx = params.vx;
  this.vy = params.vy;
  this.theta = params.theta;
  this.yaw = params.yaw;
  this.x_points = params.x_points;
  this.y_points = params.y_points;
};

Body.prototype.set_shape = function(shape) {
  this.body = shape;
};

Body.prototype.integrate = function(delta_time) {
  this.theta += this.yaw*delta_time;
  this.x += this.vx*delta_time;
  this.y += this.vy*delta_time;
};

Body.prototype.redraw = function() {
  this.body
  .data([this])
  .attr('transform', function(d) { return 'translate('+ d.x +' '+ d.y +') rotate(' + d.theta + ' 0 0)';});
};

Body.prototype.getConvexHull = function() {
  var x = [];
  var y = [];
  for(var i in this.x_points) {
    x[i] = this.x + this.x_points[i];
    y[i] = this.y + this.y_points[i];
  }
  return {x:x, y:y};
};

Body.prototype.collidesWith = function(otherBody) {
  var otherHull = otherBody.getConvexHull();
  var thisHull = this.getConvexHull();
  var l = thisHull.x.length;
  var dot_prod;

  for(var i = 0; i < otherHull.x.length; i++) {
    var otherPoint = [otherHull.x[i],otherHull.y[i]];
    for(var j = 0; j < l; j++) {
      var this_point = [thisHull.y[(j+1)%l]-thisHull.y[j],-thisHull.x[(j+1)%l]+thisHull.x[j]];
      var that_point = [otherPoint[0]-thisHull.x[j],otherPoint[1]-thisHull.y[j]];
      dot_prod = this_point[0]*that_point[0] + this_point[1]*that_point[1];
      if(dot_prod>0) {
        break;
      }
    }
    if(dot_prod<0) {
      return true;
    }
  }
  
  return false;
};

var Spaceship = function(params /*{x,y,size}*/) {
  Body.call(this,
    {space: params.space,
      x: params.x,
      y: params.y,
      vx: 0,
      vy: 0,
      theta: 0,
      yaw: 0,
      x_points: [-params.size,-params.size,2*params.size],
      y_points: [-params.size,params.size,0]
    }
  );
  //state
  var _this = this;
  this.thrust = 0; //1 = forward, -1 = backward
  this.turn = 0; //1 = right, -1 = left

  //params
  this.turn_per_milli = 0.1;
  this.thrust_per_milli = 0.00005;
  this.key_delay = 50;

  window.onkeydown = function(e) {
   var key = e.keyCode;
    switch(key){
      case 68://d = yaw left
        _this.turn = 1;
      break;
      case 65://a = yaw right
        _this.turn = -1;
      break;
      case 87://w = forward
        _this.thrust = 1;
      break;
      case 83://s = backward
        _this.thrust = -1;
      break;
    }
  };

  window.onkeyup = function(e) {
    var key = e.keyCode;
    switch(key){
      case 65://a = yaw left
        _this.turn = 0;
      break;
      case 68://d = yaw right
        _this.turn = 0;
      break;
      case 87://w = forward
        _this.thrust = 0;
      break;
      case 83://s = backward
        _this.thrust = 0;
      break;
    }
  };
};
Spaceship.prototype = Object.create( Body.prototype );


Spaceship.prototype.integrate = function(delta_time) {
  var deg2rad = Math.PI/180;
  var del_vx, del_vy;
  if(this.turn) {
    this.theta = this.theta + this.turn*this.turn_per_milli*delta_time;
  }
  if(this.thrust) {
    var del_v = this.thrust*this.thrust_per_milli*delta_time;
    del_vx = del_v*Math.cos(this.theta*deg2rad);
    del_vy = del_v*Math.sin(this.theta*deg2rad);
  } else {
    del_vx = 0;
    del_vy = 0;
  }
  this.vx = this.vx + del_vx;
  this.vy = this.vy + del_vy;

  Body.prototype.integrate.call(this,delta_time);
};




var Asteroid = function(params /*{x,y,vx,vy,size}*/) {
  var angles = [0,0.7,2,3.5,4,5];
  var x_points = [];
  var y_points = [];
  for(var a in angles) {
    x_points.push(Math.cos(a)*params.size);
    y_points.push(Math.sin(a)*params.size);
  }
  Body.call(this,
    {space: params.space,
      x: params.x,
      y: params.y,
      vx: params.vx,
      vy: params.vy,
      theta: 0,
      yaw: 0.2*(Math.random()-0.5),
      x_points: x_points,
      y_points: y_points
    }
  );
};
Asteroid.prototype = Object.create( Body.prototype );



var Game = function(sel) {

  var space = new Space({width:400, height:250}, sel);
  //TODO the Bodies have to know how big Space is. this shouldn't be necessary.
  space.add_spaceship(new Spaceship({x:200,y:200,size:7}));
//  space.add_asteroid(new Asteroid({x:100,y:100,vx:0.0,vy:0.0,size:27}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));
  space.add_asteroid(new Asteroid({    x:Math.random()*401,    y:Math.random()*220,    vx:Math.random()*0.1-0.05,    vy:Math.random()*0.1-0.05,size:Math.random()*30+10}));

  var delta_time = 60;
  space.simulate(delta_time);
};

angular.module('myApp')
.directive('pacifistAsteroids', function() {
  var id = 0;
  return {
    restrict: 'E',
    template: '<div class="asteroids"></div>',
    link: function(scope, elm) {
      var sel = 'asteroids-' + id++;
      elm.addClass(sel);
      elm.g = new Game('.' + sel);
      elm.removeClass(sel);
    }
  };

});
