;(function() {

  DPPlugins['hello'] = {
    templateHelpers: {
      'speaker': function() {
        return {
          'userList': function() {
            console.log('called me:', this);
            return _.reduce(this.runStatus.users, function(memo, v) {
              return memo + v + ' , ';
            }, '');
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
      'speaker': function(context) {
        return {
        };
      },
      'author': function(context) {
        return {
        };
      },
      'audience': function(context) {
        return {
          'click #ok': function(event) {
            console.log('we got:', $('input#name').val());
            var setData = {};
            setData['users.' + context.audience.id] = $('input#name').val();
            console.log('will update:', setData);
            RunStatus.update({ _id: context.runStatusId }, { $set: setData });
          }
        };
      }
    }
  };

})();
