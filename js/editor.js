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
    for(var i = 0; i < data.olioboard.object.length; i++) {
      var object = data.olioboard.object[i];
      editor.addObject(object,i);
    }
  },"json");
  
  $("#rotation").live("keyup", function() {
    var deg = $(this).val();
    $(".active").css({
      webkitTransform: "rotate("+deg+"deg)"
    });
  });
  
  $(".duplicate").live("click", function() {
    var data = $(".active").data("object");
    var newobj = $.extend({},data);
    newobj.x = newobj.x+25;
    newobj.y = newobj.y+25;
    
    editor.addObject(newobj,Math.max.apply(Math,editor.items.indexes)+1);
    
    return false;
  });
  
  $(".remove").live("click", function() {
    if(confirm("Are you sure you want to remove?")) {
      $(".active").fadeOut(300, function() {
        $(".active").remove();
      });
    }
    return false;
  });
  
  $(".flip").live("click", function() {
    var object = $(".active").data("object");
    
    if($(".active").data("rotate")) { axis = $(".active").data("rotate"); } 
    else { axis = {x: 0, y: 0} }
    
    if(axis.y == 180) { axis.y = 0; } 
    else { axis.y = 180; }
    
    $(".active").css({
      webkitTransform: "rotate("+object.media.rotation+"deg) rotateX("+axis.x+"deg) rotateY("+axis.y+"deg) translate3d(0, 0, 0)",
      webkitTransition: "1s"
    }).data("rotate",{x: axis.x, y: axis.y});
    
    setTimeout(function() {
      $(".active").css("-webkit-transition-duration","0s");
    },100);
    /*
    var data = editor.getCanvas($(".active").data('ref'));
    data.ctx.translate(data.img.width, 0);
    data.ctx.scale(-1,1);
    data.ctx.drawImage(data.img, 0, 0);
    */
    return false;
  });
  
  $(".flop").live("click", function() {
    var object = $(".active").data("object");
    
    if($(".active").data("rotate")) { axis = $(".active").data("rotate"); } 
    else { axis = {x: 0, y: 0} }
    
    if(axis.x == 180) { axis.x = 0; } 
    else { axis.x = 180; }
    
    $(".active").css({
      webkitTransform: "rotate("+object.media.rotation+"deg) rotateX("+axis.x+"deg) rotateY("+axis.y+"deg)",
      webkitTransition: "1s"
    }).data("rotate",{x: axis.x, y: axis.y}).css("webkit-transition",0);
    
    setTimeout(function() {
      $(".active").css("-webkit-transition-duration","0s");
    },100);
    /*
    var data = editor.getCanvas($(".active").data('ref'));
    data.ctx.translate(0,data.img.height);
    data.ctx.scale(1,-1);
    data.ctx.drawImage(data.img, 0, 0);
    */
    return false;
  });
  
  $(".depth").live("click", function() {
    var curr = parseInt($(".active").data('z'),10);
    var max = Math.max.apply(Math,editor.items.indexes);
    
    if($(this).hasClass("front")) {      
      if(curr != max) {
        $("canvas:not(.active)").each(function() {
          if($(this).data('z') == curr+1) {
            $(this).data('z',curr);
            $(this).css("z-index",curr);
          }
        });
        $(".active").css("z-index",curr+1).data('z',curr+1);
      }
    }
    if($(this).hasClass("tofront")) {
      $("canvas:not(.active)").each(function() {
        var z = parseInt($(this).data('z'),10);
        if (z > curr) {
          $(this).css('z-index',z-1).data('z',z-1);
        }
      });
      $(".active").data('z',max).css("z-index",max);
    }
    if($(this).hasClass("back")) {
      if(curr != 0) {
        $("canvas:not(.active)").each(function() {
          if($(this).data('z') == curr-1) {
            $(this).data('z',curr);
            $(this).css("z-index",curr);
          }
        });
        $(".active").css("z-index",curr-1).data('z',curr-1);
      }
    }
    if($(this).hasClass("toback")) {
      $("canvas:not(.active)").each(function() {
        var z = parseInt($(this).data('z'),10);
        if(z < curr) {
          $(this).css('z-index',z+1).data('z',z+1);
        }
      });
      $(".active").css("z-index",0).data('z',0);
    }
    return false;
  });
  
  $("#lock_rotation").live("change", function() {
    var data = $(".active").data("object");
    if($(this).is(":checked")) {
      data.media.angleLock = 1;
    } else {
      data.media.angleLock = 0;
    }
  });
  
  $("#lock_scale").live("change", function() {
    var data = $(".active").data("object");
    if($(this).is(":checked")) {
      data.media.scaleLock = 1;
    } else {
      data.media.scaleLock = 0;
    }
  });
  
  $("#removebg").live("change", function() {
    
    var data = editor.getCanvas($(".active").data('ref'));
    if($(this).is(":checked")) {
      $("#advanced_bg").addClass("activated");
      $(".active").addClass("removed_bg");
      data.img.onload = function() { editor.removeColour(data.ctx,data.img); }
      data.object.media.removed = "true";
    } else {
      $("#advanced_bg").removeClass("activated");
      $(".active").removeClass("removed_bg");
      data.img.onload = function() { data.ctx.drawImage(data.img, 0, 0, data.img.width, data.img.height); }
      data.object.media.removed = null;
    }
    
    $(canvas).data('object',data.object);
    
  });
  
  $("#advanced_bg").live("click", function() {
    var data = editor.getCanvas($(".active").data('ref'));
    data.ctx.save();
    if($(this).hasClass("activated")) {
      editor.advancedBG(editor.getCanvas($(".active").data('ref')));
    }
    return false;
  });
  
  $("#bg_tolerance").change(function() {
    if($("#removebg").is(":checked")) {
      var data = editor.getCanvas($(".active").data('ref'));
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
  
  $(".cancel,.save").live("click", function() {
    
    var toolbar = $(this).closest(".toolbar");
    toolbar.animate({
      top: -100
    },300, function() {
      $("#toolbar").css("top",-100).show().animate({
        top: 0
      },300);
    });
    editor.closeOverlay();
    
    return false;
  });
  
  $(".overlay_close").live("click", function() {
    editor.closeOverlay();
    return false;
  });
  
});

$(window).resize(function() {
  editor.window = {
    width: $(window).width(),
    height: $(window).height()
  };
});

/*
window.onorientationchange = function() {
  var o = window.orientation;
  
  if (o != 90 && o != -90) {
    document.getElementsByTagName("body")[0].style.webkitTransform = "rotate(-90deg)";
  }
}
*/

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
  items: {
    order: [],
    indexes: []
  },
  id: {
    count: 0,
    get: function() {
      editor.id.count++; 
      return editor.id.count;
    }
  },
  window: {
    width: $(window).width(),
    height: $(window).height()
  },
  resetToolbar: function() {
    
  },
  closeOverlay: function() {
    $(".overlay,.overlay_close").fadeOut(300, function() {
      $(".overlay,.overlay_close").remove();
    });
    $(".checkerboard").remove();
    var object = $(".overlay_object").data('position');
    $(".overlay_object").animate({
      width: object['width'],
      height: object['height'],
      top: object['top'],
      left: object['left'],
      marginTop: 0,
      marginLeft: 0,
      zIndex: $(".overlay_object").data('z')
    },300,function() {
      $(this).css("margin","");
    }).removeClass("overlay_object");
    
    $(".toolbar:not(#toolbar)").animate({
      top: -100
    }, 300, function() {
      $("#toolbar").animate({
        top: 0
      },300);
    });
  },
  overlayCanvas: function(object) {
    $("body").prepend($("<div class='overlay'></div>").hide().fadeIn(300, function() { 
      $("body").prepend($("<a href='#' class='overlay_close'>Close</a>").hide().fadeIn(300)); 
      $("body").prepend($("<div class='checkerboard'></div>").css({
        top: editor.window.height/2,
        left: editor.window.width/2
      }).hide().fadeIn(300));
    }));
  },
  advancedBG: function(object) {
    editor.overlayCanvas(object);
    var el = $(object.canvas);
    $(object.canvas).data("position",{ left: parseInt(el.css("left"),10), top: parseInt(el.css("top"),10), width: el.width(), height: el.height() }).animate({
      width: 400,
      height: 400,
      top: editor.window.height/2,
      left: editor.window.width/2,
      marginTop: -200,
      marginLeft: -200,
      zIndex: 601
    },300).addClass("overlay_object");
    
    $("#toolbar").animate({
      top: -100
    },300, function() {
      $("#advancedbgremoval").css("top",-100).show().animate({
        top: 0
      },300);
    });
  },
  getCanvas: function(id) {
    var object = $("#item_"+id).data('object');
    var data = {
      canvas: document.getElementById('item_'+id),
      img: new Image()
    }
    data.ctx = data.canvas.getContext('2d');
    data.object = $(data.canvas).data('object');
    data.img.src = editor.imgUrl(object.id);
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
  addObject: function(object,i) {
    
    var refid = editor.id.get();
    editor.items.order.push({'id': object.id, 'index': i});
    editor.items.indexes.push(i);
    
    var base = {
      x: editor.window.width/2,
      y: editor.window.height/2
    }
    
    var img = new Image(),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        src = '/images/items/'+object.id+'_400x400.jpg';
        
    canvas.setAttribute('id','item_'+refid);
  
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
      }).data('object',object).css('z-index',i).data('z',i).data('ref',refid);
      
      document.getElementById("canvas_scale").appendChild(canvas);
      
      // Add touch events
      editor.addTouchListeners(refid);
      editor.addClickListeners(refid);
    }
    
    img.src = src;
  },
  addTouchListeners: function(id) {
    var canvas = document.getElementById('item_'+id);
    canvas.addEventListener('touchmove', editor.touchmove, false);
    canvas.addEventListener('gesturestart', editor.gesture, false);
    canvas.addEventListener('gesturechange', editor.gesturechange, false);
    canvas.addEventListener('gestureend', editor.gestureend, false);
    canvas.addEventListener('touchstart', editor.touch, false);
  },
  removeTouchListeners: function(id) {
    var canvas = document.getElementById('item_'+id);
    canvas.removeEventListener('touchmove', editor.touchmove, false);
    canvas.removeEventListener('gesturestart', editor.gesture, false);
    canvas.removeEventListener('gesturechange', editor.gesturechange, false);
    canvas.removeEventListener('gestureend', editor.gestureend, false);
    canvas.removeEventListener('touchstart', editor.touch, false);
  },
  addClickListeners: function(id) {
    $("#item_"+id).click(function() {
      editor.activateObject($(this));
    });
  },
  activateObject: function(canvas) {
    var object = canvas.data('object');
    $(".active").removeClass("active");
    canvas.addClass("active");
    editor.initToolbar(canvas.data('object'));
    
    $.get("items/items.json", function(data) {
      for(var i = 0; i < data.length; i++) {
        var item = data[i].item;
        if(item.id == object.id) {
          $("#item_details").animate({
            bottom: 0
          },300);
          $("#active_item_name").text(item.name);
          $("#active_item_desc").text(item.description);
          $("#active_item_img").attr("src",editor.imgUrl(item.id));
          if(item.store_url) {
            $("#active_item_link").attr("href",item.store_url);
          } else {
            $("#active_item_link").hide();
          }
          if(item.vendor_url) {
            $("#active_item_brand").attr("href",item.vendor_url);
          } else {
            $("#active_item_brand").hide();
          }
        }
      }
    },"json");
  },
  initToolbar: function(object) {
    $("#toolbar").fadeIn(300).data("id",object.id);
    $("#rotation").val(Math.round(object.media.rotation)+"°");
    $("#scale").val(Math.round(object.media.scale*100)+"%");
    if(object.media.removed == "true") {
      $("#removebg").attr("checked","checked");
    } else {
      $("#removebg").removeAttr("checked");
    }
  },
  touch: function(event) {
    editor.activateObject($(this));
    
    var touch = event.changedTouches[0];
    
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
      editor.events.sizing = [parseInt($(this).width()), parseInt($(this).height())];
      editor.events.rotating = $(this).data('object').media.rotation;
    }
  },
  gesturechange: function(event) {
    if($(this).hasClass("active")) {
      var data = $(".active").data("object");
      if(editor.events.sizing){
        
        // Sizing
        if(data.media.scaleLock == 0) {
          var width1 = $(this).outerWidth(),
              height1 = $(this).outerHeight();
              
          $(this).width(Math.min(editor.events.sizing[0] * event.scale, 600) + "px")
            .height(Math.min(editor.events.sizing[1] * event.scale, 600) + "px");
          
          // $1m to whoever can solve this. Cole pays.
          /*
          $(this).css({
            top: parseInt(this.style.top,10)-($(this).outerHeight()-height1)/2,
            left: parseInt(this.style.left,10)-($(this).outerWidth()-width1)/2,
          });
          */

          $("#scale").val(Math.round(event.scale*100)+"%");
          //data.media.hScale = event.scale*100;
          //data.media.vScale = event.scale*100;
          
          //data.media.scale = data.media.scale+event.scale;
        }
        
        // Rotating
        if(data.media.angleLock == 0) {
          var rotate = (editor.events.rotating + event.rotation);
          
          if(rotate < 0) {
            rotate = 360 + rotate;
          }
          if(rotate > 360) {
            rotate = rotate - 360;
          }
          var locks = [0,45,90,135,180,225,270,315,360];
          
          for(i = 0; i < locks.length; i++) {
            if(rotate >= (locks[i]-5) && rotate <= (locks[i]+5)) {
              rotate = locks[i];
            }
          }
          
          
          this.style.webkitTransform = "rotate(" + (rotate) + "deg)";
          $("#rotation").val(Math.round(rotate)+"°");
          
          data.media.rotation = rotate;
        }
      }
    }
  },
  gestureend: function(event) {
    if($(this).hasClass("active")) {
      editor.events.sizing = false;
      editor.events.rotating = (editor.events.rotating + event.rotation);
    }
  },
  zoom: function(e) {
    $(this).css("-webkit-transform","scale("+event.scale+")");
    e.preventDefault();
  }
};

if (typeof console == 'undefined'){
  console = {};
  console.log = function(m){};
  console.error = function(m){};
}