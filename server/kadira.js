if (Meteor.settings['kadira']) {
  var k = Meteor.settings['kadira'];
  logger.info('Loading kadira service');
  Kadira.connect(k.appId, k.secret);
} else {
  logger.info('No kadira service configured.');
}
