sub = function(callback) {
  logger.info('will sub:', dpMode, dpUrlParams);
  switch(dpMode) {
    case 'profile':
      Meteor.subscribe('Decks', callback);
      break;

    case 'author':
      Meteor.subscribe('Decks', dpUrlParams.query.id, callback);
      break;

    case 'welcome':
    case 'qrcode':
    case 'pairview':
    case 'superview':
    case 'export':
      break;

    case 'audience':
    case 'speaker':
      Meteor.subscribe('Decks', dpUrlParams.query.id, function() {
        Meteor.subscribe('RunStatus', dpUrlParams.query.id, dpUrlParams.query.runId, callback);
      });
      break;
  };
}
