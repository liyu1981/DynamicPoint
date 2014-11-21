;(function() {

  DPPlugins['hello'] = {
    templateHelpers: {
      'speaker': function() {
        return {
          'userList': function() {
            var alluser = _.reduce(this.runStatus.pluginData.hello, function(memo, v) {
              memo.push(v);
              return memo;
            }, []);
            alluser.sort();
            return alluser.join(' , ');
          }
        };
      },
      'author': function() {
        return {};
      },
      'audience': function() {
        return {};
      }
    },

    templateEvents: {
      'speaker': function() {
        return {
        };
      },
      'author': function() {
        return {
        };
      },
      'audience': function() {
        function changedUser() {
          console.log('change user to:', $('#helloName').val());
          var setData = {};
          setData['pluginData.hello.' + Session.get('audienceId')] = $('#helloName').val();
          RunStatus.update({ _id: dpRunStatus._id }, { $set: setData });
        }

        return {
          'blur #helloName': function(event) {
            changedUser();
          },

          'keypress #helloName': function(event) {
            if (event.which === 13) {
              changedUser();
            }
          }
        };
      }
    }
  };

})();
