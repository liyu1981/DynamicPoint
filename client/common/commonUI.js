Template.registerHelper('isEmpty', function(target) {
  return _.isEmpty(target);
});

Template.navbarDPLogo.events({
  'click .dp-brand': function() {
    window.location.href = '/welcome';
  }
});

Template.navbarDropdownDPAbout.events({
  'click #aboutDP': function() {
    alertify.alert('This DynamicPoint. Slides with fun! Made by @liyu.');
  }
});
