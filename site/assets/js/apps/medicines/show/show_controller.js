MedicineManager.module("MedicineApp.Show", function (Show, MedicineManager, Backbone, Marionette, $, _) {
    Show.Controller = {
        showMedicine: function (medicine) {
            var showLayout = new Show.LayoutView();
            MedicineManager.mainRegion.show(showLayout);

            var details = MedicineManager.request("details:entities", medicine);
            var substitutes = MedicineManager.request("substitute:entities", medicine);
            var recentlyViewed = MedicineManager.request("recentlyViewed:entities");

            $.when(details, substitutes).then(function (details, substitutes) {
                //medicine name in title
                var titleView = new Show.Title({
                    model: details
                });
                showLayout.titleRegion.show(titleView);

                //view showing details of medicine
                var detailsView = new Show.Details({
                    model: details
                });
                showLayout.detailsRegion.show(detailsView);


                //medicine substitutes
                var substitutesView = new Show.Substitutes({
                    collection: substitutes,
                    referencePrice: details.get("medicine")["unit_price"]
                });
                substitutesView.on("substitute:show", this.showSubstitute);
                showLayout.substitutesRegion.show(substitutesView);


                //cheapest substitutes    
                var cheapestSubstitutesView = new Show.CheapestSubstitutes({
                    substitutes: substitutes,
                    medicine: details
                });
                showLayout.cheapestSubstitutesRegion.show(cheapestSubstitutesView);

                //recently viewed
                var recentlyViewedView = new Show.RecentlyViewedLayout({
                    collection: recentlyViewed
                });
                showLayout.recentlyViewedRegion.show(recentlyViewedView);
            }.bind(this));
        },
        showSubstitute: function (medicine) {
            MedicineManager.trigger("medicine:show", medicine);
        }
    };
});