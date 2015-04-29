// When the page has been initialized.
$(document).bind('template-ready', function() {

  // In progress event.
  passbolt.message('passbolt.progress_dialog.progress')
    .subscribe(function(token, message, completedGoals) {
      var percent = Math.round((100 * completedGoals) / passbolt.context.goals);
      if (percent == 100) {
        message = 'completed';
      }
      $('#js_progress_step_label', document).text(message);
      $('#js_progress_percent', document).text(percent);
      $('#js_progress_bar').css('width', percent + '%');
    });

  // The user wants to close the dialog.
  $('.js-dialog-close').on('click', function(ev) {
    ev.preventDefault();
    passbolt.messageOn('App', 'passbolt.progress_dialog.close');
  });

});

// Init the page with a template.
initPageTpl();