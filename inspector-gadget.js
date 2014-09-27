'use strict';
/**
*/
angular.module('swd.inspector-gadget', []);
angular.module('swd.inspector-gadget')
  .directive('inspectorGadget', function ($compile) {

  // some helpers
  var getThenMute = function (element, selector, tag) {
    var childElm = element.find(selector);
    if (childElm.length !== 1) {
      var errStr = 'inspector-gadget expecting exactly one ' + selector + ' 0 or >1 found';
      console.error(errStr);
      throw errStr;
    }
    if (tag) {
      var tagDiv = document.createElement('div');
      tagDiv.setAttribute('data-inspector-gadget-tag', tag);
      tagDiv.setAttribute('style', 'display: none');
      childElm[0].appendChild(tagDiv);
    }
    var childHtml = childElm[0].innerHTML;
    childElm[0].hidden = true;
    return childHtml;
  };

  var collectPopoverAttrArgs = function(attrs) {
    var bootstrArgs = {};
    angular.forEach(attrs, function(attrValue, attrName) {
      // only allow certain attributes
      if (attrName === 'placement' || attrName === 'animation' ||
          attrName === 'delay' || attrName === 'container' ||
          attrName === 'viewport') {
        bootstrArgs[attrName] = attrValue;
      } 
    });
    return bootstrArgs;
  };

  var getPopoverContainer = function(popoverId) {
    /*global $*/
    var elm = $('div[data-inspector-gadget-tag="' + popoverId + '"]');
    var popover = elm.parent().parent();
    return popover;
  };

  var uniqueDirective = 1;

  return {
    restrict: 'E',
    transclude: true,
    //template: '<div>CAN WE JUST<div data-toggle="popover" ng-transclude></div></div>',
    template: '<div style="display: inline-block" class="anchored_div" ng-transclude></div>',
    
    link: function(scope, element, attrs) {
      var anchoredDiv = element.find('.anchored_div');

      // actually directly extracting the content here is preferred to 
      // using controllers/scope to communicate between sub-directives 
      // the problem with using scope is that scope is not isolated in this directive,
      // there's no way not to interfere with a sibling inspector-gadget element
      var myPopoverId = uniqueDirective++;
      var titleHtml = getThenMute(element, 'inspector-title', myPopoverId);
      var contentHtml = getThenMute(element, 'inspector-content');

      var popConfig = collectPopoverAttrArgs(attrs);

      var timeoutObj = null;
      
      popConfig.html = true;
      popConfig.title = function() {
        return titleHtml;
      };
      popConfig.content = function() {
        return contentHtml;
      };
      popConfig.trigger = 'manual';
      anchoredDiv.mouseenter(function() {
        // trigger hover event, open popover, link btn to modal
        anchoredDiv.popover('show');
        // TODO remaining problem -- this compiles 
        var popCont = getPopoverContainer(myPopoverId);
        console.log('compiling popover content: ' + popCont.length + ' timer:' + scope.timer);
        $compile(popCont.contents())(scope);
        scope.$apply();
      });
      anchoredDiv.mouseleave(function() {
        /* only leave if hoverd off content too*/
        console.log('mouseleave');
        var popCont = getPopoverContainer(myPopoverId);
        console.log('LEAVE LINK');
        var hoveringPopover = false;

        popCont.mouseenter(function() {
          console.log('enter pop');
          hoveringPopover = true;
        });
        popCont.mouseleave(function() {
          console.log('leave pop');
          hoveringPopover = false;
        });

        var hidePop = function() {
          if (!hoveringPopover) {
            anchoredDiv.popover('hide');
          } else {
            timeoutObj = setTimeout(hidePop, 300);
          }
        };

        timeoutObj = setTimeout(hidePop, 300);
      });
      anchoredDiv.popover(popConfig);
      
      console.log('popover created: ' + anchoredDiv.html());
    },

  };
});
