using System.Web;
using System.Web.Optimization;

namespace MithrilTodo
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/script").Include(
                "~/Scripts/mithril.js",
                "~/Scripts/utils.js",
                // app goes last
                "~/Scripts/app.js"
            ));

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/Content/bootstrap.css",
                "~/Content/ripples.css",
                "~/Content/material-wfont.css",
                "~/Content/app.css"
            ));

#if !DEBUG
            BundleTable.EnableOptimizations = true;
#endif
        }
    }
}