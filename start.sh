# bower part
cd public
bower install
cd -

# prepare settings.json
if [ ! -f ./settings.json ]; then
  echo "{}" >./settings.json
fi

# mongo conf
MONGO_ENV=""
if [ -f ./mongo.env ]; then
  MONGO_ENV=`cat ./mongo.env`
fi

# start
$MONGO_ENV meteor --settings ./settings.json
