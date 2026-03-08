using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAfterSalesTicketResolutionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReceivedAt",
                table: "AfterSalesTickets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ResolutionType",
                table: "AfterSalesTickets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StaffNotes",
                table: "AfterSalesTickets",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceivedAt",
                table: "AfterSalesTickets");

            migrationBuilder.DropColumn(
                name: "ResolutionType",
                table: "AfterSalesTickets");

            migrationBuilder.DropColumn(
                name: "StaffNotes",
                table: "AfterSalesTickets");
        }
    }
}
