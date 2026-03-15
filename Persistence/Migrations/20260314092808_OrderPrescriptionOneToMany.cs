using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OrderPrescriptionOneToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Prescription_OrderId",
                table: "Prescriptions");

            migrationBuilder.AddColumn<Guid>(
                name: "PrescriptionId",
                table: "OrderItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prescription_OrderId",
                table: "Prescriptions",
                column: "OrderId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_Prescriptions_PrescriptionId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_Prescription_OrderId",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_PrescriptionId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "PrescriptionId",
                table: "OrderItems");

            migrationBuilder.CreateIndex(
                name: "UX_Prescription_OrderId",
                table: "Prescriptions",
                column: "OrderId",
                unique: true);
        }
    }
}
