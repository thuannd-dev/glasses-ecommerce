using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPromotionsAndPromoUsageLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UsedBy",
                table: "PromoUsageLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PromoUsageLog_PromotionId_UsedBy",
                table: "PromoUsageLogs",
                columns: new[] { "PromotionId", "UsedBy" });

            migrationBuilder.CreateIndex(
                name: "IX_PromoUsageLog_UsedBy",
                table: "PromoUsageLogs",
                column: "UsedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_PromoUsageLogs_AspNetUsers_UsedBy",
                table: "PromoUsageLogs",
                column: "UsedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PromoUsageLogs_AspNetUsers_UsedBy",
                table: "PromoUsageLogs");

            migrationBuilder.DropIndex(
                name: "IX_PromoUsageLog_PromotionId_UsedBy",
                table: "PromoUsageLogs");

            migrationBuilder.DropIndex(
                name: "IX_PromoUsageLog_UsedBy",
                table: "PromoUsageLogs");

            migrationBuilder.DropColumn(
                name: "UsedBy",
                table: "PromoUsageLogs");
        }
    }
}
