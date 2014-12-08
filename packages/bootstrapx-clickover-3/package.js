Package.describe({
  summary: "Bootstrapx-clicover for bootstrap 3 packaged for Meteor."
});

Package.on_use(function(api) {
  api.use(['mrt:bootstrap-3'], 'client');
  api.add_files(['bootstrapx-clickover/js/bootstrapx-clickover.js'], 'client');
});
