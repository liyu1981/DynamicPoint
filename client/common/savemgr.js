// this is the save manager, all saving will be done through this
dpSaveMgr = (function () {
  function SaveMgr() {
    this.queue = [];
    this.savingQueue = null;
    this.saving = false;
    this.pendingSaving = 0;
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

  SaveMgr.prototype.saveNow = function() {
    if (this.saving) {
      // in saving, just pending the request and exit
      this.pendingSaving += 1;
      return;
    }
    this.saving = true;
    var cb = this.saveNowCb;
    // each time to save, we move this.queue to this.savingQueue, so that
    // others can add more saving request when we are saving.
    this.savingQueue = this.queue;
    this.queue = [];
    logger.info('saveMgr saveNow:', this.savingQueue);
    cb(this.saving);
    _.each(this.savingQueue, function(item) {
      logger.info('will save:', item);
      if (item.payload) {
        item.collection[item.action]({ _id: item.documentId }, item.payload);
      } else {
        item.collection[item.action]({ _id: item.documentId });
      }
    });
    this.savingQueue = null;
    this.saving = false;
    cb(this.saving);
    if (this.pendingSaving > 0) {
      // if there is pending request, do them
      this.pendingSaving -= 1;
      this.saveNow();
    }
  };

  // the singleton
  return new SaveMgr();
})();

