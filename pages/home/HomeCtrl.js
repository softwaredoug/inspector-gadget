/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', function($scope, $interval) {
  $scope.timer = 0;
  $scope.tenSecTimer = 0;

  $interval(function tick() {
    $scope.timer++;
    if ($scope.timer % 10 === 0) {
      $scope.tenSecTimer++;
    }
  }, 1000);
});
