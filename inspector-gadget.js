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
        return scope._insp.title;
      };
      popConfig.content = function() {
        console.log('get content');
        return scope._insp.content;
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

    controller: function($scope) {
      $scope._insp = {};
      $scope._insp.title = '<b>No Title Specified</b>';
      $scope._insp.content = '<b>No Content Specified</b>';
      this.setTitle = function(titleHtml) {
        $scope._insp.title = titleHtml;
      };

      this.setContent = function(contentHtml) {
        $scope._insp.content = contentHtml;
      };
      
      this.setAnchorElm = function(anchorHtml) {
        $scope._insp.anchor = anchorHtml;
      };
    }
    
  };
});


angular.module('swd.inspector-gadget')
  .directive('inspectorTitle', function () {
    return {
      restrict: 'E',
      require: '^inspectorGadget',
      link: function(scope, element, attr, inspCtrl) {
        console.log('passing title');
        inspCtrl.setTitle(element.html());
        element.html('');
      }
    };
  });

angular.module('swd.inspector-gadget')
  .directive('inspectorContent', function () {
    return {
      restrict: 'E',
      require: '^inspectorGadget',
      link: function(scope, element, attr, inspCtrl) {
        console.log('passing content');
        inspCtrl.setContent(element.html());
        element.html('');
      }
    };
 });

angular.module('swd.inspector-gadget')
  .directive('inspectorAnchor', function () {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="_insp_anchor" ng-transclude></div>',
      require: '^inspectorGadget',
      link: function(scope, element, attr, inspCtrl) {
        inspCtrl.setAnchor(element.html());
      }
    };
 });
