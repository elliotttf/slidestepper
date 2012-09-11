var stepper = (function() {
  return {
    /**
     * Constructor
     *
     * @param {string} server
     *   The socket.io server's address.
     * @param {string} auth
     *   The (optional) authentication string. If present, the client
     *   will attempt to authenticate as a presenter after the socket
     *   is connected.
     */
    init: function(server, auth) {
      var self = this;
      self.auth = auth;
      self.hash = window.location.hash;
      self.isAdmin = false;
      self.listening = true;
      self.socket = io.connect(server);

      self.socket.on('connected', function(hash) {
        // Allow the new client to catch up to the presenter.
        if (hash) {
          window.location.hash = hash;
        }
        if (typeof self.auth !== 'undefined') {
          self.authenticate();
        }
      });

      self.socket.on('authenticated', function() {
        self.isAdmin = true;
        self.attachListeners();
      });

      self.socket.on('navigateTo', function(command) {
        if (!self.isAdmin && self.listening) {
          self.navigateTo(command);
        }
      });

      self.socket.on('hashChange', function(hash) {
        self.hash = hash;
        if (self.listening) {
          self.hashChange(hash);
        }
      });

      self.attachClientListeners();
    },

    /**
     * Attaches presenter listeners which result en broadcasting
     * navigation events to clients.
     */
    attachListeners: function() {
      var self = this;

      // Hash events.
      window.addEventListener('hashchange', function(e) {
        self.emitHashChange(e);
      }, false);

      // Key events.
      document.addEventListener('keydown', function(e) {
        self.emitKeyboardEvent('keydown', e);
      }, false);
      document.addEventListener('keypress', function(e) {
        self.emitKeyboardEvent('keypress', e);
      }, false);
      document.addEventListener('keyup', function(e) {
        self.emitKeyboardEvent('keyup', e);
      }, false);

      // Mouse events.
      document.addEventListener('mouseup', function(e) {
        self.emitMouseEvent('mouseup', e);
      }, false);
      document.addEventListener('click', function(e) {
        self.emitMouseEvent('click', e);
      }, false);
    },

    /**
     * Attaches a keydown listener to stop following the presenter
     * if the client navigates away from the slidedhow's position.
     */
    attachClientListeners: function() {
      var self = this;
      // Stop listening for keyboard events if the client navigated away
      // from where the presenter is at.
      document.addEventListener('keydown', function(e) {
        if (!e.slidestepper) {
          self.listening = false;
        }
      }, false);
    },

    /**
     * Sends an authentication request to the server.
     *
     * @param {string} auth
     *   The authentication string to use.
     */
    authenticate: function(auth) {
      this.auth = auth || this.auth;
      this.socket.emit('authenticate', this.auth);
    },

    /**
     * Broadcasts a hash change event to conneted clients.
     *
     * @param {object} e
     *   The event object.
     */
    emitHashChange: function(e) {
      this.socket.emit('hashChange', window.location.hash);
    },

    /**
     * Broadcasts a keyboard event to connected clients.
     *
     * @param {string} type
     *   The keyboard event type.
     * @param {object} e
     *   The event object.
     */
    emitKeyboardEvent: function(type, e) {
      // Polyfill the key info if we don't have the keyIdentifier property.
      if (typeof e.keyIdentifier === 'undefined') {
        identifyKey(e);
      }

      var command = {
        type: type,
        vars: {
          altKey: e.altKey,
          char: e.char,
          charCode: e.charCode,
          ctrlKey: e.ctrlKey,
          keyIdentifier: e.keyIdentifier,
          keyCode: e.keyCode,
          locale: e.locale,
          location: e.location,
          metaKey: e.metaKey,
          repeat: e.repeat,
          shiftKey: e.shiftKey,
          which: e.which
        }
      };
      this.socket.emit('navigateTo', command);
    },

    /**
     * Replays a navigation event on the client.
     *
     * @param {object} command
     *   Command variables to rebuild and dispatch a navigation event.
     */
    navigateTo: function(command) {
      if (command.type === 'keydown' || command.type === 'keyup' || command.type === 'keypress') {
        var e = null;
        if (document.createEvent) {
          e = document.createEvent('KeyboardEvent');
          if (e.initKeyboardEvent) {  // WebKit.
            try {
              e.initKeyboardEvent(command.type,
                true, true, window, command.vars.keyIdentifier, 0, command.vars.ctrlKey,
                command.vars.altKey, command.vars.shiftKey, command.vars.metaKey
              );
            }
            catch (ex) {
            }
          }
          else if (e.initKeyEvent) {  // FF.
            e.initKeyEvent(command.type,
              true, true, window, command.vars.ctrlKey, command.vars.altKey, command.vars.shiftKey,
              command.vars.metaKey, command.vars.keyCode, command.vars.charCode
            );
            e.keyIdentifier = command.vars.keyIdentifier;
          }
        }
        else if (document.createEventObject) {
          e = document.createEventObject();
          e.ctrlKey = command.vars.ctrlKey;
          e.altKey = command.vars.altKey;
          e.shiftKey = command.vars.shiftKey;
          e.metaKey = command.vars.metaKey;
          e.keyCode = command.vars.charCode;  // Emulate IE charcode-in-the-keycode onkeypress.
          e.keyIdentifier = command.vars.keyIdentifier;
        }

        if (e) {
          e.slidestepper = true;
          document.body.dispatchEvent(e);
        }
      }
    },

    /**
     * Updates the client hash.
     *
     * @param {string} hash
     */
    hashChange: function(hash) {
      window.location.hash = hash;
    }
  };
}());

