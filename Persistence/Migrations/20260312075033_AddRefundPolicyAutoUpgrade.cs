using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRefundPolicyAutoUpgrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "RefundOnlyMaxAmount",
                table: "PolicyConfigurations",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RefundWindowDays",
                table: "PolicyConfigurations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OriginalTicketType",
                table: "AfterSalesTickets",
                type: "int",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_PolicyConfiguration_RefundOnly_Requires_RefundPolicy",
                table: "PolicyConfigurations",
                sql: "\r\n                    (PolicyType != 3 AND RefundOnlyMaxAmount IS NULL AND RefundWindowDays IS NULL)\r\n                    OR\r\n                    (PolicyType = 3)\r\n                    ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_PolicyConfiguration_RefundOnly_Requires_RefundPolicy",
                table: "PolicyConfigurations");

            migrationBuilder.DropColumn(
                name: "RefundOnlyMaxAmount",
                table: "PolicyConfigurations");

            migrationBuilder.DropColumn(
                name: "RefundWindowDays",
                table: "PolicyConfigurations");

            migrationBuilder.DropColumn(
                name: "OriginalTicketType",
                table: "AfterSalesTickets");
        }
    }
}
