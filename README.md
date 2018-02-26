# videojs-social-share-overlay

Social share overlay for videojs

## Installation

```sh
npm install --save videojs-social-share-overlay
```

## Usage

To include videojs-social-share-overlay on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-social-share-overlay.min.js"></script>
<script>
  var player = videojs('my-video');

  player.socialShareOverlay();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-social-share-overlay via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-social-share-overlay');

var player = videojs('my-video');

player.socialShareOverlay();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-social-share-overlay'], function(videojs) {
  var player = videojs('my-video');

  player.socialShareOverlay();
});
```

## License

MIT. Copyright (c) Chris Boustead cbous1@gmail.com


[videojs]: http://videojs.com/
