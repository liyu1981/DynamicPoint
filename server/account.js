if (Meteor.settings['account-services']) {
  var as = Meteor.settings['account-services'];
  _.each(as, function(s) {
    logger.info('Loading account service:', s);
    ServiceConfiguration.configurations.remove({ service: s.service });
    ServiceConfiguration.configurations.insert(s);
  });
} else {
  throw Error('No account-services configured in settings.json!');
}

