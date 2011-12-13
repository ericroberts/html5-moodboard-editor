$(function() {
  
  document.addEventListener('touchend', editor.touchend, false);
  
  $.get("/boards/1.txt", function(data) {
    editor.currentboard = data;
    $.each(data.olioboard.object, function(i, object) {
      
      var baseX = $(window).width()/2;
      var baseY = $(window).height()/2;
      
      // Create image and set styles using image data
      var obj = document.createElement('img');
      obj.setAttribute('src', 'http://items.olioboard.com.s3.amazonaws.com/' + object.id + '_400x400.jpg');
      
      $(obj).css({
        position: "absolute",
        left: baseX + object.x - (400*object.media.scale)/2,
        top: baseY + object.y - (400*object.media.scale)/2,
        webkitTransform: "rotate("+object.media.rotation+"deg)",
        width: 400*object.media.scale,
        height: 400*object.media.scale
      }).data("object",object);
      
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
  $("#canvas img").each(function() {
    var baseX = $(window).width()/2;
    var baseY = $(window).height()/2;
    var object = $(this).data("object");
    
    $(this).css({
      left: baseX + object.x - (400*object.media.scale)/2,
      top: baseY + object.y - (400*object.media.scale)/2
    });
  });
});

var editor = {
  events: {
    dragging: false,
    sizing: false,
    rotating: 0
  },
  touch: function(event) {
    var touch = event.changedTouches[0];
    var imgs = document.getElementsByTagName("img");
    for(i=0;i<imgs.length;i++) {
      imgs[i].className = "";
    }
    this.className = "active";
    if(!dragging){
      editor.events.dragging = [touch.pageX - parseInt(this.style.left), touch.pageY - parseInt(this.style.top)];
    }
  },
  touchend: function(evt) {
    editor.events.dragging = false;
  },
  touchmove: function(event) {
    event.preventDefault();

    var touch = event.changedTouches[0];
    if(editor.events.dragging && !editor.events.sizing) {
      this.style.left = touch.pageX - dragging[0] + "px";
      this.style.top = touch.pageY - dragging[1] + "px";
    }
  },
  gesture: function(event) {
    if (this.className == "active") {
      editor.events.sizing = [parseInt(this.style.width), parseInt(this.style.height)];
    }
  },
  gesturechange: function(event) {
    if(this.className == "active") {
      if(editor.events.sizing){
        this.style.width = Math.min(sizing[0] * event.scale, 600) + "px";
        this.style.height = Math.min(sizing[1] * event.scale, 600) + "px";
        this.style.webkitTransform = "rotate(" + ((rotating + event.rotation) % 360) + "deg)";
      }
    }
  },
  gestureend: function(event) {
    if (this.className == "active") {
      editor.events.sizing = false;
      editor.events.rotating = (rotating + event.rotation) % 360;
    }
  }
};

if (typeof console == 'undefined'){
  console = {};
  console.log = function(m){};
  console.error = function(m){};
}