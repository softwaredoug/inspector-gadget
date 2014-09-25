'use strict';

/* global describe,beforeEach,inject,it,expect*/
describe('InspectorGadget', function() {
  var $compile, $rootScope;

  beforeEach(module('swd.inspector-gadget'));

  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('baseline', function() {
    expect(true).toBe(true);
  });
  
});
