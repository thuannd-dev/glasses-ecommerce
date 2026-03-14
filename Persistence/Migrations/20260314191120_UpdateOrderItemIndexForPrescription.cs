using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOrderItemIndexForPrescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_OrderItem_Order_ProductVariant",
                table: "OrderItems");

            migrationBuilder.CreateIndex(
                name: "UX_OrderItem_Order_ProductVariant",
                table: "OrderItems",
                columns: new[] { "OrderId", "ProductVariantId", "PrescriptionId" },
                unique: true,
                filter: "[PrescriptionId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (
                    SELECT 1
                    FROM OrderItems
                    GROUP BY OrderId, ProductVariantId
                    HAVING COUNT(*) > 1
                )
                    THROW 50000, 'Cannot restore UX_OrderItem_Order_ProductVariant while duplicate OrderItems exist.', 1;
                """);

            migrationBuilder.DropIndex(
                name: "UX_OrderItem_Order_ProductVariant",
                table: "OrderItems");

            migrationBuilder.CreateIndex(
                name: "UX_OrderItem_Order_ProductVariant",
                table: "OrderItems",
                columns: new[] { "OrderId", "ProductVariantId" },
                unique: true);
        }
    }
}
