using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExpandCylRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_PrescriptionDetail_CYL",
                table: "PrescriptionDetails");

            migrationBuilder.DropCheckConstraint(
                name: "CK_LensVariantAttribute_CylNegative",
                table: "LensVariantAttributes");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PrescriptionDetail_CYL",
                table: "PrescriptionDetails",
                sql: "[CYL] IS NULL OR ([CYL] BETWEEN -6.00 AND 6.00)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_PrescriptionDetail_CYL",
                table: "PrescriptionDetails");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PrescriptionDetail_CYL",
                table: "PrescriptionDetails",
                sql: "[CYL] IS NULL OR ([CYL] BETWEEN -6.00 AND 0.00)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_LensVariantAttribute_CylNegative",
                table: "LensVariantAttributes",
                sql: "[CylMin] <= 0 AND [CylMax] <= 0");
        }
    }
}
