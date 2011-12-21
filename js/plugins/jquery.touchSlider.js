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
      
      $(element).hide().before(plugin.settings.markup);
      
      plugin.settings.markup.width(plugin.settings.width);
      
      // Touch
      $("a",plugin.settings.markup).each(function() { this.addEventListener('touchstart', touch, false); });
      $("a",plugin.settings.markup).each(function() { this.addEventListener('touchmove', drag, false); });
      $("a",plugin.settings.markup).each(function() { this.addEventListener('touchend', end, false); });
      
      // Click
      $("a",plugin.settings.markup).mousedown(function(e) {
        $(this).data('mousedown',true);
        dragging = e.pageX - parseInt($(this).css("left"),10);
      });
      $("a",plugin.settings.markup).mousemove(function(e) {
        if($(this).data('mousedown') == true && dragging) {
          var distance = e.pageX - dragging;
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
      });
      $(document).mouseup(function(e) {
        $(this).data('mousedown',false);
        dragging = false;
      });
      
      $("a",plugin.settings.markup).css({
        left: (plugin.settings.value/Math.abs(plugin.settings.range.end-plugin.settings.range.start))*plugin.settings.width
      });
      
      $element.val(plugin.settings.value);
    }
    
    var dragging = false;
    
    var touch = function(e) {
      plugin.settings.onStart();
      var touch = e.changedTouches[0];
      dragging = touch.pageX - parseInt($(this).css("left"),10);
    }
    
    var drag = function(e) {
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