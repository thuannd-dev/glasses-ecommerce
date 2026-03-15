using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddConstraintRefundOnly_Requires_RefundPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_PolicyConfiguration_RefundOnly_Requires_RefundPolicy",
                table: "PolicyConfigurations");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PolicyConfiguration_RefundOnly_Requires_RefundPolicy",
                table: "PolicyConfigurations",
                sql: "\r\n                    (PolicyType != 3 AND RefundOnlyMaxAmount IS NULL AND RefundWindowDays IS NULL)\r\n                    OR\r\n                    (PolicyType = 3 AND \r\n                        (RefundWindowDays IS NULL OR RefundWindowDays >= 0) AND\r\n                        (RefundOnlyMaxAmount IS NULL OR RefundOnlyMaxAmount >= 0)\r\n                    )\r\n                    ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_PolicyConfiguration_RefundOnly_Requires_RefundPolicy",
                table: "PolicyConfigurations");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PolicyConfiguration_RefundOnly_Requires_RefundPolicy",
                table: "PolicyConfigurations",
                sql: "\r\n                    (PolicyType != 3 AND RefundOnlyMaxAmount IS NULL AND RefundWindowDays IS NULL)\r\n                    OR\r\n                    (PolicyType = 3)\r\n                    ");
        }
    }
}
