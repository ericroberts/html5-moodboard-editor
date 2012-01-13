$(function() {
  
  document.addEventListener('touchend', editor.touchend, false);
  
  var scale_one = Math.abs((editor.window.height-100)/editor.defaults.height);
  var scale_two = Math.abs((editor.window.width-100)/editor.defaults.width);
  editor.window.zoom = Math.min(scale_one,scale_two,1);
  
  /*
  var canvas = $("<div></div>");
  canvas.css({
    width: editor.defaults.width*editor.window.zoom,
    height: editor.defaults.height*editor.window.zoom,
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 0,
    marginLeft: -(editor.defaults.width*editor.window.zoom)/2,
    marginTop: -(editor.defaults.height*editor.window.zoom)/2,
    background: 'rgba(0,0,0,0.1)'
  });
  $("body").prepend(canvas);
  */
  
  $("#bg_tolerance").touchSlider({
    value: 5
  });
  $("#bg_feather").touchSlider({
    value: 2
  });
  
  $("#items").height(editor.window.height-50-parseInt($("#items").css('top'),10));
  $(".tab_container","#items").height($("#items").height()-$("#items > h2").outerHeight()-$(".tabs navul").outerHeight()-57);
  
  $.get("/boards/1.txt", function(data) {
    editor.currentboard = data;
    for(var i = 0; i < data.olioboard.object.length; i++) {
      var object = data.olioboard.object[i];
      editor.addObject(object,i);
      editor.panel.addItem(object);
    }
  },"json");
  
  $("#rotation").live("keyup", function() {
    var deg = $(this).val();
    $(".active","#canvas").css({
      webkitTransform: "rotate("+deg+"deg)"
    });
    
    var object = $(".active","#canvas").data('object');
    object.media.rotation = $(this).val();
  });
  
  $(".duplicate").live("click", function() {
    var data = $(".active","#canvas").data("object");
    var newobj = $.extend({},data);
    newobj.x = newobj.x+25;
    newobj.y = newobj.y+25;
    
    editor.addObject(newobj,Math.max.apply(Math,editor.items.indexes)+1,true);
    
    return false;
  });
  
  $(".remove").live("click", function() {
    if(confirm("Are you sure you want to remove?")) {
      $(".active","#canvas").fadeOut(300, function() {
        $(".active","#canvas").remove();
      });
    }
    return false;
  });
  
  $(".flip").live("click", function() {

    $(".active","#canvas").fadeTo(250,0.5, function() {
      var data = editor.getCanvas($(".active","#canvas").data('ref'));
      
      data.img.mod.onload = function() {
        data.ctx.translate(data.img.mod.width, 0);
        data.ctx.scale(-1,1);
        editor.crop.crop(data);

        $(".active","#canvas").fadeTo(0.5,250);
      }
    });
    
    return false;
    
  });
  
  $(".flop").live("click", function() {
    
    $(".active","#canvas").fadeTo(250,0.5, function() {
      var data = editor.getCanvas($(".active","#canvas").data('ref'));
      
      data.img.mod.onload = function() {
        data.ctx.translate(0,data.img.mod.height);
        data.ctx.scale(1,-1);
        editor.crop.crop(data);

        $(".active","#canvas").fadeTo(0.5,250);
      }
    });
    return false;
    
  });
  
  $(".depth").live("click", function() {
    var curr = parseInt($(".active","#canvas").data('z'),10);
    var max = Math.max.apply(Math,editor.items.indexes);
    
    if($(this).hasClass("front")) {      
      if(curr != max) {
        $("canvas:not(.active)").each(function() {
          if($(this).data('z') == curr+1) {
            $(this).data('z',curr);
            $(this).css("z-index",curr);
          }
        });
        $(".active","#canvas").css("z-index",curr+1).data('z',curr+1);
      }
    }
    if($(this).hasClass("tofront")) {
      $("canvas:not(.active)").each(function() {
        var z = parseInt($(this).data('z'),10);
        if (z > curr) {
          $(this).css('z-index',z-1).data('z',z-1);
        }
      });
      $(".active","#canvas").data('z',max).css("z-index",max);
    }
    if($(this).hasClass("back")) {
      if(curr != 0) {
        $("canvas:not(.active)").each(function() {
          if($(this).data('z') == curr-1) {
            $(this).data('z',curr);
            $(this).css("z-index",curr);
          }
        });
        $(".active","#canvas").css("z-index",curr-1).data('z',curr-1);
      }
    }
    if($(this).hasClass("toback")) {
      $("canvas:not(.active)").each(function() {
        var z = parseInt($(this).data('z'),10);
        if(z < curr) {
          $(this).css('z-index',z+1).data('z',z+1);
        }
      });
      $(".active","#canvas").css("z-index",0).data('z',0);
    }
    return false;
  });
  
  $("#lock_rotation").live("change", function() {
    var data = $(".active","#canvas").data("object");
    if($(this).is(":checked")) {
      data.media.angleLock = 1;
    } else {
      data.media.angleLock = 0;
    }
  });
  
  $("#lock_scale").live("change", function() {
    var data = $(".active","#canvas").data("object");
    if($(this).is(":checked")) {
      data.media.scaleLock = 1;
    } else {
      data.media.scaleLock = 0;
    }
  });
  
  $(".crop").live("click", function() {
    var data = editor.getCanvas($(".active","#canvas").data('ref'));
    editor.crop.open(data);
    return false;
  });
  
  $("#removebg").live("change", function() {
    var data = editor.getCanvas($(".active","#canvas").data('ref'));
    if($(this).is(":checked")) {
      $("#advanced_bg").addClass("activated");
      $(".active","#canvas").addClass("removed_bg");
      $(data.canvas).data('img').mod_withbg = $(data.canvas).data('img').mod;
      
      data.img.mod.onload = function() { 
        editor.removeColour(data.ctx,data.img.mod); 
        data.object.media.removed = "true";
        $(data.canvas).data('img').mod = data.canvas.toDataURL();
      }
    } else {
      $("#advanced_bg").removeClass("activated");
      $(".active","#canvas").removeClass("removed_bg");
      
      data.img.mod_withbg.onload = function() { 
        
        data.ctx.drawImage(data.img.mod_withbg, 0, 0, data.img.mod_withbg.width, data.img.mod_withbg.height); 
        data.object.media.removed = null;
        $(data.canvas).data('img').mod = data.img.mod_withbg.src;
        data.img.mod = data.img.mod_withbg;
        editor.crop.crop(data);
      }
    }
    
    $(canvas).data('object',data.object);
    
  });
  
  $("#advanced_bg").live("click", function() {
    var data = editor.getCanvas($(".active","#canvas").data('ref'));
    if($(this).hasClass("activated")) {
      editor.advancedBG(editor.getCanvas($(".active","#canvas").data('ref')));
    }
    return false;
  });
  
  $("#bg_tolerance").change(function() {
    if($("#removebg").is(":checked")) {
      var data = editor.getCanvas($(".active","#canvas").data('ref'));
      data.ctx.drawImage(data.img.mod, 0, 0, data.img.mod.width, data.img.mod.height);
      var f = $("#bg_feather").val() ? parseInt($("#bg_feather").val(),10) : null;
      editor.removeColour(data.ctx,data.img.mod,parseInt($("#bg_tolerance").val(),10),f);
    }
  });
  
  $("#bg_feather").change(function() {
    if($("#removebg").is(":checked")) {
      var data = editor.getCanvas($("#toolbar").data('id'));
      data.ctx.drawImage(data.img.mod, 0, 0, data.img.mod.width, data.img.mod.height);
      var t = $("#bg_tolerance").val() ? parseInt($("#bg_tolerance").val(),10) : null;
      editor.removeColour(data.ctx,data.img.mod,t,parseInt($("#bg_feather").val(),10));
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
    
  });
  
  $(".cancel,.overlay_close").live("click", function() {
    var data = editor.getCanvas($(".active","#canvas").data('ref'));
    data.ctx.drawImage(data.img.mod, 0, 0, data.img.mod.width, data.img.mod.height);
    editor.crop.crop(data);
    return false;
  });
  
  $("#crop .save").live("click", function() {
    editor.crop.save(editor.getCanvas($(".active","#canvas").data('ref')));
    
    return false;
  });
  
  $("#advancedbgremoval .save").live("click", function() {
    
    return false;
  });
  
  $(".overlay_close").live("click", function() {
    editor.closeOverlay();
  });
  
});

$(window).resize(function() {
  editor.window.width = $(window).width();
  editor.window.height = $(window).height();
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
    rotating: 0,
    fingers: 0
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
    var rotate = $(".overlay_object").data('rotate');
    if(!rotate) {
      rotate = { x: 0, y: 0 }
    }
    var rotation = $(".overlay_object").data('object').media.rotation;
    
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
    }).css("-webkit-transform","rotate("+rotation+"deg)").removeClass("overlay_object");
    
    $(".toolbar:not(#toolbar)").animate({
      top: -100
    }, 300, function() {
      $("#toolbar").animate({
        top: 0
      },300);
    });
  },
  getSelection: function(object) {
    var selection = {
      x: object.object.mask.x,
      y: object.object.mask.y,
      w: object.object.mask.width,
      h: object.object.mask.height
    }
    return selection;
  },
  overlayCanvas: function(object) {
    $("body").prepend($("<div class='overlay'></div>").hide().fadeIn(300, function() { 
      $("body").prepend($("<a href='#' class='overlay_close'>Close</a>").hide().fadeIn(300)); 
      $("body").prepend($("<div class='checkerboard'></div>").css({
        top: editor.window.height/2,
        left: editor.window.width/2,
      }).hide().fadeIn(300));
    }));
    
    var el = $(object.canvas);
    
    el.data("position",{ left: parseInt(el.css("left"),10), top: parseInt(el.css("top"),10), width: el.width(), height: el.height() }).animate({
      width: 400,
      height: 400,
      top: editor.window.height/2,
      left: editor.window.width/2,
      marginTop: -200,
      marginLeft: -200,
      zIndex: 601,
    },300).css("-webkit-transform","rotate(0deg)").addClass("overlay_object");
  },
  crop: {
    crop: function(object) {
      var sel = editor.getSelection(object);
      object.ctx.clearRect(0, 0, object.canvas.width, object.canvas.height);
      object.ctx.drawImage(object.img.mod, sel.x, sel.y, sel.w, sel.h, sel.x, sel.y, sel.w, sel.h);
    },
    open: function(object) {
      editor.overlayCanvas(object);

      $("#toolbar").animate({
        top: -100
      },300, function() {
        $("#crop").css("top", -100).show().animate({
          top: 0
        },300);
      });
      
      var item = object.object;
      editor.crop.theSelection = editor.crop.selection(item.mask.x,item.mask.y,item.mask.width,item.mask.height);
      
      editor.removeTouchListeners($(".active","#canvas").data('ref'));
      editor.removeClickListeners($(".active","#canvas").data('ref'));
      editor.crop.drawScene(object);
    },
    save: function(object,sel) {
      var obj = object.object;
      
      if(sel) { sel = editor.crop.selection(sel.x,sel.y,sel.w,sel.h); } 
      else { sel = editor.crop.theSelection; }
      
      object.ctx.clearRect(0, 0, object.ctx.canvas.width, object.ctx.canvas.height);
      object.ctx.drawImage(object.img.mod, sel.x, sel.y, sel.w, sel.h, sel.x, sel.y, sel.w, sel.h);
      
      object.canvas.removeEventListener('touchstart', editor.crop.touch.start, false);
      object.canvas.removeEventListener('touchmove', editor.crop.touch.move, false);
      object.canvas.removeEventListener('touchend', editor.crop.touch.end, false);
      object.canvas.removeEventListener('mousedown', editor.crop.touch.start, false);
      object.canvas.removeEventListener('mousemove', editor.crop.touch.move, false);
      object.canvas.removeEventListener('mouseup', editor.crop.touch.end, false);
      
      var id = $(object.canvas).data('ref');
      editor.addTouchListeners(id);
      editor.addClickListeners(id);
      
      obj.mask.x = sel.x;
      obj.mask.y = sel.y;
      obj.mask.width = sel.w;
      obj.mask.height = sel.h;
      
      //$(object.canvas).addClass("removed_bg").data('img').mod = object.canvas.toDataURL();
    },
    selection: function(x,y,w,h) {
      this.x = x; // initial positions
      this.y = y;
      this.w = w; // and size
      this.h = h;

      this.px = x; // extra variables to dragging calculations
      this.py = y;

      this.csize = 20; // resize cubes size
      this.csizeh = 30; // resize cubes size (on hover)

      this.bHow = [false, false, false, false]; // hover statuses
      this.iCSize = [this.csize, this.csize, this.csize, this.csize]; // resize cubes sizes
      this.bDrag = [false, false, false, false]; // drag statuses
      this.bDragAll = false; // drag whole selection
      
      return this;
    },
    theSelection: null,
    drawScene: function(object) { // main drawScene function
      object.img.mod.onload = function() {
        object.ctx.clearRect(0, 0, object.ctx.canvas.width, object.ctx.canvas.height); // clear canvas

        // draw source image
        object.ctx.drawImage(object.img.mod, 0, 0, object.ctx.canvas.width, object.ctx.canvas.height);

        // and make it darker
        object.ctx.fillStyle = 'rgba(255,255,255,0.65)';
        object.ctx.fillRect(0, 0, object.ctx.canvas.width, object.ctx.canvas.height);

        // draw selection
        editor.crop.drawSelection(object);
      }
    },
    drawSelection: function(object) {
      var sel = editor.crop.theSelection;

      // draw part of original image
      if (sel.w > 0 && sel.h > 0) {
        object.ctx.drawImage(object.img.mod, sel.x, sel.y, sel.w, sel.h, sel.x, sel.y, sel.w, sel.h);
      }

      // draw resize cubes
      object.ctx.fillStyle = '#bf1c23';
      
      // Top Left
      object.ctx.beginPath();
      object.ctx.moveTo(sel.x + 1, sel.y + 1);
      object.ctx.lineTo(sel.x + 30, sel.y + 1);
      object.ctx.lineTo(sel.x + 30, sel.y + 10);
      object.ctx.lineTo(sel.x + 10, sel.y + 10);
      object.ctx.lineTo(sel.x + 10, sel.y + 30);
      object.ctx.lineTo(sel.x + 1, sel.y + 30);
      object.ctx.lineTo(sel.x + 1, sel.y + 1);
      object.ctx.fill();
      
      // Top Right
      object.ctx.beginPath();
      object.ctx.moveTo(sel.x + sel.w - 30, sel.y + 1);
      object.ctx.lineTo(sel.x + sel.w - 1, sel.y + 1);
      object.ctx.lineTo(sel.x + sel.w - 1, sel.y + 30);
      object.ctx.lineTo(sel.x + sel.w - 10, sel.y + 30);
      object.ctx.lineTo(sel.x + sel.w - 10, sel.y + 10);
      object.ctx.lineTo(sel.x + sel.w - 30, sel.y + 10);
      object.ctx.lineTo(sel.x + sel.w - 30, sel.y + 1);
      object.ctx.fill();
      
      // Bottom Right
      object.ctx.beginPath();
      object.ctx.moveTo(sel.x + sel.w - 1, sel.y + sel.h - 30);
      object.ctx.lineTo(sel.x + sel.w - 1, sel.y + sel.h - 1);
      object.ctx.lineTo(sel.x + sel.w - 30, sel.y + sel.h - 1);
      object.ctx.lineTo(sel.x + sel.w - 30, sel.y + sel.h - 10);
      object.ctx.lineTo(sel.x + sel.w - 10, sel.y + sel.h - 10);
      object.ctx.lineTo(sel.x + sel.w - 10, sel.y + sel.h - 30);
      object.ctx.lineTo(sel.x + sel.w - 30, sel.y + sel.h - 30);
      object.ctx.fill();
      
      // Bottom Left
      object.ctx.beginPath();
      object.ctx.moveTo(sel.x + 1, sel.y + sel.h - 30);
      object.ctx.lineTo(sel.x + 10, sel.y + sel.h - 30);
      object.ctx.lineTo(sel.x + 10, sel.y + sel.h - 10);
      object.ctx.lineTo(sel.x + 30, sel.y + sel.h - 10);
      object.ctx.lineTo(sel.x + 30, sel.y + sel.h - 1);
      object.ctx.lineTo(sel.x + 1, sel.y + sel.h - 1);
      object.ctx.lineTo(sel.x + 1, sel.y + sel.h - 30);
      object.ctx.fill();
      
      object.canvas.addEventListener('touchstart',editor.crop.touch.start,false);
      object.canvas.addEventListener('touchmove',editor.crop.touch.move,false);
      object.canvas.addEventListener('touchend',editor.crop.touch.end,false);
      
      object.canvas.addEventListener('mousedown',editor.crop.touch.start,false);
      object.canvas.addEventListener('mousemove',editor.crop.touch.move,false);
      object.canvas.addEventListener('mouseup',editor.crop.touch.end,false);
    },
    touch: {
      start: function(e) {
        
        e.preventDefault();
        var offset = {
              left: parseInt($(".active","#canvas").css("left"),10)-200,
              top: parseInt($(".active","#canvas").css("top"),10)-200
            },
            t = e.changedTouches ? e.changedTouches[0] : e,
            touch = {
              x: Math.floor(t.pageX - offset.left),
              y: Math.floor(t.pageY - offset.top)
            },
            sel = editor.crop.theSelection;
        
        sel.px = touch.x - sel.x;
        sel.py = touch.y - sel.y;        
        
        if (touch.x > sel.x + sel.csizeh && touch.x < sel.x + sel.w - sel.csizeh && 
            touch.y > sel.y + sel.csizeh && touch.y < sel.y + sel.h - sel.csizeh) {
          sel.bDragAll = true;
        }
        
        // Check if resize cube is tapped
        if (touch.x > sel.x - sel.csizeh && touch.x < sel.x + sel.csizeh &&
            touch.y > sel.y - sel.csizeh && touch.y < sel.y + sel.csizeh) {
            sel.bHow[0] = true;
        }
        if (touch.x > sel.x + sel.w-sel.csizeh && touch.x < sel.x + sel.w + sel.csizeh &&
            touch.y > sel.y - sel.csizeh && touch.y < sel.y + sel.csizeh) {
            sel.bHow[1] = true;
        }
        if (touch.x > sel.x + sel.w-sel.csizeh && touch.x < sel.x + sel.w + sel.csizeh &&
            touch.y > sel.y + sel.h-sel.csizeh && touch.y < sel.y + sel.h + sel.csizeh) {
            sel.bHow[2] = true;
        }
        if (touch.x > sel.x - sel.csizeh && touch.x < sel.x + sel.csizeh &&
            touch.y > sel.y + sel.h-sel.csizeh && touch.y < sel.y + sel.h + sel.csizeh) {
            sel.bHow[3] = true;
        }
        
        if(sel.bHow[0]) {
          sel.px = touch.x - sel.x;
          sel.py = touch.y - sel.y;
        }
        if(sel.bHow[1]) {
          sel.px = touch.x - sel.x - sel.w;
          sel.py = touch.y - sel.y;
        }
        if(sel.bHow[2]) {
          sel.px = touch.x - sel.x - sel.w;
          sel.py = touch.y - sel.y - sel.h;
        }
        if(sel.bHow[3]) {
          sel.px = touch.x - sel.x;
          sel.py = touch.y - sel.y - sel.h;
        }
        
        for(i = 0; i < 4; i++) {
          if(sel.bHow[i]) {
            sel.bDrag[i] = true;
          }
        }
      },
      move: function(e) {
        e.preventDefault();
        var offset = {
              left: parseInt($(".active","#canvas").css("left"),10)-200,
              top: parseInt($(".active","#canvas").css("top"),10)-200
            },
            t = e.changedTouches ? e.changedTouches[0] : e,
            touch = {
              x: Math.floor(t.pageX - offset.left),
              y: Math.floor(t.pageY - offset.top)
            },
            sel = editor.crop.theSelection;
            
        if(sel.bDragAll) {
          sel.x = touch.x - sel.px;
          sel.y = touch.y - sel.py;
        }
        
        for(var i = 0; i < 4; i++) {
          sel.bHow[i] = false;
          sel.iCSize[i] = sel.csize;
        }
        
        // in case of dragging of resize cubes
        var iFW, iFH;
        if (sel.bDrag[0]) {
          var iFX = touch.x - sel.px;
          var iFY = touch.y - sel.py;
          iFW = sel.w + sel.x - iFX;
          iFH = sel.h + sel.y - iFY;
        }
        if (sel.bDrag[1]) {
          var iFX = sel.x;
          var iFY = touch.y - sel.py;
          iFW = touch.x - sel.px - iFX;
          iFH = sel.h + sel.y - iFY;
        }
        if (sel.bDrag[2]) {
          var iFX = sel.x;
          var iFY = sel.y;
          iFW = touch.x - sel.px - iFX;
          iFH = touch.y - sel.py - iFY;
        }
        if (sel.bDrag[3]) {
          var iFX = touch.x - sel.px;
          var iFY = sel.y;
          iFW = sel.w + sel.x - iFX;
          iFH = touch.y - sel.py - iFY;
        }

        if (iFW > sel.csizeh * 2 && iFH > sel.csizeh * 2) {
          sel.w = iFW;
          sel.h = iFH;
          sel.x = iFX;
          sel.y = iFY;
        }
        
        var object = editor.getCanvas($(".active","#canvas").data('ref'));
        editor.crop.drawScene(object);
      },
      end: function(e) {
        editor.crop.theSelection.bDragAll = false;
        
        for(i = 0; i < 4; i++) {
          editor.crop.theSelection.bDrag[i] = false;
        }
        editor.crop.theSelection.px = 0;
        editor.crop.theSelection.py = 0;
      }
    }
  },
  advancedBG: function(object) {
    editor.overlayCanvas(object);
    
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
      img: {
        mod: new Image(),
        mod_withbg: new Image()
      }
    }
    data.ctx = data.canvas.getContext('2d');
    data.object = $(data.canvas).data('object');
    
    //data.img.orig.src = $(data.canvas).data('img').orig;
    data.img.mod.src = $(data.canvas).data('img').mod;
    if($(data.canvas).data('img').mod_withbg) {
      data.img.mod_withbg.src = $(data.canvas).data('img').mod_withbg;
    }
    
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
  addObject: function(object,i,active) {
    
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
        src = editor.imgUrl(object.id);
        
    canvas.setAttribute('id','item_'+refid);
  
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.width = img.width;
      ctx.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      // Remove the background if required
      if(object.media.removed == "true") {
        editor.removeColour(ctx,img);
        $(canvas).addClass('removed_bg');
      }
      
      var img_src = canvas.toDataURL();
      //img_src = editor.imgUrl(object.id);
      $(canvas).css({
        width: 400*object.media.scale*editor.window.zoom,
        height: 400*object.media.scale*editor.window.zoom,
        top: base.y + object.y*editor.window.zoom - (400*object.media.scale*editor.window.zoom)/2,
        left: base.x + object.x*editor.window.zoom - (400*object.media.scale*editor.window.zoom)/2,
        webkitTransform: "rotate("+object.media.rotation+"deg)"
      }).data('object',object)
        .css('z-index',i)
        .data('z',i)
        .data('ref',refid)
        .data('img',{
          mod: img_src
        });
      
      var sel = editor.crop.selection(object.mask.x,object.mask.y,object.mask.width,object.mask.height);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, sel.x, sel.y, sel.w, sel.h, sel.x, sel.y, sel.w, sel.h);
      
      document.getElementById("canvas_scale").appendChild(canvas);
      
      // Add touch events
      editor.addTouchListeners(refid);
      editor.addClickListeners(refid);
      
      if(active == true) {
        $(canvas).click();
      }
    }
    
    img.src = src;
    
    return "#item_"+refid;
  },
  addTouchListeners: function(id) {
    var canvas = document.getElementById('item_'+id);
    canvas.addEventListener('touchstart', editor.canvas.events.start, false);
    canvas.addEventListener('touchmove', editor.canvas.events.move, false);
    canvas.addEventListener('touchend', editor.canvas.events.end, false);
    canvas.addEventListener('gesturestart', editor.gesture, false);
    canvas.addEventListener('gesturechange', editor.gesturechange, false);
    canvas.addEventListener('gestureend', editor.gestureend, false);
  },
  removeTouchListeners: function(id) {
    var canvas = document.getElementById('item_'+id);
    canvas.removeEventListener('touchstart', editor.canvas.events.start, false);
    canvas.removeEventListener('touchmove', editor.canvas.events.move, false);
    canvas.removeEventListener('touchend', editor.canvas.events.end, false);
    canvas.removeEventListener('gesturestart', editor.gesture, false);
    canvas.removeEventListener('gesturechange', editor.gesturechange, false);
    canvas.removeEventListener('gestureend', editor.gestureend, false);
  },
  addClickListeners: function(id) {
    var canvas = document.getElementById('item_'+id);
    canvas.addEventListener('mousedown', editor.canvas.events.start, false);
  },
  removeClickListeners: function(id) {
    var canvas = document.getElementById('item_'+id);
    canvas.removeEventListener('mousedown', editor.canvas.events.start, false);
  },
  canvas: {
    events: {
      drag: null,
      dragging: false,
      start: function(event) {
        var canvas = $(this);
        editor.canvas.events.drag = canvas;
        editor.activateObject(canvas);
        
        var e = event.changedTouches ? event.changedTouches[0] : event;
        
        if(!event.changedTouches) {
          document.addEventListener('mousemove',editor.canvas.events.move);
          document.addEventListener('mouseup',editor.canvas.events.end);
        }
        
        if(!editor.canvas.events.dragging){
          editor.canvas.events.dragging = [e.pageX - parseInt(this.style.left), e.pageY - parseInt(this.style.top)];
          console.log(editor.canvas.events.dragging);
        }
      },
      move: function(e) {
        var el = editor.canvas.events.drag;
        if(el.hasClass("active") && editor.canvas.events.dragging) {
          el.css({
            left: e.pageX - editor.canvas.events.dragging[0] + 'px',
            top: e.pageY - editor.canvas.events.dragging[1] + 'px'
          });
        }
        e.preventDefault();
      },
      end: function(e) {
        editor.canvas.events.drag = null;
        editor.canvas.events.dragging = false;
        document.removeEventListener('mousemove',editor.canvas.events.move);
        document.removeEventListener('mouseup',editor.canvas.events.up);
      }
    }
  },
  getVendorURL: function(url) {
    return url.match(/:\/\/(.[^/]+)/)[1];
  },
  activateObject: function(canvas) {
    var object = canvas.data('object');
    $(".active","#canvas_scale").removeClass("active");
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
            $("#active_item_brand").attr("href","http://"+editor.getVendorURL(item.store_url));
          } else {
            $("#active_item_link").hide();
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
  closeToolbar: function() {
    $("#toolbar").fadeOut(300);
  },
  gesture: function(event) {
    if($(this).hasClass("active")) {
      editor.events.sizing = [parseInt($(this).width()), parseInt($(this).height())];
      editor.events.rotating = $(this).data('object').media.rotation;
    }
  },
  gesturechange: function(event) {
    if($(this).hasClass("active")) {
      var data = $(".active","#canvas").data("object");
      if(editor.events.sizing){
        
        // Sizing
        if(data.media.scaleLock == 0) {
              
          $(this).width(Math.min(editor.events.sizing[0] * event.scale, 600) + "px")
            .height(Math.min(editor.events.sizing[1] * event.scale, 600) + "px");
  
          var scale = $(this).width()/(400*editor.window.zoom);
          $("#scale").val(Math.round(scale*100)+"%");
          data.media.scale = scale;

        }
        
        // Rotating
        if(data.media.angleLock == 0) {
          var rotate = (editor.events.rotating + event.rotation);
          if(rotate < 0) { rotate = 360 + rotate; }
          if(rotate > 360) { rotate = rotate - 360; }
          
          var locks = [0,45,90,135,180,225,270,315,360];
          
          for(i = 0; i < locks.length; i++) {
            if(rotate >= (locks[i]-5) && rotate <= (locks[i]+5)) {
              rotate = locks[i];
            }
          }
          
          var rotatexy = $(this).data("rotate");
          if(!rotatexy) {
            rotatexy = { x: 0, y: 0 }
          }
          
          this.style.webkitTransform = "rotate(" + (rotate) + "deg) rotateX("+rotatexy.x+") rotateY("+rotatexy.y+")";
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
  },
  panel: {
    addItem: function(object) {
      var src = editor.imgUrl(object.id),
          li = document.createElement('li'),
          img = new Image();
          
      img.src = src;
      img.setAttribute('alt',object.id);
          
      $(li).append(img);
      $("#testitems").append(li);
      
      img.addEventListener('touchstart',editor.panel.events.start);
      img.addEventListener('touchmove',editor.panel.events.move);
      img.addEventListener('touchend',editor.panel.events.end);
      img.addEventListener('mousedown',editor.panel.events.start);
    },
    events: {
      drag: null,
      dragging: false,
      start: function(e) {
        
        var i = $(this), 
            t = e.changedTouches ? e.changedTouches[0] : e,
            o = $(this).offset();
            
        if(!e.changedTouches) {
          document.addEventListener('mousemove',editor.panel.events.move);
          document.addEventListener('mouseup',editor.panel.events.end);
        }
            
        editor.panel.events.drag = i;
        if(editor.panel.events.dragging == false) {
          editor.panel.events.dragging = [t.pageX - o.left + 10, t.pageY - o.top + 10];
        }
        
        i.addClass('moving').css({
          top: o.top-10,
          left: o.left-10
        }).closest('li').addClass('empty');
        $("#canvas_scale").append(i);
        
        e.preventDefault();
        
      },
      move: function(e) {
        var t = e.changedTouches ? e.changedTouches[0] : e,
            el = editor.panel.events.drag;
        
        if(el.hasClass('moving') && editor.panel.events.dragging) {
          el.css({
            left: t.pageX - editor.panel.events.dragging[0],
            top: t.pageY - editor.panel.events.dragging[1]
          });
        }
        e.preventDefault();
      },
      end: function(e) {
        
        var t = event.changedTouches ? event.changedTouches[0] : event,
            el = editor.panel.events.drag,
            io = {
              left: parseInt(el.css('left'),10)+el.width(),
              top: parseInt(el.css('top'),10)+el.width()
            },
            po = $("#items").offset(),
            base = {
              x: editor.window.width/2,
              y: editor.window.height/2
            },
            obj = new editor.setup.item(el.attr("alt")),
            d = {
              w: el.width(),
              h: el.height(),
              t: parseInt(el.css('top')),
              l: parseInt(el.css('left'))
            };
            
        obj.x = (parseInt(el.css('left'),10) - base.x + $(el).width()/2)/editor.window.zoom;
        obj.y = (parseInt(el.css('top'),10) - base.y + $(el).height()/2)/editor.window.zoom;
        
        $(".active","#canvas").removeClass("active");
        el.animate({
          width: 50,
          height: 50,
          top: d.t + (d.h-50)/2,
          left: d.l + (d.w-50)/2,
          opacity: 0
        },80, 'easeOutQuad', function() {
          el.animate({
            width: 400*editor.window.zoom,
            height: 400*editor.window.zoom,
            top: d.t + (d.h-400*editor.window.zoom)/2,
            left: d.l + (d.w-400*editor.window.zoom)/2,
            opacity: 1
          },200, 'easeOutQuad', function() {
            editor.addObject(obj,editor.id.count,true);
            setTimeout(function() {
              el.removeClass("moving").appendTo(".empty").css({
                width: 80,
                height: 80
              });
              $(".empty").removeClass("empty");
            },200);
          });
        });
        
        editor.panel.events.drag = null;
        editor.panel.events.dragging = false;
        document.removeEventListener('mousemove',editor.panel.events.move);
        document.removeEventListener('mouseup',editor.panel.events.end);
      }
    }
  },
  setup: {
    item: function(id) {
      var defaults = {
        id: id,
        x: 0,
        y: 0,
        frame: {
          style: "None"
        },
        mask: {
          type: "Rect",
          x: 0,
          y: 0,
          width: 400,
          height: 400
        },
        media: {
          feather: null,
          scale: 1,
          scaleLock: 0,
          swatch: null,
          angleLock: 0,
          swatchMin: null,
          swatchMax: null,
          hScale: 1,
          vScale: 1,
          rotation: 0,
          removed: null,
          rangeMin: null,
          rangeMax: null,
          x: 0,
          y: 0,
          type: "image"
        }
      }
      return defaults;
    }
  }
};

if (typeof console == 'undefined'){
  console = {};
  console.log = function(m){};
  console.error = function(m){};
}