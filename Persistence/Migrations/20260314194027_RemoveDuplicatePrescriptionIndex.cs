using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDuplicatePrescriptionIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Using raw SQL to ensure idempotency when dropping the index
            migrationBuilder.Sql("IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'UX_Prescription_Id_OrderId' AND object_id = OBJECT_ID(N'[Prescriptions]')) " +
                                 "DROP INDEX [UX_Prescription_Id_OrderId] ON [Prescriptions];");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "UX_Prescription_Id_OrderId",
                table: "Prescriptions",
                columns: new[] { "Id", "OrderId" },
                unique: true);
        }
    }
}
