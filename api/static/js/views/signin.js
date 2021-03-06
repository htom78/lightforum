/*global define*/
define([
    'jquery',
    'underscore',
    'underi18n',
    'backbone',
    'i18n/zh-cn',
    'models/simpleuser',
    'text!templates/signin.html',
    'jquery.spin'
], function ($, _, underi18n, Backbone, zh_CN, SimpleUserModel, signinTemplate) {
    'use strict';

    var SigninView = Backbone.View.extend({

        tagName:  'div',
        className: "clearfix",

        // template: _.template(signinTemplate),
        
        events: {
            "click .signin":                        "signin",
            "click .password-reset":                "passwordreset",
            "keypress input[name=username]":        "keypresssignin",
            "keypress input[name=password]":        "keypresssignin",
        },

        initialize: function (options) {
            var zh = new zh_CN();
            var locale = underi18n.MessageFactory(zh);
            this.template = _.template(underi18n.template(signinTemplate, locale));
            _.bindAll(this, 'render', 'signin', 'keypresssignin');
        },

        render: function () {
            this.$el.html(this.template);
            return this;
        },

        passwordreset: function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            Backbone.history.navigate("passwordreset", {trigger: true, replace: true});
        },

        signin: function(e){
            e.stopImmediatePropagation();
            e.preventDefault();

            var username = this.$el.find('input[name=username]').val().trim(),
                password = this.$el.find('input[name=password]').val().trim(),
                self = this,
                csrfmiddlewaretoken = $('meta[name="csrf-token"]').attr('content');

            if(!username){
                this.$el.find('input[name=username]').focus().closest('.form-group').addClass('has-error');
            }
            if(!password){
                this.$el.find('input[name=password]').focus().closest('.form-group').addClass('has-error');
            }

            if(username && password){
                $.ajax({
                    type: 'POST',
                    url: '/accounts/signin/',
                    dataType: 'json',
                    data: { username: username, password: password, csrfmiddlewaretoken: csrfmiddlewaretoken },
                }).done(function(data, textStatus, jqXHR){
                    if(textStatus === 'success'){
                        window.currentuser.set(data);
                        if(window.nexturl){
                            Backbone.history.navigate(window.nexturl, {trigger: true, replace: true});
                        } else {
                            Backbone.history.navigate('', {trigger: true, replace: true});
                        }
                    }
                }).fail(function(jqXHR, textStatus){
                    self.$el.find('input[name=username]').parent().addClass('has-error');
                    self.$el.find('input[name=username]').prev('label').removeClass('hide');
                });
            }
        },

        keypresssignin: function(e) {
            if (e.which !== 13) {
                return;
            }
            this.signin(e);
        },
    });

    return SigninView;
});
