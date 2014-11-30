Template.registerHelper('isEmpty', function(target) {
  return _.isEmpty(target);
});

Template.navbarDPLogo.events({
  'click .dp-brand': function() {
    window.location.href = '/welcome';
  }
});

Template.navbarDropdownToogle.helpers({
  currentUserDisplayName: currentUserDisplayName
});

Template.navbarDropdownLogout.events({
  'click .logoutBtn': function() {
    Meteor.logout(function() {
      window.location.href = '/welcome';
    });
  }
});

Template.navbarDropdownImportFromFile.events({
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

Template.navbarDropdownDPAbout.helpers({
  hasDivider: function() {
    return (this.hasDivider === undefined) ? true : this.hasDivider;
  }
});

var dpAboutHTML = [
'<center>',
'<p><span class="fa-stack fa-3x">',
'  <i class="fa fa-laptop fa-stack-2x"></i>',
'  <i class="fa fa-child fa-stack-1x"></i>',
'</span></p>',
'<p>DynamicPoint, made by LI, Yu in Hong Kong</p>',
'</center>'
].join('');

Template.navbarDropdownDPAbout.events({
  'click #aboutDP': function() {
    alertify.HTMLAlert(dpAboutHTML);
  }
});
