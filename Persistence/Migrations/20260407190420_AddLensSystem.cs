using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLensSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CoatingExtraPrice",
                table: "OrderItems",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CoatingsSnapshot",
                table: "OrderItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LensUnitPrice",
                table: "OrderItems",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "LensVariantId",
                table: "OrderItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CoatingExtraPrice",
                table: "CartItems",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "LensVariantId",
                table: "CartItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionAddOD",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionAddOS",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PrescriptionAxisOD",
                table: "CartItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PrescriptionAxisOS",
                table: "CartItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionCylOD",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionCylOS",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionPd",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionPdOD",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionPdOS",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionSphOD",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrescriptionSphOS",
                table: "CartItems",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelectedCoatingIdsJson",
                table: "CartItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FrameLensCompatibilities",
                columns: table => new
                {
                    FrameProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LensProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FrameLensCompatibilities", x => new { x.FrameProductId, x.LensProductId });
                    table.ForeignKey(
                        name: "FK_FrameLensCompatibilities_Products_FrameProductId",
                        column: x => x.FrameProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FrameLensCompatibilities_Products_LensProductId",
                        column: x => x.LensProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LensCoatingOptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LensProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoatingName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ExtraPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LensCoatingOptions", x => x.Id);
                    table.CheckConstraint("CK_LensCoatingOption_ExtraPrice", "[ExtraPrice] >= 0");
                    table.ForeignKey(
                        name: "FK_LensCoatingOptions_Products_LensProductId",
                        column: x => x.LensProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LensVariantAttributes",
                columns: table => new
                {
                    ProductVariantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SphMin = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    SphMax = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CylMin = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CylMax = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    AxisMin = table.Column<int>(type: "int", nullable: false),
                    AxisMax = table.Column<int>(type: "int", nullable: false),
                    AddMin = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    AddMax = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Index = table.Column<decimal>(type: "decimal(4,2)", nullable: false),
                    LensDesign = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LensVariantAttributes", x => x.ProductVariantId);
                    table.CheckConstraint("CK_LensVariantAttribute_AxisRange", "[AxisMin] >= 0 AND [AxisMax] <= 180 AND [AxisMin] <= [AxisMax]");
                    table.CheckConstraint("CK_LensVariantAttribute_CylNegative", "[CylMin] <= 0 AND [CylMax] <= 0");
                    table.CheckConstraint("CK_LensVariantAttribute_CylRange", "[CylMin] <= [CylMax]");
                    table.CheckConstraint("CK_LensVariantAttribute_Index", "[Index] > 0");
                    table.CheckConstraint("CK_LensVariantAttribute_LensDesign", "[LensDesign] IN (1, 2, 3)");
                    table.CheckConstraint("CK_LensVariantAttribute_SphRange", "[SphMin] <= [SphMax]");
                    table.ForeignKey(
                        name: "FK_LensVariantAttributes_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_LensVariantId",
                table: "OrderItems",
                column: "LensVariantId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderItem_CoatingExtraPrice",
                table: "OrderItems",
                sql: "[CoatingExtraPrice] >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderItem_LensUnitPrice",
                table: "OrderItems",
                sql: "[LensUnitPrice] >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_CartItem_LensVariantId",
                table: "CartItems",
                column: "LensVariantId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CartItem_CoatingExtraPrice",
                table: "CartItems",
                sql: "[CoatingExtraPrice] >= 0");

            migrationBuilder.CreateIndex(
                name: "IX_FrameLensCompatibility_FrameProductId",
                table: "FrameLensCompatibilities",
                column: "FrameProductId");

            migrationBuilder.CreateIndex(
                name: "IX_FrameLensCompatibility_LensProductId",
                table: "FrameLensCompatibilities",
                column: "LensProductId");

            migrationBuilder.CreateIndex(
                name: "IX_LensCoatingOption_LensProductId",
                table: "LensCoatingOptions",
                column: "LensProductId");

            migrationBuilder.CreateIndex(
                name: "IX_LensCoatingOption_LensProductId_IsActive",
                table: "LensCoatingOptions",
                columns: new[] { "LensProductId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_LensVariantAttribute_Index",
                table: "LensVariantAttributes",
                column: "Index");

            migrationBuilder.CreateIndex(
                name: "IX_LensVariantAttribute_LensDesign",
                table: "LensVariantAttributes",
                column: "LensDesign");

            migrationBuilder.CreateIndex(
                name: "IX_LensVariantAttribute_SphRange",
                table: "LensVariantAttributes",
                columns: new[] { "SphMin", "SphMax" });

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ProductVariants_LensVariantId",
                table: "CartItems",
                column: "LensVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_ProductVariants_LensVariantId",
                table: "OrderItems",
                column: "LensVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ProductVariants_LensVariantId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_ProductVariants_LensVariantId",
                table: "OrderItems");

            migrationBuilder.DropTable(
                name: "FrameLensCompatibilities");

            migrationBuilder.DropTable(
                name: "LensCoatingOptions");

            migrationBuilder.DropTable(
                name: "LensVariantAttributes");

            migrationBuilder.DropIndex(
                name: "IX_OrderItem_LensVariantId",
                table: "OrderItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderItem_CoatingExtraPrice",
                table: "OrderItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderItem_LensUnitPrice",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItem_LensVariantId",
                table: "CartItems");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CartItem_CoatingExtraPrice",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "CoatingExtraPrice",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CoatingsSnapshot",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "LensUnitPrice",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "LensVariantId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CoatingExtraPrice",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "LensVariantId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionAddOD",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionAddOS",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionAxisOD",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionAxisOS",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionCylOD",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionCylOS",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionPd",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionPdOD",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionPdOS",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionSphOD",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionSphOS",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "SelectedCoatingIdsJson",
                table: "CartItems");
        }
    }
}
