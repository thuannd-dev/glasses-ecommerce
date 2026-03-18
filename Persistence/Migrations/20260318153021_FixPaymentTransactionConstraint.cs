using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixPaymentTransactionConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments",
                sql: "\r\n                    (\r\n                        PaymentMethod IN (1, 4)\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod IN (2,3) AND (TransactionId IS NOT NULL OR PaymentStatus = 1)\r\n                    )\r\n                    ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Payment_Transaction_By_Method",
                table: "Payments",
                sql: "\r\n                    (\r\n                        PaymentMethod = 1\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod IN (2,3) AND TransactionId IS NOT NULL\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod = 4\r\n                    )\r\n                    ");
        }
    }
}
