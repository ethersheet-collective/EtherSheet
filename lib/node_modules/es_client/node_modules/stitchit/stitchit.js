var _ = require('underscore'),
    Walk = require('./lib/walk'),
    fs = require('fs');

var DEFAULT_NAMESPACE = 'window.JST';
var DEFAULT_COMPILER = '_.template';
var DEFAULT_EXTENSION = 'jst';

module.exports = function stitchit(o,callback){
 var compiler = new TemplateCompiler(o);
 return compiler.compile(callback);
};

var TemplateCompiler = function(o){
  if(_.isString(o)) o = {path: o};
  this.sync = o.sync ? true : false;
  this.path = o.path;
  this.namespace = o.namespace || DEFAULT_NAMESPACE;
  this.compiler = o.compiler || DEFAULT_COMPILER; 
  this.extension = '.' + (o.extension || DEFAULT_EXTENSION);
  this.extension_matcher = RegExp('\\'+this.extension+'$');
  this.templates = '';
  if(!/\./.test(this.namespace))this.templates = "if(typeof "+this.namespace+" === 'undefined') var "+this.namespace+";\n";
  this.templates += this.namespace+" = "+this.namespace+" || {};\n";
};

_.extend(TemplateCompiler.prototype,{
  
  compile: function(cb){
    var tc = this;
    if(!cb) tc.sync = true;

    var onComplete = function(err){
      if(err) return cb(err);
      if(_.isFunction(cb)) cb(null,tc.getTemplates());
    };
    
    var readFileOrDirectory = function(err,stat){
      if(err){
        cb(err);
      } else if(stat.isFile()){
        tc.readTemplateFile(tc.path,onComplete);
      } else if(stat.isDirectory()){ 
        tc.readTemplateDirectory(tc.path,onComplete);
      } else {
        onComplete(new Error( tc.path+' is neither a file nor a directory'));
      }
    };

    if(tc.sync){
      readFileOrDirectory(null,fs.statSync(this.path));
      return tc.getTemplates();
    } else {
      fs.stat(this.path, readFileOrDirectory);
    }
  },

  readTemplateDirectory: function(path,cb){
    var tc = this;
    
    if(tc.sync) this.walker = Walk.walkSync(this.path);
    else this.walker = Walk.walk(this.path);

    this.walker.on('file', function(root, stat, next){
      if(!tc.isTemplateFile(stat.name)) return next();
      tc.readTemplateFile(root+stat.name,next);
    });
    
    this.walker.on('end', function(){
      cb(null);
    });

    this.walker.run();
  },
  
  readTemplateFile: function(path, cb){
    var tc = this;
    var name = path.split('/').pop().split('.')[0];
    var onComplete = function(err,data){
      if(err) return cb(err);
      tc.addTemplate(name,data);
      cb(null);
    };
    
    if(this.sync) onComplete(null,fs.readFileSync(path,'utf8'));
    else fs.readFile(path,'utf8',onComplete);
  },
  
  isTemplateFile: function(path){
    return this.extension_matcher.test(path);
  },

  addTemplate: function(name,template){
    this.templates += this.namespace+"['"+name+"'] = "+this.compiler+"("+JSON.stringify(template)+");\n";
  },

  getTemplates: function(){
    return this.templates;
  }
});
