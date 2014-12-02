// this is the save manager, all saving will be done through this
dpSaveMgr = (function () {
  function optimizeQueue(queue) {
    // currently very simple optimization, we just remove duplication
    var result = [];
    var last = null;
    _.each(queue, function(item) {
      if (last === null) {
        result.push(item);
      } else {
        if (last.collection === item.collection && last.action === item.action && last === documentId) {
          if (_.isEqual(last.payload, item.payload)) {
            // same, so do nothing to ignore it
          } else {
            last = item;
            result.push(item);
          }
        } else {
          last = item;
          result.push(item);
        }
      }
    });
    return result;
  }

  function SaveMgr() {
    this.queue = [];
    this.savingQueue = null;
    this.saving = false;
    this.pendingSaving = 0;
    this.saveNowCb = function() {};
    this.autoSaveTimerID = null;
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
    // each time to save, we move this.queue to this.savingQueue, so that
    // others can add more saving request when we are saving.
    if (this.queue.length > 0) {
      var cb = this.saveNowCb;
      this.saving = true;
      this.savingQueue = optimizeQueue(this.queue);
      this.queue = [];
      logger.info('saveMgr saveNow:', this.savingQueue.length, 'items');
      logger.info(' => ', this.savingQueue);
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
    } else {
      logger.info('saveMgr save skipped due to empty queue.');
    }
    if (this.pendingSaving > 0) {
      // if there is pending request, do them
      this.pendingSaving -= 1;
      this.saveNow();
    }
  };

  SaveMgr.prototype.autoSave = function(period) {
    var self = this;
    if (this.autoSaveTimerID) {
      clearInterval(this.autoSaveTimerID);
    }
    this.autoSaveTimerID = setInterval(function() { self.saveNow(); }, period * 1000);
  };

  // the singleton
  return new SaveMgr();
})();

if (Meteor.settings.public['client-author']) {
  var p = deepGet(Meteor.settings.public['client-author'], ['autosave'], 0);
  if (p > 0) {
    logger.info('autosave started: every', p, 's');
    dpSaveMgr.autoSave(p);
  } else {
    logger.info('autosave disabled.');
  }
}

