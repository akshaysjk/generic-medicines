var MedicineManager=require('MedicineManager');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
MedicineManager.module("MedicineApp.Show", function (Show) {
    var RecentlyViewedItem = Marionette.ItemView.extend({
        template: "#recently-viewed-listItem-template",
        tagName: "li",
		events: {
            "click .show": "linkClicked"
        },
        linkClicked: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var text = $(e.currentTarget).text().trim();
            this.trigger("link:click", text);
        }
    });

    Show.RecentlyViewed = Marionette.CollectionView.extend({
        childView: RecentlyViewedItem,
        tagName: "ul",
        className: "material-list",
        id: "recently-viewed",
		onChildviewLinkClick:function(view,text){
			this.triggerMethod("link:click", text);
		}
    });

    Show.RecentlyViewedLayout = Marionette.LayoutView.extend({
        template: "#recently-viewed-template",
        regions: {
            "listRegion": "#list-region"
        },
        initialize: function (options) {
            options.collection = this.collection;
        },
		childEvents: {
            "link:click": "onChildLinkClick"
        },
        onChildLinkClick: function (view, text) {
            this.triggerMethod("substitute:show", text);
        },
        onShow: function () {
            var list = new Show.RecentlyViewed({
                collection: this.collection
            });
            this.listRegion.show(list);
        }
    });
});