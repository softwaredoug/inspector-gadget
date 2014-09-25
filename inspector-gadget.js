'use strict';
/**
*/
angular.module('swd.inspector-gadget', []);
angular.module('swd.inspector-gadget')
  .directive('inspectorGadget', function ($compile) {

  return {
    restrict: 'E',
    transclude: true,
    //template: '<div>CAN WE JUST<div data-toggle="popover" ng-transclude></div></div>',
    template: '<span ng-transclude></span>',
    
    link: function(scope, element, attrs) {
      var title = element.find('inspector-title');
      var errStr = '';
      if (title.length !== 1) {
        errStr = 'inspector-gadget: no inspector-title specified, or multiple titles specified';
        console.err(errStr);
        throw errStr;
      }
      title = title[0];
      title.hidden = true;
      title = title.innerHTML;
      
      var content = element.find('inspector-content');
      if (content.length !== 1) {
        errStr = 'inspector-gadget: no inspector-content specified, or multiple contents specified';
        console.err(errStr);
        throw errStr;
      }
      content = content[0];
      content.hidden = true;
      content = content.innerHTML;


      // TODO pass unpack attrs, pass as arguments 
      //
      var bootstrArgs = {};
      angular.forEach(attrs, function(attrValue, attrName) {
        if (attrName.indexOf('data-') === 0) {
          var attr = attrName.slice(5);
          // only allow certain attributes
          if (attr !== 'placement' && attr !== 'animation' &&
              attr !== 'delay' && attr !== 'container' &&
              attr !== 'viewport') {
            var errStr = 'Only a subset of bootstrap popover arguments allowed: ' +
                         ' placement, animation, delay, container, viewport';
            console.error(errStr);
            throw errStr;
          } else {
            bootstrArgs[attr] = attrValue;
          }
        }
      });

      var timeoutObj = null;
      var popoverContent = null;
      var popConfig = bootstrArgs;
      popConfig.html = true;
      popConfig.title = function() {
        console.log('get title');
        return title;
      };
      popConfig.content = function() {
        return content;
      };
      popConfig.trigger = 'manual';
      element.mouseenter(function() {
        // trigger hover event, open popover, link btn to modal
        element.popover('show');
        var popCont = $('.popover-content');
        console.log('compiling popover content: ' + popCont.length + ' timer:' + scope.timer);
        $compile(popCont.contents())(scope);
        scope.$apply();
      });
      element.mouseleave(function() {
        /* only leave if hoverd off content too*/
        var content = $('.popover-content');
        console.log('LEAVE LINK');
        var hoveringPopover = false;

        content.mouseenter(function() {
          console.log('enter pop');
          hoveringPopover = true;
        });
        content.mouseleave(function() {
          console.log('leave pop');
          hoveringPopover = false;
        });

        var hidePop = function() {
          if (!hoveringPopover) {
            element.popover('hide');
          } else {
            timeoutObj = setTimeout(hidePop, 300);
          }
        };

        timeoutObj = setTimeout(hidePop, 300);
      });
      element.popover(popConfig);
      
      console.log('popover created: ' + element.html());
    },

  };
});
