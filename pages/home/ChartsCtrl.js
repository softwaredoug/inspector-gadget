/**
*/


'use strict';

angular.module('myApp').controller('ChartsCtrl', function($scope, $interval) {
  $scope.config = {
    title: 'Products',
    tooltips: true,
    labels: false,
    mouseover: function() {},
    mouseout: function() {},
    click: function() {},
    legend: {
      display: true,
      //could be 'left, right'
      position: 'right'
    }
  };

  $scope.data = {
    series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
    data: [{
      x: "Laptops",
      y: [100, 500, 0],
      tooltip: "this is tooltip"
    }, {
      x: "Desktops",
      y: [300, 100, 100]
    }, {
      x: "Mobiles",
      y: [351]
    }, {
      x: "Tablets",
      y: [54, 0, 879]
    }]
  };

  /*$interval(function tweak() {
    var data = $scope.data.data;
    angular.forEach(data, function(datum) {
      var i = 0;
      for (i = 0; i < datum.y.length; i++) {
        datum.y[i] += Math.floor(Math.random() * (5 - (-5))) + (-5);
      }
    });
  }, 1000);*/
});
