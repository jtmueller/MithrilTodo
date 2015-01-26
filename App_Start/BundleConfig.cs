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
                "~/Scripts/config.js",
                "~/Scripts/utils.js",
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