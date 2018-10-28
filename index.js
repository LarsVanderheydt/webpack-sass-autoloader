'use strict';

const fs = require('fs');
const path = require('path');

class WebpackSassAutoloader {
  constructor(dir) {
    const d = dir.split('/')

    /**
     * Get the complete path from where the plugin is called (project root of user)
     */
    this.projectroot = path.resolve('./');

    /**
     * remove . when there is one
     * then add the complete path to define the root
     */
    if (d[0] === '.') d.splice(0, 1);
    this.dir = this.projectroot + `/${d.join('/')}/`;

    /**
     * Get the sassroot 
     * this assumes the given directory is a directory inside the root, so go 1 directory down
     */
    d.splice(-2, 2);
    this.sassroot = `/${d.join('/')}/`;


    /**
     * Define where the imports.scss file should be
     * Normally it will be in the sass or style directory (in directory down from where the user's parameter)
     */
    this.importsfile = this.projectroot + this.sassroot + 'imports.scss';

    this.emptyFile(this.importsfile);
  }

  /**
   * create/empty the imports file
   */
  emptyFile(importsfile) {
    fs.writeFile(importsfile, '', (err) => { if (err) console.log(err) });
  }

  /**
   * append the @import ''; to the file
   */
  append(importsfile, f) {
    fs.appendFile(importsfile, '\n' + `@import "${f}";`, (err) => {
      if (err) console.log(err);
      console.log('\x1b[36m', 'sass-autoload: ', '\x1b[33m', f, '\x1b[0m');
    })
  }

  /**
   * check if the file is already imported if not append to it
   */
  checkFile(importsfile, f, append) {
    fs.readFile(importsfile, 'utf8', function(err, data) {
      if (err) console.log(err);              
      const check = data.search(`@import "${f}";`);
      if (check === -1) append(importsfile, f);
    })
  }

  /**
   * webpack hook
   */
  apply(compiler) {
    const { emptyFile, checkFile, append, dir, projectroot, importsfile } = this;
    
    compiler.hooks.done.tap('WebpackSassAutoloader', function() {
        /**
         * read directory recursive thanks to this stackoverflow answer
         * https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search#5827895
         */
        function walk(dir, done) {
          
          let results = [];
          fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            let pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function(file) {
              file = path.resolve(dir, file);
              fs.stat(file, function(_, stat) {
                if (stat && stat.isDirectory()) {
                  walk(file, function(_, res) {
                    results = results.concat(res);
                    if (!--pending) done(null, results);
                  });
                } else {
                  results.push(file);
                  if (!--pending) done(null, results);
                }
              });
            });
          });
        };
      walk(dir, function(err, res) {
        if (err) console.log(err);        
        if (!fs.existsSync(importsfile)) emptyFile(importsfile);
        
        if (res) {
          console.log('');
          console.log('');

          res.forEach(function(file) {
            const f = file.replace(projectroot, '.');
            checkFile(importsfile, f, append);
          });
        }
      })
    })
  }
}

module.exports = WebpackSassAutoloader;
