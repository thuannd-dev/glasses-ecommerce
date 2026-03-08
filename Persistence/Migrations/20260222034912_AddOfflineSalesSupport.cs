using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOfflineSalesSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments");

            migrationBuilder.AddColumn<Guid>(
                name: "ChangedBy",
                table: "OrderStatusHistories",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "AddressId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "WalkInCustomerName",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WalkInCustomerPhone",
                table: "Orders",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments",
                sql: "\r\n                    (\r\n                        PaymentMethod = 1\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod IN (2,3) AND TransactionId IS NOT NULL\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod = 4\r\n                    )\r\n                    ");

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusHistory_ChangedBy",
                table: "OrderStatusHistories",
                column: "ChangedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders",
                column: "AddressId",
                principalTable: "Addresses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderStatusHistories_AspNetUsers_ChangedBy",
                table: "OrderStatusHistories",
                column: "ChangedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderStatusHistories_AspNetUsers_ChangedBy",
                table: "OrderStatusHistories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_OrderStatusHistory_ChangedBy",
                table: "OrderStatusHistories");

            migrationBuilder.DropColumn(
                name: "ChangedBy",
                table: "OrderStatusHistories");

            migrationBuilder.DropColumn(
                name: "WalkInCustomerName",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "WalkInCustomerPhone",
                table: "Orders");

            migrationBuilder.AlterColumn<Guid>(
                name: "AddressId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments",
                sql: "\r\n                    (\r\n                        PaymentMethod = 1\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod IN (2,3) AND TransactionId IS NOT NULL\r\n                    )\r\n                    ");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders",
                column: "AddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
