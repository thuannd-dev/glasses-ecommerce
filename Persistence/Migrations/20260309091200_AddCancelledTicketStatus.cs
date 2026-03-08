using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCancelledTicketStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the old CHECK constraint
            migrationBuilder.Sql(
                "ALTER TABLE [AfterSalesTickets] DROP CONSTRAINT [CK_AfterSalesTicket_TicketStatus];");

            // Create new CHECK constraint that includes the Cancelled status (6)
            migrationBuilder.Sql(
                "ALTER TABLE [AfterSalesTickets] ADD CONSTRAINT [CK_AfterSalesTicket_TicketStatus] CHECK ([TicketStatus] IN (1, 2, 3, 4, 5, 6));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert to the old CHECK constraint
            migrationBuilder.Sql(
                "ALTER TABLE [AfterSalesTickets] DROP CONSTRAINT [CK_AfterSalesTicket_TicketStatus];");

            migrationBuilder.Sql(
                "ALTER TABLE [AfterSalesTickets] ADD CONSTRAINT [CK_AfterSalesTicket_TicketStatus] CHECK ([TicketStatus] IN (1, 2, 3, 4, 5));");
        }
    }
}
