DPPlugins['hello'] = {
  templateHelpers: {
    'speaker': function() {
      return {
        'userList': function() {
          var dpprt = Template.instance().dpprt;
          var alluser = _.reduce(dpprt.getPluginData(this), function(memo, v) {
            memo.push(v);
            return memo;
          }, []);
          alluser.sort();
          return alluser.join(' , ');
        }
      };
    }
  },

  templateEvents: {
    'audience': function() {
      function changedUser(ctx) {
        var dpprt = Template.instance().dpprt;
        var setData = {};
        var pluginDataPrefix = dpprt.getPluginDataPrefix();
        setData[pluginDataPrefix + Session.get('audienceId')] = ctx.find('#helloName').val();
        dpprt.update({ $set: setData });
      }

      return {
        'blur #helloName': function(event) {
          changedUser($(event.currentTarget).closest('section'));
        },

        'keypress #helloName': function(event) {
          if (event.which === 13) {
            changedUser($(event.currentTarget).closest('section'));
          }
        }
      };
    }
  }
};
