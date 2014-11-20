if (Meteor.settings['kadira']) {
  var k = Meteor.settings['kadira'];
  if (k.disable) {
    logger.info('kadira service disabled.');
  } else {
    logger.info('Loading kadira service');
    Kadira.connect(k.appId, k.secret);
  }
} else {
  logger.info('No kadira service configured.');
}
