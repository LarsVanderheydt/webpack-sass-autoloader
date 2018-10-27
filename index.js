'use strict';

const fs = require('fs');
const path = require('path');

class WebpackShellPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { sassroot, file: style } = this.options.sass;
    const importsfile = __dirname + sassroot + 'imports.scss';

    compiler.hooks.done.tap('WebpackShellPlugin', () => {
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

      walk(this.options.sass.dir, function(err, res) {
        if (err) console.log(err);

        if (!fs.existsSync(importsfile)) {
          fs.writeFile(importsfile, '', (err) => { if (err) throw err });
        }
      
        res.forEach(file => {
          const f = file.replace(__dirname + sassroot, './');

          fs.readFile(importsfile, 'utf8',(err, data) => {
            if (err) throw err;
            const check = data.search(`@import '${f}';`);

            if (check === -1) {
              fs.appendFile(importsfile, '\n' + `@import '${f}';`, function(err) {
                if (err) throw new Error(err);
                console.log(`${f} imported to ${style}`);
              })
            }
          })
        })

      })
      
    })
  }
}

module.exports = WebpackShellPlugin;
