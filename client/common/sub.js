sub = function() {
  logger.info('will sub:', dpMode, dpUrlParams);
  switch(dpMode) {
    case 'profile':
      return Meteor.subscribe('Decks');

    case 'author':
      return Meteor.subscribe('Decks', dpUrlParams.query.id);

    case 'welcome':
    case 'qrcode':
    case 'pairview':
    case 'superview':
    case 'export':
      break;

    case 'audience':
    case 'speaker':
      return [
        Meteor.subscribe('Decks', dpUrlParams.query.id),
        Meteor.subscribe('RunStatus', dpUrlParams.query.id, dpUrlParams.query.runId)
      ];
  };
}
