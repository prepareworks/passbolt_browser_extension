/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'security_token',
        'label': '4. Set a security token',
        'title': 'We need a visual cue to protect us from the bad guys..',
        'parents': ['key_info', 'backup_key'],
        'next': 'password',
        'viewData': {},
        'elts' : {
            securityTokenBgColor : '#js_security_token_background',
            securityTokenTextColor : '#js_security_token_color',
            securityTokenText : '#js_security_token_text',
            feedback : '#js_field_name_feedback'
        },
        'options' : {
            txtpossible : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-',
            colorpossible : 'ABCDEF0123456789'
        },
        data: {
            securityToken : {}
        }
    };

    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    /**
     * On token change event.
     *
     * Triggered when the token has been modified by the user.
     */
    step.onTokenChange = function() {
        // Validate token, only if fully set.
        var securityToken = this._getToken();
        step._validateToken(securityToken)
            .then(function() {
                step.elts.$feedback.addClass('hidden');
                passbolt.setup.setActionState('submit', 'enabled');
            });
    }

    /**
     * On error.
     */
    step.onError= function(errorMessage, validationErrors) {
        var html = '';
        if (validationErrors != undefined) {
            html += '<ul>';
            for (var i in validationErrors) {
                var valError = validationErrors[i];
                html += '<li>' + valError[Object.keys(valError)[0]] + '</li>';
            }
            html += '</ul>';
        }

        step.elts.$feedback
            .removeClass('hidden')
            .html(html);
    }

    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
     */
     step.init = function () {
        return passbolt.setup.get('settings.securityToken').then(function(securityToken) {
            securityToken.color = securityToken.color || step._getRandomColor();
            securityToken.code = securityToken.code || step._getRandomText();
            securityToken.textcolor = securityToken.textcolor || '';

            step.data.securityToken = securityToken;
        });
    };

    /**
     * Implements start().
     */
    step.start = function () {
        // Color picker.
        step._initColorPicker();

        // Set security token.
        step._setToken(step.data.securityToken);

        // Check that the pre-filled values unlock the submit button.
        if (step.elts.$securityTokenBgColor.val().length != 7 || step.elts.$securityTokenText.val().length != 3) {
            passbolt.setup.setActionState('submit', 'disabled');
        }

        // While changing the security token value.
        $(step.elts.securityTokenBgColor + ', ' + step.elts.securityTokenText).on('input', function () {
            step.onTokenChange();
        });
    };

    /**
     * Implements submit().
     *
     * Validate token set by user, and save it in setup.
     *
     * @returns {*}
     */
    step.submit = function () {

        passbolt.setup.setActionState('submit', 'processing');

        var securityToken = this._getToken();

        return step._validateToken(securityToken)
            .then(function() {
                passbolt.setup.set('settings.securityToken', securityToken);
            });
    };

    /**
     * Implements cancel().
     * @returns {*}
     */
    step.cancel = function () {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    /* ==================================================================================
     *  Business functions
     * ================================================================================== */

    /**
     * Validate token.
     *
     * @param tokenData
     * @returns {Deferred}
     *
     * @private
     */
    step._validateToken = function(tokenData) {
        return passbolt.request('passbolt.user.settings.validate', {securityToken : tokenData}, ['securityToken'])
            .fail(function(errorMessage, validationErrors) {
                step.onError(errorMessage, validationErrors);
                passbolt.setup.setActionState('submit', 'disabled');
            });
    }


    /**
     * Get security token from page, and return corresponding object.
     *
     * @returns {{code: *, color: *, textcolor: *}}
     *
     * @private
     */
    step._getToken = function() {
        var securityToken = {
            code : step.elts.$securityTokenText.val(),
            color : step.elts.$securityTokenBgColor.val(),
            textcolor : step.elts.$securityTokenTextColor.val()
        };
        return securityToken;
    };

    /**
     * Set token in page.
     *
     * @param object securityToken
     *   as per model.
     *
     * @private
     */
    step._setToken = function(securityToken) {
        step.elts.$securityTokenText.val(securityToken.code);
        step.elts.$securityTokenTextColor.val(securityToken.textcolor);
        step.elts.$securityTokenBgColor.val(securityToken.color);
        step.fb.setColor(securityToken.color);
    }

    /**
     * Init color picker.
     *
     * @private
     */
    step._initColorPicker = function() {

        step.fb = $.farbtastic('#js_colorpicker');

        // callback on color picking selection.
        step.fb.linkTo(function (color) {
            var txtcolor = step._calculateTextColor();
            step.elts.$securityTokenText
                .css('color', txtcolor)
                .css('background-color', color);
            step.elts.$securityTokenBgColor.val(color);
            step.elts.$securityTokenTextColor.val(txtcolor);
        });
    };

    /**
     * Calculate text color based on background color defined in color picker.
     *
     * @returns {string}
     * @private
     */
    step._calculateTextColor = function() {
        return step.fb.hsl[2] > 0.5 ? '#000' : '#fff';
    };

    /**
     * Get a generated random color.
     *
     * @returns {string}
     *
     * @private
     */
    step._getRandomColor = function() {
        var randomColor = '';
        for (var i = 0; i < 6; i++) {
            randomColor += step.options.colorpossible.charAt(Math.floor(Math.random() * step.options.colorpossible.length));
        }
        return '#' + randomColor;
    };

    /**
     * Get a generated random text.
     *
     * @returns {string}
     *
     * @private
     */
    step._getRandomText = function() {
        var randomText = '';
        for (var i = 0; i < 3; i++) {
            randomText += step.options.txtpossible.charAt(Math.floor(Math.random() * step.options.txtpossible.length));
        }
        return randomText;
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
