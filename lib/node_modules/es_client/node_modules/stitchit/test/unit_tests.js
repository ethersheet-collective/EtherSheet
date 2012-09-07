var assert = require('chai').assert,
    _ = require('underscore'),
    stitchit = require('../stitchit');

var TEMPLATE_PATH = __dirname + '/../test/templates/';
var TEST = require('./fixtures');

describe('Stitchit',function(){
  var window, JST;
  
  beforeEach(function(){
    window = {};
  });

  it('given a valid file, should create an eval-able a template string',function(done){
    var path = TEMPLATE_PATH + 'hello.jst';
    stitchit(path,function(err,template){
      assert.ifError(err);
      assert.isString(template);
      eval(template);
      assert.isObject(window.JST);
      JST = window.JST;
      assert.isFunction(JST['hello']);
      assert.equal(JST['hello'](TEST.hello.data),TEST.hello.result);
      done();
    });
  });

  it('given a valid directory, should create an eval-able a template string',function(done){
    var path = TEMPLATE_PATH;
    stitchit(path,function(err,template){
      assert.ifError(err);
      assert.isString(template);
      eval(template);
      assert.isObject(window.JST);
      JST = window.JST;
      assert.isFunction(JST['hello']);
      assert.equal(JST['hello'](TEST['hello'].data),TEST['hello'].result);
      assert.equal(JST['monty'](TEST['monty'].data),TEST['monty'].result);
      done();
    });
  });
  
  it('should return syncronously if not given a callback',function(){
    var template = stitchit(TEMPLATE_PATH);
    assert.isString(template);
    eval(template);
    JST = window.JST;
    assert.equal(JST['hello'](TEST['hello'].data),TEST['hello'].result);
  });

});
