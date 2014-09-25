'use strict';

/* global describe,beforeEach,inject,it,expect*/
describe('InspectorGadget', function() {
  var $compile, $rootScope;

  beforeEach(module('swd.inspector-gadget'));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  describe('basic rendering', function() {
    var createView = function(scope) {
      var markup = '<inspector-gadget data-placement="bottom">' +
                   '<div class="btn">'                          +
                   ' <h4>Hello</h4> <div>{{counter}}</div>'     +
                   '</div>' + 
                   '<inspector-title>' + 
                   'Hello <em>{{name}}</em>' +
                   '</inspector-title>' +
                   '<inspector-content>' +
                   '<p>Mary had a little {{animal}}</p> ' +
                   '</inspector-content>';


      parentElement = angular.element('<body><div>' + markup + '</div></body>');
      inspElem = parentElement.find('inspector-gadget');
      var compiled = $compile(parentElement)(scope);
      $rootScope.$digest();
      return compiled;
    };

    var scope = null;
    var parentElement = null;
    var inspElem = null;
    var view = null;
    beforeEach(function() {
      scope = $rootScope.$new();
      view = createView(scope);
    });

    it('mouseover shows popover', function() {
      expect(parentElement.find('.popover').length).toEqual(0);
      inspElem.mouseenter();
      expect(parentElement.find('.popover').length).toEqual(1);
    });
  });

  it('baseline', function() {
    expect(true).toBe(true);
  });
  
});
