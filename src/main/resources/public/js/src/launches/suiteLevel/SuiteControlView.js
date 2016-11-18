/**
 * Created by Alexey_Krylov1 on 8/22/2016.
 */
/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var FilterModel = require('filters/FilterModel');
    var App = require('app');
    var InfoPanelView = require('launches/common/InfoPanelView');
    var Localization = require('localization');

    var config = App.getInstance();

    var SuiteControlView = Epoxy.View.extend({
        events: {
            'click [data-js-refresh]': 'onClickRefresh',
            'click [data-js-milti-delete]': 'onClickMultiDelete',
            'click [data-js-history]': 'onClickHistory'
        },

        bindings: {
            '[data-js-history]': 'attr: {href:getHistoryHref, style: validateForHistoryBtn}'
        },

        computeds: {
            validateForHistoryBtn: function(){
                var interrupted = config.launchStatus.interrupted,
                    showBtn = this.parentModel.get('status') !== interrupted && this.launchModel.get('status') !== interrupted ;
                return 'display: ' + ( !showBtn ? 'none' : 'inline-block' );
            },
            getHistoryHref: function(){
                return this.getHistoryLink();
            }
        },

        template: 'tpl-launch-suite-control',
        initialize: function(options) {
            this.filterModel = options.filterModel;
            this.parentModel = options.parentModel;
            this.launchModel = options.launchModel;
            this.collectionItems =  options.collectionItems;
            this.render();
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-refine-entities]', this.$el),
                filterLevel: 'suit',
                model: this.filterModel
            });
            this.infoLine = new InfoPanelView({
                el: $('[data-js-info-line]', this.$el),
                model: this.parentModel,
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        activateMultiple: function() {
            $('[data-js-refresh]', this.$el).addClass('disabled');
            $('[data-js-milti-delete]', this.$el).removeClass('disabled').attr({title: Localization.launches.deleteBulk});
        },
        onClickMultiDelete: function() {
            this.trigger('multi:action', 'remove');
        },
        disableMultiple: function() {
            $('[data-js-refresh]', this.$el).removeClass('disabled');
            $('[data-js-milti-delete]', this.$el).addClass('disabled').attr({title: Localization.launches.actionTitle});
        },
        onClickRefresh: function() {
            this.collectionItems.load();
        },
        getHistoryLink: function(){
            var currentPath = window.location.hash;
            currentPath += '&history.item=' + this.parentModel.get('id');
            return currentPath;
        },
        onClickHistory: function(e){
            e.preventDefault();
            config.router.navigate(this.getHistoryLink(), {trigger: true});
        },
        destroy: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.infoLine && this.infoLine.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });

    return SuiteControlView;
});
