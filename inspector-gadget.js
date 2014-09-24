'use strict';
/**
*/
angular.module('swd.inspector-gadget', [])

angular.module('swd.inspector-gadget')
  .directive('inspectorGadget', function () {

  return {
    restrict: 'E',
    scope: {
    },
    transclude: true,

    template: '<div ng-transclude></div>',
    
    link: function(scope, element, attrs) {
      // TODO pass unpack attrs, pass as arguments 
      element.popover({
        html: true,
        title: function() {
          return scope._insp.title;
        },
        content: function() {
          return scope._insp.content;
        }
      });

      console.log('insp gadget!');
    },

    controller: function($scope) {
      $scope._insp = {};
      this.setTitle = function(titleHtml) {
        $scope._insp.title = titleHtml;
      };

      this.setContent = function(contentHtml) {
        $scope._insp.content = contentHtml;
      };
      
      this.setAnchor = function(anchorHtml) {
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
        inspCtrl.setTitle(element.html());
      }
    };
  });

angular.module('swd.inspector-gadget')
  .directive('inspectorContent', function () {
    return {
      restrict: 'E',
      require: '^inspectorGadget',
      link: function(scope, element, attr, inspCtrl) {
        inspCtrl.setContent(element.html());
      }
    };
 });

angular.module('swd.inspector-gadget')
  .directive('inspectorAnchor', function () {
    return {
      restrict: 'E',
      require: '^inspectorGadget',
      link: function(scope, element, attr, inspCtrl) {
        inspCtrl.setAnchor(element.html());
      }
    };
 });
