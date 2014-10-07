'use strict';

/* global describe,beforeEach,inject,it,expect*/
describe('InspectorGadget', function() {
  var $compile, $rootScope, $timeout;

  beforeEach(module('swd.inspector-gadget'));
 
  var doc = null;

  // inspector-gadget wraps the elements popover() 
  // in a simple service 
  var MockPopover = function() {
    
    this.bootstrap = function(elm, config) {
      var popoverOptions = config;
      var popoverContent = null;
      var popoverTitle = null;
      var popover;

      var popControl = {
        show: function() {
          popoverContent = popoverOptions.content();
          popoverTitle = popoverOptions.title();
          // append both to DOM
          popover = angular.element('<div class="popover">' +
                                    '<div class="popover-title">' + popoverTitle + '</div>' + 
                                    '<div class="popover-content">' + popoverContent + '</div>' +
                                    '</div>');
          doc.append(popover);
        },
        hide: function() {
          popover.remove();
        }
      };    
      return popControl;
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
  
  var scope = null;
  var inspElem = null;
  var anchElem = null;
  var view = null;

  var createView = function(scope, markup) {
    var docMarkup = '<body><div>' + markup + '</div></body>';
    doc = angular.element(docMarkup);
    inspElem = doc.find('inspector-gadget');
    var compiled = $compile(doc)(scope);
    anchElem = angular.element(doc.find('.popover-anchor')[0]);
    $rootScope.$digest();
    return compiled;
  };

  describe('basic rendering', function() {

      var markup = '<inspector-gadget data-placement="bottom">' +
                   ' <div class="btn">'                          +
                   '  <h4>Hello</h4> <div>{{counter}}</div>'     +
                   ' </div>' + 
                   ' <inspector-title>' + 
                   '  <bunny-tag></bunny-tag>' + 
                   ' Hello <em>{{name}}</em>' +
                   ' </inspector-title>' +
                   ' <inspector-content>' +
                   '  <funny-tag></funny-tag>' + 
                   '  <p>Mary had a little {{animal}}</p> ' +
                   ' </inspector-content>' +
                   '</inspector-gadget>';

    beforeEach(function() {
      scope = $rootScope.$new();
      view = createView(scope, markup);
    });

    it('doesnt transclude title, content', function() {
      expect(doc.find('funny-tag').length).toEqual(0);
      expect(doc.find('bunny-tag').length).toEqual(0);
    });

    it('mouseover shows popover', function() {
      expect(doc.find('.popover').length).toEqual(0);
      anchElem.mouseenter();
      expect(doc.find('.popover').length).toEqual(1);
    });
    
    it('mouseover now has title, content in doc', function() {
      anchElem.mouseenter();
      expect(doc.find('funny-tag').length).toEqual(1);
      expect(doc.find('bunny-tag').length).toEqual(1);
    });
    
    it('updates popover scope', function() {
      anchElem.mouseenter();
      scope.name = 'Doug';
      scope.animal = 'donkey';
      scope.$digest();
      var title = doc.find('.popover-title');
      expect(title.html().indexOf('Doug')).not.toEqual(-1);
      var content = doc.find('.popover-content');
      expect(content.html().indexOf('donkey')).not.toEqual(-1);
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
      expect(doc.find('.popover').length).toEqual(1);
    });
    
    it('hides on mouseleave after hovering popover', function() {
      anchElem.mouseenter();
      anchElem.mouseleave();
      expect(doc.find('.popover').length).toEqual(1);
      var popover = angular.element(doc.find('.popover'));
      popover.mouseenter();
      popover.mouseleave();
      $timeout.flush();
      expect(doc.find('.popover').length).toEqual(0);
    });
    
    it('mouseover, leave, over keeps open popover', function() {
      expect(doc.find('.popover').length).toEqual(0);
      anchElem.mouseenter();
      anchElem.mouseleave();
      anchElem.mouseenter();
      anchElem.mouseleave();
      expect(doc.find('.popover').length).toEqual(1);
    });
    
    it('stay rendered if anchor moused off just a bit', function() {
      expect(doc.find('.popover').length).toEqual(0);
      anchElem.mouseenter();
      anchElem.mouseleave();
      expect(doc.find('.popover').length).toEqual(1);
      $timeout.flush();
      expect(doc.find('.popover').length).toEqual(0);
    });
    
    it('stay rendered if popover moused off just a bit', function() {
      expect(doc.find('.popover').length).toEqual(0);
      anchElem.mouseenter();
      expect(doc.find('.popover').length).toEqual(1);
      var popover = angular.element(doc.find('.popover'));
      anchElem.mouseleave();
      popover.mouseenter();
      popover.mouseleave();
      expect(doc.find('.popover').length).toEqual(1);
      $timeout.flush();
      expect(doc.find('.popover').length).toEqual(0);
    });
    
    
  });
  
  describe('ngRepeat', function() {
      var markup = '<inspector-gadget>' +
                   ' <inspector-title></inspector-title>' +
                   ' <inspector-content>' + 
                   '  <span ng-repeat="i in [1,2,3]">{{i * 10}}</span>' +
                   ' </inspector-content>' + 
                   '</inspector-gadget>';
      beforeEach(function() {
        scope = $rootScope.$new();
        view = createView(scope, markup);
      });

      it('renders in inspector-content', function() {
        anchElem.mouseenter();
        var content = doc.find('.popover-content');
        expect(content.html()).toContain('10');
        expect(content.html()).toContain('20');
        expect(content.html()).toContain('30');
      });


  });
  
  describe('multiple popovers', function() {
      var anchors = null;
      var inspectors = null;
      var markup = '<inspector-gadget data-placement="bottom">' +
                   ' <div class="btn">'                          +
                   '  <h4>Anchor1</h4> <div>{{name1}}</div>'     +
                   ' </div>' + 
                   ' <inspector-title>' + 
                   ' Title1 <em>{{name1}}</em>' +
                   ' </inspector-title>' +
                   ' <inspector-content>' +
                   '  <p>Mary had a little {{animal}}</p> ' +
                   ' </inspector-content>' +
                   '</inspector-gadget>' +
                   ' ' +
                   '<inspector-gadget data-placement="bottom">' +
                   ' <div class="btn">'                          +
                   '  <h4>Anchor2</h4> <div>{{name2}}</div>'     +
                   ' </div>' + 
                   ' <inspector-title>' + 
                   ' Title2 <em>{{name2}}</em>' +
                   ' </inspector-title>' +
                   ' <inspector-content>' +
                   '  <p>Mary had a little {{animal}}</p> ' +
                   ' </inspector-content>' +
                   '</inspector-gadget>';
      beforeEach(function() {
        scope = $rootScope.$new();
        view = createView(scope, markup);
        anchors = doc.find('.popover-anchor');
        inspectors = doc.find('inspector-gadget');
      });

      it('shows both popover', function() {
        var a1 = angular.element(anchors[0]);
        var a2 = angular.element(anchors[1]);
        scope.name1 = 'Doug';
        scope.name2 = 'Matt';
        scope.$digest();
        a1.mouseenter();
        a2.mouseenter();
        var titles = doc.find('.popover-title');
        var t1 = angular.element(titles[0]);
        var t2 = angular.element(titles[1]);
        expect(titles.length).toEqual(2);
        expect(t1.html().indexOf('Doug')).not.toBe(-1);
        expect(t1.html().indexOf('Matt')).toBe(-1);
        expect(t2.html().indexOf('Doug')).toBe(-1);
        expect(t2.html().indexOf('Matt')).not.toBe(-1);
      });
      
      it('hides only one popover', function() {
        var a1 = angular.element(anchors[0]);
        var a2 = angular.element(anchors[1]);
        a1.mouseenter();
        a2.mouseenter();
        a1.mouseleave();
        $timeout.flush();
        var titles = doc.find('.popover-title');
        expect(titles.length).toEqual(1);
      });
  });

});
