using System.Web;
using System.Web.Optimization;

namespace MithrilTodo
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.UseCdn = true;

            bundles.Add(
                new ScriptBundle("~/bundles/external", "//cdn.jsdelivr.net/g/es5.shim,lodash@3,mithril@0.1") // velocity
                { CdnFallbackExpression = "window.m" }
                .Include(
                    "~/Scripts/lib/es5-shim.js",
                    "~/Scripts/lib/lodash.js",
                    "~/Scripts/lib/mithril.js"
                )
            );

            bundles.Add(
                new ScriptBundle("~/bundles/firebase", "//cdn.firebase.com/js/client/2.1.2/firebase.js")
                { CdnFallbackExpression = "window.Firebase" }
                .Include("~/Scripts/lib/firebase.js")
            );

            bundles.Add(new ScriptBundle("~/bundles/script").Include(
                "~/Scripts/config.js",
                "~/Scripts/utils.js",
                "~/Scripts/mithrilFire.js",
                "~/Scripts/bootstrap-modal.js",
                "~/Scripts/auth.js",
                // app goes last
                "~/Scripts/app.js"
            ));

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/Content/app.css"
            ));

#if !DEBUG
            BundleTable.EnableOptimizations = true;
#endif
        }
    }
}