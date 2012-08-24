slidestepper
============

A socket.io based HTML slide deck controller.

## Configuration

On the server, copy ```config/example.config.json``` to ```config/config.json```
and set the password that you'd like you use for the presenter.

Start the application by running ```node app.js```

On the presenter's client, open a JavaScript console and execute the following:

```JavaScript
stepper.authorize('superSecretPassword'); // Replace superSecretPassword with the presenter's password.
```

## Notes/ TODO

* If a user breaks from the presentation there is not currently a way to catch
back up without reloading the page.
* Due to some wacky behavior with KeyboardEvents and webkit you'll likely need
to shim in keyboard listeners for your slide deck. There's an example of doing
this for reveal.js in ```client/slidestepper-client.reveal.js```.
* ```keyboard.js``` polyfill sourced from [Calormen's W3C Keyboard Events Helper](http://calormen.com/polyfill/#keyboard).
