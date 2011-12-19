$(function() {
  
  document.addEventListener('touchend', editor.touchend, false);
  
  var scale_one = Math.abs((editor.window.height-100)/editor.defaults.height);
  var scale_two = Math.abs((editor.window.width-100)/editor.defaults.width);
  editor.window.zoom = Math.min(scale_one,scale_two,1);
  
  $.get("/boards/1.txt", function(data) {
    editor.currentboard = data;
    $.each(data.olioboard.object, function(i, object) {
      editor.addObject(object);
    });
  },"json");
  
  $("#removebg").live("change", function() {
    
    var id = $(this).data("id"),
        canvas = document.getElementById('item_'+id),
        ctx = canvas.getContext('2d'),
        img = new Image(),
        object = $(canvas).data('object');
        
    img.src = '/images/items/'+id+'_400x400.jpg';
    
    if($(this).is(":checked")) {
      editor.removeColour(null,ctx,img);
      object.media.removed = "true";
    } else {
      img.onload = function() { ctx.drawImage(img, 0, 0, img.width, img.height); }
      object.media.removed = null;
    }
    
    $(canvas).data('object',object);
    
  });
  
});

$(window).resize(function() {
  editor.window = {
    width: $(window).width(),
    height: $(window).height()
  };
});

var editor = {
  removeColour: function(object,ctx,img,colour) {
    var imageData = ctx.getImageData(0,0,img.width,img.height);
    var pixel = imageData.data;
    var r = 0, g = 1, b = 2, a = 3;
    
    for(var p = 0; p < pixel.length; p+=4) {
      if((pixel[p+r] >= 250 && pixel[p+r] <= 255) && (pixel[p+g] >= 250 && pixel[p+g] <= 255) && (pixel[p+b] >= 250 && pixel[p+b] <= 255)) {
        pixel[p+a] = 0;
      }
    }
    ctx.putImageData(imageData,0,0);
  },
  addObject: function(object) {
    var base = {
      x: editor.window.width/2,
      y: editor.window.height/2
    }
    
    var img = new Image(),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        src = '/images/items/'+object.id+'_400x400.jpg';
        
    canvas.setAttribute('id','item_'+object.id);
    $(canvas).data('object',object);
  
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.width = img.width;
      ctx.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Remove the background if required
      if(object.media.removed == "true") {
        editor.removeColour(object,ctx,img);
      }
      
      $(canvas).css({
        width: 400*object.media.scale*editor.window.zoom,
        height: 400*object.media.scale*editor.window.zoom,
        top: base.y + object.y*editor.window.zoom,
        left: base.x + object.x*editor.window.zoom,
        webkitTransform: "rotate("+object.media.rotation+"deg)"
      });
      
      $(canvas).css({
        marginTop: -$(canvas).height()/2,
        marginLeft: -$(canvas).width()/2
      });
      
      // Add touch events
      canvas.addEventListener('touchmove', editor.touchmove, false);
      canvas.addEventListener('gesturestart', editor.gesture, false);
      canvas.addEventListener('gesturechange', editor.gesturechange, false);
      canvas.addEventListener('gestureend', editor.gestureend, false);
      canvas.addEventListener('touchstart', editor.touch, false);
      
      document.getElementById('canvas').appendChild(canvas);
    
    }
    
    img.src = src;
  },
  initToolbar: function(object) {
    $("#toolbar input").data("id",object.id);
    if(object.media.removed == "true") {
      $("#removebg").attr("checked","checked");
    } else {
      $("#removebg").removeAttr("checked");
    }
  },
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
    
    $(".active").removeClass("active");
    $(this).addClass("active");
    $("#toolbar").fadeIn();
    
    if(!editor.events.dragging){
      editor.events.dragging = [touch.pageX - parseInt(this.style.left), touch.pageY - parseInt(this.style.top)];
    }
    
    // Setup toolbar
    editor.initToolbar($(this).data('object'));
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
      editor.events.sizing = [parseInt($(this).width()), parseInt($(this).height())];
    }
  },
  gesturechange: function(event) {
    if($(this).hasClass("active")) {
      if(editor.events.sizing){
        $(this).width(Math.min(editor.events.sizing[0] * event.scale, 600) + "px")
          .height(Math.min(editor.events.sizing[1] * event.scale, 600) + "px")
          .css({
            marginTop: -$(this).width()/2,
            marginLeft: -$(this).height()/2,
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