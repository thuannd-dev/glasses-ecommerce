using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddReplacingStatusAndReplacementItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_AfterSalesTicket_TicketStatus",
                table: "AfterSalesTickets");

            migrationBuilder.AddColumn<Guid>(
                name: "ReplacementOrderItemId",
                table: "AfterSalesTickets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_ReplacementOrderItemId",
                table: "AfterSalesTickets",
                column: "ReplacementOrderItemId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AfterSalesTicket_TicketStatus",
                table: "AfterSalesTickets",
                sql: "[TicketStatus] IN (1, 2, 3, 4, 5, 6, 7)");

            migrationBuilder.AddForeignKey(
                name: "FK_AfterSalesTickets_OrderItems_ReplacementOrderItemId",
                table: "AfterSalesTickets",
                column: "ReplacementOrderItemId",
                principalTable: "OrderItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AfterSalesTickets_OrderItems_ReplacementOrderItemId",
                table: "AfterSalesTickets");

            migrationBuilder.DropIndex(
                name: "IX_AfterSalesTicket_ReplacementOrderItemId",
                table: "AfterSalesTickets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_AfterSalesTicket_TicketStatus",
                table: "AfterSalesTickets");

            migrationBuilder.DropColumn(
                name: "ReplacementOrderItemId",
                table: "AfterSalesTickets");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AfterSalesTicket_TicketStatus",
                table: "AfterSalesTickets",
                sql: "[TicketStatus] IN (1, 2, 3, 4, 5)");
        }
    }
}
