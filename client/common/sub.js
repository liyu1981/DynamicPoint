sub = function() {
  logger.info('will sub:', dpMode, dpUrlParams);
  switch(dpMode) {
    case 'profile':
      return [
        Meteor.subscribe('DPConf'),
        Meteor.subscribe('Decks', Meteor.userId())
      ];

    case 'author':
      return [
        Meteor.subscribe('DPConf'),
        Meteor.subscribe('Decks', Meteor.userId(), dpUrlParams.query.id)
      ];

    case 'welcome':
    case 'qrcode':
    case 'pairview':
    case 'superview':
    case 'export':
      return [
        Meteor.subscribe('DPConf')
      ];

    case 'audience':
    case 'speaker':
      return [
        Meteor.subscribe('DPConf'),
        Meteor.subscribe('Decks', Meteor.userId() || dpUrlParams.query.ownerId, dpUrlParams.query.id),
        Meteor.subscribe('RunStatus', Meteor.userId() || dpUrlParams.query.ownerId, dpUrlParams.query.id, dpUrlParams.query.runId)
      ];
  };
};
