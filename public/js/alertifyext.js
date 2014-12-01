;(function() {

  if (!alertify.dpAbout) {
    //define a new dialog
    alertify.dialog('HTMLAlert', function factory() {
      return{
        build: function() {
          this.setHeader('About');
        },

        setMessage: function(message) {
          var d = document.createElement('DIV');
          d.innerHTML = message;
          this.elements.content.appendChild(d);
        }
      };
    },
    true,
    'alert');
  }

  if (!alertify.codePrompt) {
    alertify.dialog('codePrompt',
      function factory() {
        var textarea = document.createElement('TEXTAREA');
        var p = document.createElement('P');
        return {
          build: function () {
            textarea.className = alertify.defaults.theme.textarea;
            textarea.rows = '8';
            textarea.value = this.get('value');
            this.elements.content.appendChild(p);
            this.elements.content.appendChild(textarea);
          },

          setMessage: function (message) {
            if (typeof message === 'string') {
              p.innerHTML = message;
            } else if (message instanceof window.HTMLElement && p.firstChild !== message) {
              p.innerHTML = '';
              p.appendChild(message);
            }
          },

          settingUpdated: function(key, oldValue, newValue) {
            switch (key) {
              case 'message':
                this.setMessage(newValue);
                break;
              case 'value':
                textarea.value = newValue;
                break;
              case 'labels':
                if (newValue.ok && this.__internal.buttons[0].element) {
                  this.__internal.buttons[0].element.innerHTML = newValue.ok;
                }
                if (newValue.cancel && this.__internal.buttons[1].element) {
                  this.__internal.buttons[1].element.innerHTML = newValue.cancel;
                }
                break;
              case 'reverseButtons':
                if (newValue === true) {
                  this.elements.buttons.primary.appendChild(this.__internal.buttons[0].element);
                } else {
                  this.elements.buttons.primary.appendChild(this.__internal.buttons[1].element);
                }
              break;
            }
          },

          callback: function (closeEvent) {
            var returnValue;
            switch (closeEvent.index) {
              case 0:
                this.value = textarea.value;
              if (typeof this.get('onok') === 'function') {
                returnValue = this.get('onok').call(undefined, closeEvent, this.value);
                if (typeof returnValue !== 'undefined') {
                  closeEvent.cancel = !returnValue;
                }
              }
              break;
              case 1:
                if (typeof this.get('oncancel') === 'function') {
                returnValue = this.get('oncancel').call(undefined, closeEvent);
                if (typeof returnValue !== 'undefined') {
                  closeEvent.cancel = !returnValue;
                }
              }
              break;
            }
          }
        };
      },
      true,
      'prompt');

    alertify.defaults.theme.textarea = 'form-control';
  }

})();
