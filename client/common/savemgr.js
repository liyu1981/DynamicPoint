// this is the save manager, all saving will be done through this
dpSaveMgr = (function () {
  function SaveMgr() {
    this.queue = [];
    this.saving = false;
    this.saveNowCb = function() {};
  }

  SaveMgr.prototype.add = function(collection, action, documentId, payload) {
    logger.info('saveMgr add:', [collection, action, documentId, payload]);
    this.queue.push({
      collection: collection,
      action: action,
      documentId: documentId,
      payload:payload
    });
  };

  SaveMgr.prototype.saveNow = function(callback) {
    logger.info('saveMgr saveNow:', this.queue.length);
    this.saving = true;
    callback = callback || this.saveNowCb;
    callback(this.saving);
    _.each(this.queue, function(item) {
      logger.info('will save:', item);
      if (item.payload) {
        item.collection[item.action]({ _id: item.documentId }, item.payload);
      } else {
        item.collection[item.action]({ _id: item.documentId });
      }
    });
    this.queue = [];
    this.saving = false;
    callback(this.saving);
  };

  // the singleton
  return new SaveMgr();
})();

