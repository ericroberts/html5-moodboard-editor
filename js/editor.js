$(function() {
  
  document.addEventListener('touchend', editor.touchend, false);
  
  var scale_one = Math.abs((editor.window.height-100)/editor.defaults.height);
  var scale_two = Math.abs((editor.window.width-100)/editor.defaults.width);
  editor.window.zoom = Math.min(scale_one,scale_two,1);
  
  
  $("#bg_tolerance").touchSlider({
    value: 5
  });
  $("#bg_feather").touchSlider({
    value: 2
  });
  
  $.get("/boards/1.txt", function(data) {
    editor.currentboard = data;
    $.each(data.olioboard.object, function(i, object) {
      editor.addObject(object);
    });
  },"json");
  
  $("#removebg").live("change", function() {
    
    var data = editor.getCanvas($("#toolbar").data('id'));
    if($(this).is(":checked")) {
      data.img.onload = function() { editor.removeColour(data.ctx,data.img); }
      data.object.media.removed = "true";
    } else {
      data.img.onload = function() { data.ctx.drawImage(data.img, 0, 0, data.img.width, data.img.height); }
      data.object.media.removed = null;
    }
    
    $(canvas).data('object',data.object);
    
  });
  
  $("#advanced_bg").live("click", function() {
    editor.advancedBG(editor.getCanvas($("#toolbar").data('id')));
    return false;
  });
  
  $("#bg_tolerance").change(function() {
    if($("#removebg").is(":checked")) {
      var data = editor.getCanvas($("#toolbar").data('id'));
      data.ctx.drawImage(data.img, 0, 0, data.img.width, data.img.height);
      var f = $("#bg_feather").val() ? parseInt($("#bg_feather").val(),10) : null;
      editor.removeColour(data.ctx,data.img,parseInt($("#bg_tolerance").val(),10),f);
    }
  });
  
  $("#bg_feather").change(function() {
    if($("#removebg").is(":checked")) {
      var data = editor.getCanvas($("#toolbar").data('id'));
      data.ctx.drawImage(data.img, 0, 0, data.img.width, data.img.height);
      var t = $("#bg_tolerance").val() ? parseInt($("#bg_tolerance").val(),10) : null;
      editor.removeColour(data.ctx,data.img,t,parseInt($("#bg_feather").val(),10));
    }
  });
  
  $(".overlay_close").live("click", function() {
    editor.closeOverlay();
    return false;
  });
  
  $("canvas").live("click", function() {
    
    $(".active").removeClass("active");
    $(this).addClass("active");
    $("#toolbar").fadeIn();
    
    // Setup toolbar
    editor.initToolbar($(this).data('object'));
  });
  
});

$(window).resize(function() {
  editor.window = {
    width: $(window).width(),
    height: $(window).height()
  };
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
  closeOverlay: function() {
    $(".overlay,.overlay_close").fadeOut(300, function() {
      $(".overlay,.overlay_close").remove();
    });
    var object = $(".overlay_object").data('position');
    $(".overlay_object").animate({
      width: object['width'],
      height: object['height'],
      top: object['top'],
      left: object['left'],
      margin: ""
    },300).removeClass("overlay_object");
  },
  advancedBG: function(object) {
    $("body").prepend($("<div class='overlay'></div>").hide().fadeIn(300, function() { $("body").prepend($("<a href='#' class='overlay_close'>Close</a>").hide().fadeIn(300)); }));
    $(".bg_advanced").fadeIn(300);
    var el = $(object.canvas);
    $(object.canvas).data("position",{ left: parseInt(el.css("left"),10), top: parseInt(el.css("top"),10), width: el.width(), height: el.height() }).animate({
      width: 400,
      height: 400,
      top: editor.window.height/2,
      left: editor.window.width/2,
      marginTop: -200,
      marginLeft: -200
    },300).addClass("overlay_object");
  },
  getCanvas: function(id) {
    var data = {
      canvas: document.getElementById('item_'+id),
      img: new Image()
    }
    data.ctx = data.canvas.getContext('2d');
    data.object = $(data.canvas).data('object');
    data.img.src = editor.imgUrl(id);
    return data;
  },
  imgUrl: function(id) {
    return '/images/items/'+id+'_400x400.jpg';
  },
  removeColour: function(ctx,i,t,f) {
    
    if(!t && t != 0) { t = 5; }
    if(!f && f != 0) { f = 2; }
    
    var step = Math.round(255/f);
    
    var c = {
      r: 255,
      g: 255,
      b: 255
    }
    
    var imageData = ctx.getImageData(0,0,i.width,i.height);
    var pixel = imageData.data;
    var r = 0, g = 1, b = 2, a = 3;
    
    for(var p = 0; p < pixel.length; p+=4) {
      if((pixel[p+r] >= c.r-t && pixel[p+r] <= c.r+t) && (pixel[p+g] >= c.g-t && pixel[p+g] <= c.g+t) && (pixel[p+b] >= c.b-t && pixel[p+b] <= c.b+t)) {
        pixel[p+a] = 0;
      } else if((pixel[p+r] >= c.r-t-f && pixel[p+r] <= c.r+t+f) && (pixel[p+g] >= c.g-t-f && pixel[p+g] <= c.g+t+f) && (pixel[p+b] >= c.b-t-f && pixel[p+b] <= c.b+t+f)) {
        var diff = Math.abs(pixel[p+r] - c.r);
        pixel[p+a] = editor.getAlpha(diff,step);
      }
    }
    ctx.putImageData(imageData,0,0);
  },
  getAlpha: function(diff,step) {
    return diff*step;
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
        top: base.y + object.y*editor.window.zoom - (400*object.media.scale*editor.window.zoom)/2,
        left: base.x + object.x*editor.window.zoom - (400*object.media.scale*editor.window.zoom)/2,
        webkitTransform: "rotate("+object.media.rotation+"deg)"
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
    $("#toolbar").data("id",object.id);
    if(object.media.removed == "true") {
      $("#removebg").attr("checked","checked");
    } else {
      $("#removebg").removeAttr("checked");
    }
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
          .height(Math.min(editor.events.sizing[1] * event.scale, 600) + "px");
          
        $(this).css({
          top: this.style.top-($(this).height()-editor.events.sizing[1])/2,
          left: this.style.left-($(this).width()-editor.events.sizing[0])/2,
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