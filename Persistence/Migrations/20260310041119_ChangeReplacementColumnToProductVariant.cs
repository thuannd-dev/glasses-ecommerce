using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeReplacementColumnToProductVariant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AfterSalesTickets_OrderItems_ReplacementOrderItemId",
                table: "AfterSalesTickets");

            migrationBuilder.RenameColumn(
                name: "ReplacementOrderItemId",
                table: "AfterSalesTickets",
                newName: "ReplacementProductVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_AfterSalesTicket_ReplacementOrderItemId",
                table: "AfterSalesTickets",
                newName: "IX_AfterSalesTicket_ReplacementProductVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_AfterSalesTickets_ProductVariants_ReplacementProductVariantId",
                table: "AfterSalesTickets",
                column: "ReplacementProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AfterSalesTickets_ProductVariants_ReplacementProductVariantId",
                table: "AfterSalesTickets");

            migrationBuilder.RenameColumn(
                name: "ReplacementProductVariantId",
                table: "AfterSalesTickets",
                newName: "ReplacementOrderItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AfterSalesTicket_ReplacementProductVariantId",
                table: "AfterSalesTickets",
                newName: "IX_AfterSalesTicket_ReplacementOrderItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_AfterSalesTickets_OrderItems_ReplacementOrderItemId",
                table: "AfterSalesTickets",
                column: "ReplacementOrderItemId",
                principalTable: "OrderItems",
                principalColumn: "Id");
        }
    }
}
