CKEDITOR.editorConfig = function(config) {
  // Configure toolbar options
  config.toolbar = [
    [ 'Bold', 'Italic', 'Underline', 'Strike', 'Superscript', 'Subscript', 'RemoveFormat' ],
    [ 'NumberedList', 'BulletedList', 'Blockquote' ],
    [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ],
    [ 'Link', 'Unlink' ],
    [ 'Format', 'FontSize', 'TextColor' ]
  ];

  config.allowedContent = {
    'h1 h2 h3 h4 h5 h6 p ul ol li blockquote span pre': {
      styles: 'text-align,font-size,color',
      classes: 'fragment'
    },
    'strong em u s del ins': true,
    'a': {
      attributes: '!href,target',
      classes: 'fragment'
    }
  };

  // Enable plugins
  config.extraPlugins = 'link,font,panelbutton,colorbutton';

  // Disable plugins
  //config.removePlugins = 'elementspath,contextmenu';

  config.contentsCss = '/bower_components/ckeditor/skins/moono/editor.css';

  // Remove word formatting
  config.pasteFromWordRemoveFontStyles = true;
  config.pasteFromWordRemoveStyles = true;

  // Don't disable browser/OS spell checking
  config.disableNativeSpellChecker = false;

  // Remove some buttons provided by the standard plugins, which are
  // not needed in the Standard(s) toolbar.
  config.removeButtons = 'Anchor';

  // Available font sizes (label/value)
  config.fontSize_sizes = '16/16px;20/20px;24/24px;32/32px;48/48px;56/56px;64/64px;72/72px;80/80px;96/96px;128/128px;';

  // Set the most common block elements.
  config.format_tags = 'p;h1;h2;h3;pre';

  // Simplify the dialog windows.
  //config.removeDialogTabs = 'image:advanced;link:advanced';
};

