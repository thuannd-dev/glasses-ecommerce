using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAxisConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_CartItem_AxisOD",
                table: "CartItems",
                sql: "[PrescriptionAxisOD] IS NULL OR ([PrescriptionAxisOD] >= 0 AND [PrescriptionAxisOD] <= 180)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CartItem_AxisOS",
                table: "CartItems",
                sql: "[PrescriptionAxisOS] IS NULL OR ([PrescriptionAxisOS] >= 0 AND [PrescriptionAxisOS] <= 180)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_CartItem_AxisOD",
                table: "CartItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CartItem_AxisOS",
                table: "CartItems");
        }
    }
}
