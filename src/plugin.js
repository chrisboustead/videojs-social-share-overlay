import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-social-share-overlay')
  player.socialShareOverlay = new SocialShareOverlayPlugin(player, options)
}

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function socialShareOverlay
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const socialShareOverlay = function (options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options))
  })
}

class SocialShareOverlayPlugin {

  constructor (player, options) {
    this.player = player
    this.options = options
    this.createShareButton()
  }

  createShareButton () {

    const self = this
    const player = this.player
    const videoJsButtonClass = videojs.getComponent('Button')
    const concreteButtonClass = videojs.extend(videoJsButtonClass, {

      constructor () {
        videoJsButtonClass.call(this, player, {title: player.localize('Share')})
      },
      handleClick () {
        self.showShareOverlay()
      }
    })

    this._socialShareButton = new concreteButtonClass()

    const placementIndex = player.controlBar.children().length - 2
    const concreteButtonInstance = player.controlBar.addChild(this._socialShareButton, {componentClass: 'socialShare'}, placementIndex)
    concreteButtonInstance.addClass('vjs-social-share')
    concreteButtonInstance.addClass('vjs-icon-share')
    concreteButtonInstance.removeClass('vjs-hidden')

  };

  createOverlayEl () {
    const player = this.player
    this.shareOverlayEl = document.createElement('div')
    this.shareOverlayEl.className += 'vjs-share-overlay'
    this.shareOverlayEl.innerHTML = this.shareTemplate()
    const closeButton = this.shareOverlayEl.querySelector('.vjs-share-overlay-header button')
    closeButton.addEventListener('click', () => this.hideShareOverlay())
    this.bindShareEvents()
    player.el().appendChild(this.shareOverlayEl)
    this.requireClipboard()
  }

  bindShareEvents () {
    const buttons = this.shareOverlayEl.querySelectorAll('.vjs-share-overlay-button')
    for (let i = 0; i < buttons.length; ++i) {
      const button = buttons[i]
      const platform = button.dataset.platform
      button.addEventListener('click', () => this.doShareAction(platform))
    }
  }

  doShareAction (platform) {
    const shareUrl = this.options.url || ''
    const windowOptions = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600'
    switch (platform) {
      case 'link':
        const copyBtn = this.shareOverlayEl.querySelector('.copy-link')
        copyBtn.classList.add('copied')
        setTimeout(() => {
          copyBtn.classList.remove('copied')
        }, 1500)
        break
      case 'facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl), windowOptions)
        break
      case 'twitter':
        window.open(this.getTwitterShareLink(this.options.title || '', shareUrl), windowOptions)
        break
      case 'email':
        window.open(this.getEmailShareLink(this.options.title || '', shareUrl), windowOptions)
        break
    }
  }

  set(config){
    this.options = config;
    this.populateShareOverlay;
  }

  populateShareOverlay () {
    if(!this.shareOverlayEl) {
      return;
    }
    const title = this.shareOverlayEl.querySelector('.vjs-share-overlay-title')
    const desc = this.shareOverlayEl.querySelector('.vjs-share-overlay-description')
    const link = this.shareOverlayEl.querySelector('.vjs-share-overlay-link')
    const buttons = this.shareOverlayEl.querySelectorAll('.vjs-share-overlay-button')
    title.innerHTML = this.options.title || ''
    desc.innerHTML = this.options.description || ''
    link.innerText = this.options.url || ''
    for (let i = 0; i < buttons.length; ++i) {
      const button = buttons[i]
      const platform = button.dataset.platform
      if (this.options.platforms && this.options.platforms.indexOf(platform) >= 0) {
        // show the button
        button.classList.remove('vjs-hidden')
      } else {
        // hide the button
        button.classList.add('vjs-hidden')
      }
    }
  }

  showShareOverlay() {
    if(!this.shareOverlayEl) {
      this.createOverlayEl();
    }
    this.populateShareOverlay();
    this.onSharePausedState = this.player.paused();
    this.player.pause();
    this.player.addClass("vjs-social-share-overlay-open");
    this.player.trigger('share-overlay-open');
  }

  hideShareOverlay() {
    if(!this.onSharePausedState){
      this.player.play();
    }
    this.player.removeClass("vjs-social-share-overlay-open");
    this.player.trigger('share-overlay-closed');
  }

  shareTemplate() {
    return `<div class="vjs-share-overlay-main">`+
        `<div class="vjs-share-overlay-controls">` +
            `<h3 class="vjs-share-overlay-header">` +
              `<span>Share Video</span>` +
              `<button>&times;</button>` +
            `</h3>` +
            `<div class="vjs-share-overlay-buttons">` +
              `<button class="vjs-share-overlay-button copy-link" data-platform="link" data-clipboard-target=".vjs-share-overlay-link"></button>` +
              `<button class="vjs-share-overlay-button facebook vjs-icon-facebook" data-platform="facebook"></button>` +
              `<button class="vjs-share-overlay-button twitter vjs-icon-twitter" data-platform="twitter"></button>` +
              `<button class="vjs-share-overlay-button email vjs-icon-share" data-platform="email"></button>` +
            `</div>` +
            `<div class="vjs-share-overlay-link"></div>` +
          `</div>` +
        `</div>` +
        `<div class="vjs-share-overlay-footer">` +
          `<h2 class="vjs-share-overlay-title"></h2>` +
          `<p class="vjs-share-overlay-description"></p>` +
        `</div>`;
  }

  requireClipboard(){
    if(!this.clipboardInitialized) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.16/clipboard.min.js';
      script.onload = this.attachClipboard;
      document.body.appendChild(script);
    }else{
      this.attachClipboard();
    }
    this.clipboardInitialized = true;
  }

  attachClipboard (){
    if(typeof Clipboard !== 'undefined') {
      let clip = new Clipboard('.vjs-share-overlay-button.copy-link');
      console.log('attached', clip);
    }
  }

  stringifyObject(obj) {
    let str = [];
    for(let p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }


    getTwitterShareLink (title, url){

    const link = 'https://twitter.com/intent/tweet?';

    const params = {
      url : url,
      text : title,
    };

    if(this.options.via) {
      params.via = this.options.via;
    }

    return link + this.stringifyObject(params);

  }


    getEmailShareLink (title, shareLink){

    const link = 'mailto:?';
    const body = (this.options.emailBody ? this.options.emailBody + "\n\n" : '')
      + title + "\n\n"
      + shareLink;
    const params = {
      subject : title,
      body : body
    };

    return link + this.stringifyObject(params);

  }



}

// Register the plugin with video.js.
registerPlugin('socialShareOverlay', socialShareOverlay);

// Include the version number.
socialShareOverlay.VERSION = VERSION;

export default socialShareOverlay;
