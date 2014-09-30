'use strict';
/**
*/
angular.module('swd.inspector-gadget', []);

angular.module('swd.inspector-gadget')
  .service('intPopover', function() {
    this.bootstrap = function(elm, config) {
      elm.popover(config);
      return {
        show: function() {
          elm.popover('show');
        },
        hide: function() {
          elm.popover('hide');
        }
      };
    };

  });


angular.module('swd.inspector-gadget')
  .directive('inspectorGadget', function ($compile, $document, intPopover, $timeout) {

  var doc = $document[0];

  var rootNode = function(elm) {
    return angular.element(elm.parentsUntil().slice(-1)[0]);
  };

  // some helpers
  var getThenMute = function (element, selector, tag) {
    var childElm = element.find(selector);
    if (childElm.length !== 1) {
      var errStr = 'inspector-gadget expecting exactly one ' + selector + ' 0 or >1 found';
      console.error(errStr);
      throw errStr;
    }
    if (tag) {
      var tagDiv = doc.createElement('div');
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

  var getPopoverContainer = function(rootNode, popoverId) {
    var elm = rootNode.find('div[data-inspector-gadget-tag="' + popoverId + '"]');
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
      var root = rootNode(anchoredDiv);

      // actually directly extracting the content here is preferred to 
      // using controllers/scope to communicate between sub-directives 
      // the problem with using scope is that scope is not isolated in this directive,
      // (we don't want it to be isolated)
      // there's no way not to interfere with a sibling inspector-gadget element
      var myPopoverId = uniqueDirective++;
      var titleHtml = getThenMute(element, 'inspector-title', myPopoverId);
      var contentHtml = getThenMute(element, 'inspector-content');

      var popConfig = collectPopoverAttrArgs(attrs);
      var popControl = null;

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
        popControl.show();
        // TODO remaining problem -- this compiles 
        var popCont = getPopoverContainer(root, myPopoverId);
        $compile(popCont.contents())(scope);
        scope.$apply();
      });
      anchoredDiv.mouseleave(function() {
        /* only leave if hoverd off content too*/
        var popCont = getPopoverContainer(root, myPopoverId);
        var hoveringPopover = false;

        popCont.mouseenter(function() {
          hoveringPopover = true;
        });
        popCont.mouseleave(function() {
          hoveringPopover = false;
        });

        var hidePop = function() {
          if (!hoveringPopover) {
            popControl.hide();
          } else {
            timeoutObj = $timeout(hidePop, 300);
          }
        };

        timeoutObj = $timeout(hidePop, 300);
      });
      popControl = intPopover.bootstrap(anchoredDiv, popConfig);
      
    },

  };
});
