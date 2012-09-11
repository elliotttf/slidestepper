/**
 * @fileoverview Shim for DOM level 3 keyboard events which don't
 * allow setting keyCodes in webkit browsers.
 *
 * @see https://bugs.webkit.org/show_bug.cgi?id=16735
 */

var stepperRevealShim = (function() {
  var supports3DTransforms = document.body.style['WebkitPerspective'] !== undefined ||
                             document.body.style['MozPerspective'] !== undefined ||
                             document.body.style['msPerspective'] !== undefined ||
                             document.body.style['OPerspective'] !== undefined ||
                             document.body.style['perspective'] !== undefined;
  /**
   * Helper function to determine if the overivew is activated.
   */
  function overviewIsActive() {
    return document.querySelector('.reveal').classList.contains('overview');
  }

  /**
   * This method is identical to the reveal equivalent but it uses the
   * event's keyIdentifier property rather than the keyCode and reveal's
   * public navigation/toggle functions.
   */
  function onDocumentKeyDown(event) {
    // Disregard the event if the target is editable, a
    // modifier is present, or the keyCode is set.
    if (event.target.contentEditable !== 'inherit' || event.keyCode !== 0 || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
       return;
    }

    var triggered = false;

    switch (event.keyIdentifier) {
      // p, page up
      case 'p': case 'PageUp': Reveal.navigatePrev(); triggered = true; break;
      // n, page down
      case 'n': case 'PageDown': Reveal.navigateNext(); triggered = true; break;
      // h, left
      case 'h': case 'Left': Reveal.navigateLeft(); triggered = true; break;
      // l, right
      case 'l': case 'Right': Reveal.navigateRight(); triggered = true; break;
      // k, up
      case 'k': case 'Up': Reveal.navigateUp(); triggered = true; break;
      // j, down
      case 'j': case 'Down': Reveal.navigateDown(); triggered = true; break;
      // home
      case 'Home': Reveal.navigateTo(0); triggered = true; break;
      // end
      case 'End': Reveal.navigateTo(Number.MAX_VALUE); triggered = true; break;
      // space
      case 'U+0020': case 'Spacebar':
        if (overviewIsActive()) {
          Reveal.toggleOverview();
        }
        else {
          Reveal.navigateNext();
        }
        triggered = true;
        break;
      // return
      case 'Enter': if (overviewIsActive()) { Reveal.toggleOverview(); triggered = true; } break;
    }

    if (triggered) {
      event.preventDefault();
    }
    else if ((event.keyIdentifier === 'Esc' || event.keyIdentifier === 'U+001B') && supports3DTransforms) {
      Reveal.toggleOverview();
      event.preventDefault();
    }
  }

  return {
    attachListeners: function() {
      document.addEventListener('keydown', onDocumentKeyDown, false);
    },
    detacListeners: function() {
      document.removeEventListener('keydown', onDocumentKeyDown, false);
    }
  };
}());
