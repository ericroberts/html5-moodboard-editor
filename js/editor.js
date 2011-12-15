$(function() {
  
  document.addEventListener('touchend', editor.touchend, false);
  
  var scale_one = Math.abs((editor.window.height-100)/editor.defaults.height);
  var scale_two = Math.abs((editor.window.width-100)/editor.defaults.width);
  
  var zoom = Math.min(scale_one,scale_two);
  
  if(zoom > 1) {
    zoom = 1;
  } 
  
  $.get("/boards/1.txt", function(data) {
    editor.currentboard = data;
    $.each(data.olioboard.object, function(i, object) {
      
      var baseX = editor.window.width/2;
      var baseY = editor.window.height/2;
      
      // Create image and set styles using image data
      var obj = document.createElement('div');
      obj.setAttribute('id', object.id);
      obj.setAttribute('class', 'object');
      
      var img = $('<img src="http://items.olioboard.com.s3.amazonaws.com/' + object.id + '_400x400.jpg" />');
      img.css({
        width: 400*object.media.scale*zoom,
        height: 400*object.media.scale*zoom,
        top: -(400*object.media.scale*zoom)/2,
        left: -(400*object.media.scale*zoom)/2
      });
      
      $(obj).css({
        left: baseX + object.x*zoom,
        top: baseY + object.y*zoom,
        webkitTransform: "rotate("+object.media.rotation+"deg)",
      }).data("object",object).append(img);
      
      // Add touch events
      obj.addEventListener('touchmove', editor.touchmove, false);
      obj.addEventListener('gesturestart', editor.gesture, false);
      obj.addEventListener('gesturechange', editor.gesturechange, false);
      obj.addEventListener('gestureend', editor.gestureend, false);
      obj.addEventListener('touchstart', editor.touch, false);

      // Finally, append the image to the canvas
      $("#canvas").append(obj);
    });
  },"json");
  
});

$(window).resize(function() {
  editor.window = {
    width: $(window).width(),
    height: $(window).height()
  };
  /*
  $("#canvas img").each(function() {
    var baseX = editor.window.width/2;
    var baseY = editor.window.height/2;
    var object = $(this).data("object");
    
    $(this).css({
      left: baseX + object.x - (400*object.media.scale)/2,
      top: baseY + object.y - (400*object.media.scale)/2
    });
  });
  */
});

var editor = {
  defaults: {
    width: 1960,
    height: 1440
  },
  events: {
    dragging: false,
    sizing: false,
    rotating: 0
  },
  window: {
    width: $(window).width(),
    height: $(window).height()
  },
  touch: function(event) {
    var touch = event.changedTouches[0];
    $(".object").removeClass("active");
    $(this).addClass("active");
    if(!editor.events.dragging){
      editor.events.dragging = [touch.pageX - parseInt(this.style.left), touch.pageY - parseInt(this.style.top)];
    }
  },
  touchend: function(evt) {
    editor.events.dragging = false;
  },
  touchmove: function(event) {
    if($(this).hasClass("active")) {
      event.preventDefault();

      var touch = event.changedTouches[0];
      if(editor.events.dragging && !editor.events.sizing) {
        this.style.left = touch.pageX - editor.events.dragging[0] + "px";
        this.style.top = touch.pageY - editor.events.dragging[1] + "px";
      }
    }
  },
  gesture: function(event) {
    if($(this).hasClass("active")) {
      editor.events.sizing = [parseInt($(this).find("img").width()), parseInt($(this).find("img").height())];
    }
  },
  gesturechange: function(event) {
    if($(this).hasClass("active")) {
      if(editor.events.sizing){
        $(this).find("img").width(Math.min(editor.events.sizing[0] * event.scale, 600) + "px")
          .height(Math.min(editor.events.sizing[1] * event.scale, 600) + "px")
          .css({
            top: -$(this).find("img").height()/2,
            left: -$(this).find("img").width()/2
          });
        this.style.webkitTransform = "rotate(" + ((editor.events.rotating + event.rotation) % 360) + "deg)";
      }
    }
  },
  gestureend: function(event) {
    if($(this).hasClass("active")) {
      editor.events.sizing = false;
      editor.events.rotating = (editor.events.rotating + event.rotation) % 360;
    }
  }
};

if (typeof console == 'undefined'){
  console = {};
  console.log = function(m){};
  console.error = function(m){};
}