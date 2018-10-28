# Webpack sass autoloader
> imports sass files from particular directory and makes a sass file with all imports

## Example
```npm i webpack-sass-autoloader```

```javascript
const WebpackSassAutoloader = require('webpack-sass-autoloader'); // import module

// add plugin to your webpack.config
new WebpackSassAutoloader('/src/sass/partials/')
```

```css
/* add file to style.scss */
@import './imports';
```

**When deleting a file, rerun webpack**
> this wil reset the imports file
The goal is to check it automatically but for now this will have to do.

### More info
The parameter is the directory it has to scan for all partials.
After the scan there will be a imports.scss in /src/sass/ directory.
The only thing you will have to do is add the imports.scss file in your main style.scss file.

If you have your webpack on --watch you won't have to restart your script, the only thing you'll need is to have your webpack rerun.
This can be achieved simply by saving another .scss file.
- add a space
- save file (webpack reruns)
- file was added to your imports

# Todo
check the [github board](https://github.com/LarsVanderheydt/webpack-sass-autoloader/projects/1)
