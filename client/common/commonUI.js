Template.registerHelper('isEmpty', function(target) {
  return _.isEmpty(target);
});

Template.dpNavbarDPLogo.events({
  'click .dp-brand': function() {
    window.location.href = '/welcome';
  }
});

Template.dpNavbarDropdownToogle.helpers({
  currentUserDisplayName: currentUserDisplayName
});

Template.dpNavbarDropdownLogout.events({
  'click .logoutBtn': function() {
    Meteor.logout(function() {
      window.location.href = '/welcome';
    });
  }
});

Template.dpNavbarDropdownImportFromFile.events({
  'click #importMenu': function(event) {
    $('#importMenuFileSelector')
      .on('change', function(event) {
        var fr = new FileReader();
        fr.onload = function(file) {
          Meteor.call('importFile', fr.result, function(err, id) {
            if (err) {
              return alertify.alert('Oops! ' + err.error + '<br><code>' + err.reason + '</code>');
            }
            // not to use Router.go as we want the page refresh
            // Router.go('/author?id=' + id);
            window.location.href = '/author?id=' + id;
          });
        };
        fr.readAsText(event.target.files[0]);
      })
      .click();
  }
});

Template.dpNavbarDropdownAbout.helpers({
  withDivider: function() {
    return (this.withDivider === undefined) ? true : this.withDivider;
  }
});

var dpAboutHTML = [
'<center>',
'<p class="dp-logo"><span class="fa-stack fa-3x">',
'  <i class="fa fa-laptop fa-stack-2x"></i>',
'  <i class="fa fa-child fa-stack-1x"></i>',
'</span></p>',
'<p>DynamicPoint</p>',
'<p>Made by <a href="http://www.github.com/liyu1981">LI Yu</a> in Hong Kong</p>',
'</center>'
].join('');

Template.dpNavbarDropdownAbout.events({
  'click #aboutDP': function() {
    alertify.HTMLAlert(dpAboutHTML);
  }
});
