using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Fix_FeatureToggle_CompositeUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FeatureToggle_Scope_ScopeValue",
                table: "FeatureToggles");

            migrationBuilder.DropIndex(
                name: "UX_FeatureToggle_FeatureName",
                table: "FeatureToggles");

            migrationBuilder.CreateIndex(
                name: "UX_FeatureToggle_FeatureName_Global",
                table: "FeatureToggles",
                column: "FeatureName",
                unique: true,
                filter: "[Scope] IS NULL");

            migrationBuilder.CreateIndex(
                name: "UX_FeatureToggle_FeatureName_Scoped",
                table: "FeatureToggles",
                columns: new[] { "FeatureName", "Scope", "ScopeValue" },
                unique: true,
                filter: "[Scope] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_FeatureToggle_FeatureName_Global",
                table: "FeatureToggles");

            migrationBuilder.DropIndex(
                name: "UX_FeatureToggle_FeatureName_Scoped",
                table: "FeatureToggles");

            migrationBuilder.CreateIndex(
                name: "IX_FeatureToggle_Scope_ScopeValue",
                table: "FeatureToggles",
                columns: new[] { "Scope", "ScopeValue" });

            migrationBuilder.CreateIndex(
                name: "UX_FeatureToggle_FeatureName",
                table: "FeatureToggles",
                column: "FeatureName",
                unique: true);
        }
    }
}
