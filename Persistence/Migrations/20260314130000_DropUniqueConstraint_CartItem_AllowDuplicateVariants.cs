using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DropUniqueConstraint_CartItem_AllowDuplicateVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_CartItem_Cart_ProductVariant",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "IX_CartItem_Cart_ProductVariant",
                table: "CartItems",
                columns: new[] { "CartId", "ProductVariantId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (
                    SELECT 1
                    FROM CartItems
                    GROUP BY CartId, ProductVariantId
                    HAVING COUNT(*) > 1
                )
                    THROW 50000, 'Cannot restore UX_CartItem_Cart_ProductVariant while duplicate CartItems exist.', 1;
                """);

            migrationBuilder.DropIndex(
                name: "IX_CartItem_Cart_ProductVariant",
                table: "CartItems");

            migrationBuilder.CreateIndex(
                name: "UX_CartItem_Cart_ProductVariant",
                table: "CartItems",
                columns: new[] { "CartId", "ProductVariantId" },
                unique: true);
        }
    }
}
