var stepper = (function() {
  return {
    init: function(server, auth) {
      var self = this;
      self.auth = auth;
      self.isAdmin = false;
      self.socket = io.connect(server);

      if (typeof self.auth !== 'undefined') {
        self.socket.on('connected', function() {
          self.authenticate();
        });
      }

      self.socket.on('authenticated', function() {
        self.isAdmin = true;
        self.attachListeners();
      });

      self.socket.on('navigateTo', function(command) {
        if (!self.isAdmin) {
          self.navigateTo(command);
        }
      });
    },
    authenticate: function(auth) {
      this.auth = auth || this.auth;
      this.socket.emit('authenticate', this.auth);
    },
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
    attachListeners: function() {
      var self = this;
      document.addEventListener('keydown', function(e) {
        self.emitKeyboardEvent('keydown', e);
      }, false);
      document.addEventListener('keyup', function(e) {
        self.emitKeyboardEvent('keyup', e);
      }, false);
      document.addEventListener('keypress', function(e) {
        self.emitKeyboardEvent('keypress', e);
      }, false);
    },
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
          document.body.dispatchEvent(e);
        }
      }
    }
  }
}());

