'use strict';

/* global describe,beforeEach,inject,it,expect*/
describe('InspectorGadget', function() {
  var $compile, $rootScope, $timeout;

  beforeEach(module('swd.inspector-gadget'));
 
  var doc = null;

  // inspector-gadget wraps the elements popover() 
  // in a simple service 
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
    inject(function(_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    });
  });

  describe('basic rendering', function() {
    var createView = function(scope) {

      var markup = '<inspector-gadget data-placement="bottom">' +
                   ' <div class="btn">'                          +
                   '  <h4>Hello</h4> <div>{{counter}}</div>'     +
                   ' </div>' + 
                   ' <inspector-title>' + 
                   ' Hello <em>{{name}}</em>' +
                   ' </inspector-title>' +
                   ' <inspector-content>' +
                   '  <p>Mary had a little {{animal}}</p> ' +
                   ' </inspector-content>' +
                   '</inspector-gadget>';

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
    
    it('updates popover scope', function() {
      anchElem.mouseenter();
      scope.name = 'Doug';
      scope.$digest();
      var title = doc.find('inspector-title');
      expect(title.html().indexOf('Doug')).not.toEqual(-1);
    });
    
    it('hides on mouseleave if not hovering popover', function() {
      anchElem.mouseenter();
      anchElem.mouseleave();
      expect(doc.find('.popover').length).toEqual(1);
      $timeout.flush();
      expect(doc.find('.popover').length).toEqual(0);
    });
    
    it('dont hide on mouseleave if hovering popover', function() {
      anchElem.mouseenter();
      anchElem.mouseleave();
      expect(doc.find('.popover').length).toEqual(1);
      var popover = angular.element(doc.find('.popover'));
      popover.mouseenter();
      $timeout.flush();
      expect(doc.find('.popover').length).toEqual(1);
    });
  });

  it('baseline', function() {
    expect(true).toBe(true);
  });
  
});
