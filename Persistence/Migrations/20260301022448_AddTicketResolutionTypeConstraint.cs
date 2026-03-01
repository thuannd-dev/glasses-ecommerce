using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketResolutionTypeConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_AfterSalesTicket_ResolutionType",
                table: "AfterSalesTickets",
                sql: "[ResolutionType] IS NULL OR [ResolutionType] IN (1, 2, 3, 4)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_AfterSalesTicket_ResolutionType",
                table: "AfterSalesTickets");
        }
    }
}
