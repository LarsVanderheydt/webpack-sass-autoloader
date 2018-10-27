'use strict';

const fs = require('fs');
const path = require('path');

class WebpackSassAutoloader {
  constructor(dir) {
    const d = dir.split('/')

    if (d[0] === '.') d.splice(0, 1);
    this.dir = `/${d.join('/')}/`

    d.splice(-2, 2);
    this.sassroot = `/${d.join('/')}/`
  }

  apply(compiler) {
    const dir = path.resolve('./') + this.dir;
    const sassroot = this.sassroot;
    const projectroot = path.resolve('./');
    const importsfile = projectroot + sassroot + 'imports.scss';
    
    compiler.hooks.done.tap('WebpackSassAutoloader', () => {
      const walk = function(dir, done) {
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

        if (!fs.existsSync(importsfile)) {
          fs.writeFile(importsfile, '', (err) => { 
            if (err) console.log(err) 
          });
        }
        
        if (res) {
          console.log('');
          console.log('');
          res.forEach(file => {
            const f = file.replace(projectroot, '.');            
            fs.readFile(importsfile, 'utf8',(err, data) => {
              if (err) console.log(err);
              const check = data.search(`@import '${f}';`);
  
              if (check === -1) {
                fs.appendFile(importsfile, '\n' + `@import '${f}';`, function(err) {
                  if (err) console.log(err);
                  console.log('\x1b[36m','sass-autoload: ', '\x1b[33m', f, '\x1b[0m');
                })
              }
            })
          })
        }

      })
      
    })
  }
}

module.exports = WebpackSassAutoloader;
