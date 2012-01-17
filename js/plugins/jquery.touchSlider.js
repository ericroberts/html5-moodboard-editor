(function($) {
  $.touchSlider = function(element, options) {
    var defaults = {
      range: {
        start: 0,
        end: 100
      },
      width: 120,
      value: 0,
      markup: $("<div class='touchslider'><div class='touchslider_track'><a href='#'><span></span></a></div></div>"),
      onStart: function() { },
      onAfter: function() { }
    }
    
    var plugin = this;
    
    plugin.settings = {}
    
    var $element = $(element),
        element = element;
        
    plugin.init = function() {
      plugin.settings = $.extend({}, defaults, options); 

      $element.hide().before(plugin.settings.markup);
      
      plugin.settings.markup.width(plugin.settings.width);
      
      // Check for the value of the input changing
      $element.change(function() {
        var value = $(this).val(),
            range = Math.abs(plugin.settings.range.end-plugin.settings.range.start),
            position = (value/range)*plugin.settings.width;
        
        $("a",plugin.settings.markup).css("left",position);
      });
      
      // Touch
      $("a",plugin.settings.markup).each(function() { this.addEventListener('touchstart', touch, false); });
      $("a",plugin.settings.markup).each(function() { this.addEventListener('touchmove', drag, false); });
      $("a",plugin.settings.markup).each(function() { this.addEventListener('touchend', end, false); });
      
      // Click
      $("a",plugin.settings.markup).mousedown(mousedown);
      
      $("a",plugin.settings.markup).css({
        left: (plugin.settings.value/Math.abs(plugin.settings.range.end-plugin.settings.range.start))*plugin.settings.width
      });
      
      $element.val(plugin.settings.value);
    }
    
    var drag,
        dragging = false;
    
    var mousedown = function(e) {
      drag = $(this);
      dragging = e.pageX - parseInt($(this).css("left"),10);
      document.addEventListener('mousemove',mousemove,false);
      document.addEventListener('mouseup',mouseup,false);
    }
    
    var mousemove = function(e) {
      
      var distance = e.pageX - dragging;
      if(distance < 0) {
        position = 0;
      } else if(distance > plugin.settings.markup.width()) {
        position = plugin.settings.markup.width();
      } else {
        position = distance;
      }
      drag.css("left",position);

      // Find where we are in the range
      var percent = position/plugin.settings.width,
          range = Math.abs(plugin.settings.range.end-plugin.settings.range.start),
          value = (percent*range)+plugin.settings.range.start;

      $element.val(value).change();
      
    }
    
    var mouseup = function(e) {
      drag = null;
      document.removeEventListener('mousemove',mousemove);
      document.removeEventListener('mouseup',mouseup);
    }
    
    var touch = function(e) {
      plugin.settings.onStart();
      var touch = e.changedTouches[0];
      dragging = touch.pageX - parseInt($(this).css("left"),10);
      e.preventDefault();
    }
    
    var drag = function(e) {
      e.preventDefault();
      var touch = e.changedTouches[0];
      if(dragging) {
        var distance = touch.pageX - dragging;
        if(distance < 0) {
          position = 0;
        } else if(distance > plugin.settings.markup.width()) {
          position = plugin.settings.markup.width();
        } else {
          position = distance;
        }
        $(this).css("left",position);
        
        // Find where we are in the range
        var percent = position/plugin.settings.markup.width(),
            range = Math.abs(plugin.settings.range.end-plugin.settings.range.start),
            value = (percent*range)+plugin.settings.range.start;
            
        $element.val(value).change();
      }
    }
    
    var end = function(e) {
      plugin.settings.onAfter();
    }

    plugin.init();
  }
  
  $.fn.touchSlider = function(options) {
    return this.each(function() {
      if(undefined == $(this).data('touchSlider')) {
        var plugin = new $.touchSlider(this,options);
        $(this).data('touchSlider',plugin);
      }
    });
  }
})(jQuery);