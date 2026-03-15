using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnforceOrderItemPrescriptionOrderIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Prescriptions_PrescriptionId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_PrescriptionId",
                table: "OrderItems");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Prescriptions_Id_OrderId",
                table: "Prescriptions",
                columns: new[] { "Id", "OrderId" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_PrescriptionId_OrderId",
                table: "OrderItems",
                columns: new[] { "PrescriptionId", "OrderId" });

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Prescriptions_PrescriptionId_OrderId",
                table: "OrderItems",
                columns: new[] { "PrescriptionId", "OrderId" },
                principalTable: "Prescriptions",
                principalColumns: new[] { "Id", "OrderId" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Prescriptions_PrescriptionId_OrderId",
                table: "OrderItems");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Prescriptions_Id_OrderId",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_PrescriptionId_OrderId",
                table: "OrderItems");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_PrescriptionId",
                table: "OrderItems",
                column: "PrescriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_Prescriptions_PrescriptionId",
                table: "OrderItems",
                column: "PrescriptionId",
                principalTable: "Prescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
