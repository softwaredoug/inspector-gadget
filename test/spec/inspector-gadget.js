'use strict';

/* global describe,beforeEach,inject,it,expect*/
describe('InspectorGadget', function() {
  var $compile, $rootScope;

  beforeEach(module('swd.inspector-gadget'));
 
  var doc = null; 
  var MockPopover = function() {
    this.popoverOptions = null;
    this.popoverCmd = null;
    this.popoverContent = null;
    this.popoverTitle = null;
    
    this.bootstrap = function(elm, config) {
        this.popoverOptions = config;
    };

    this.show = function() {
      this.popoverContent = this.popoverOptions.content();
      this.popoverTitle = this.popoverOptions.title();
      // append both to DOM
      var popover = '<div class="popover">' +
                    '<div class="popover-title">' + this.popoverTitle + '</div>' + 
                    '<div class="popover-content">' + this.popoverTitle + '</div>' +
                    '</div>';
      doc.append(popover);
    };

    this.hide = function() {
      doc.find('.popover').remove();
    };
  };

  var mockPopover = null;
  beforeEach(function() {
    mockPopover = new MockPopover();
    module(function($provide) {
      $provide.value('intPopover', mockPopover);
    });
    inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

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

      var docMarkup = '<body><div>' + markup + '</div></body>';

      doc = angular.element(docMarkup);
      inspElem = doc.find('inspector-gadget');
      var compiled = $compile(doc)(scope);
      anchElem = angular.element(doc.find('.anchored_div')[0]);
      $rootScope.$digest();
      return compiled;
    };
  

    


    var scope = null;
    var inspElem = null;
    var anchElem = null;
    var view = null;
    beforeEach(function() {
      scope = $rootScope.$new();
      view = createView(scope);

    });

    it('mouseover shows popover', function() {
      expect(doc.find('.popover').length).toEqual(0);
      anchElem.mouseenter();
      expect(doc.find('.popover').length).toEqual(1);
    });
  });

  it('baseline', function() {
    expect(true).toBe(true);
  });
  
});
