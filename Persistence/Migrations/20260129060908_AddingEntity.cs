using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddingEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    RecipientName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    RecipientPhone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Venue = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Ward = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    District = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PostalCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(9,6)", nullable: true),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Addresses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Carts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carts", x => x.Id);
                    table.CheckConstraint("CK_Cart_Status", "[Status] IN (1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_Carts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FeatureToggles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FeatureName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    IsEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    Scope = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ScopeValue = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeatureToggles", x => x.Id);
                    table.CheckConstraint("CK_FeatureToggle_EffectivePeriod", "EffectiveTo IS NULL OR EffectiveTo > EffectiveFrom");
                    table.CheckConstraint("CK_FeatureToggle_Scope_ScopeValue", "(Scope IS NULL AND ScopeValue IS NULL)OR (Scope IS NOT NULL AND ScopeValue IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_FeatureToggles_AspNetUsers_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InboundRecords",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    SourceType = table.Column<int>(type: "INTEGER", nullable: false),
                    SourceReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalItems = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ApprovedBy = table.Column<string>(type: "TEXT", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    RejectionReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InboundRecords", x => x.Id);
                    table.CheckConstraint("CK_InboundRecord_SourceType", "[SourceType] IN (1, 2, 3)");
                    table.CheckConstraint("CK_InboundRecord_Status", "[Status] IN (0, 1, 2)");
                    table.CheckConstraint("CK_InboundRecord_Status_ApprovedAt_RejectedAt", "(Status = 0 AND ApprovedAt IS NULL AND ApprovedBy IS NULL AND RejectedAt IS NULL AND RejectionReason IS NULL)OR (Status = 1 AND ApprovedAt IS NOT NULL AND ApprovedBy IS NOT NULL AND RejectedAt IS NULL AND RejectionReason IS NULL)OR (Status = 2 AND RejectedAt IS NOT NULL AND RejectionReason IS NOT NULL AND ApprovedAt IS NULL AND ApprovedBy IS NULL)");
                    table.ForeignKey(
                        name: "FK_InboundRecords_AspNetUsers_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InboundRecords_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PolicyConfigurations",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    PolicyType = table.Column<int>(type: "INTEGER", nullable: false),
                    PolicyName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ReturnWindowDays = table.Column<int>(type: "INTEGER", nullable: true),
                    WarrantyMonths = table.Column<int>(type: "INTEGER", nullable: true),
                    RefundAllowed = table.Column<bool>(type: "INTEGER", nullable: false),
                    CustomizedLensRefundable = table.Column<bool>(type: "INTEGER", nullable: false),
                    EvidenceRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    MinOrderAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PolicyConfigurations", x => x.Id);
                    table.CheckConstraint("CK_PolicyConfiguration_EffectivePeriod", "EffectiveTo IS NULL OR (EffectiveTo > EffectiveFrom)");
                    table.CheckConstraint("CK_PolicyConfiguration_PolicyType", "[PolicyType] IN (1, 2, 3)");
                    table.CheckConstraint("CK_PolicyConfiguration_ReturnWindowDays_Requires_ReturnPolicy", "\r\n                    (PolicyType != 1 AND ReturnWindowDays IS NULL)\r\n                    OR\r\n                    (PolicyType = 1 AND ReturnWindowDays IS NOT NULL AND ReturnWindowDays >= 0)\r\n                    ");
                    table.CheckConstraint("CK_PolicyConfiguration_WarrantyMonths_Requires_WarrantyPolicy", "\r\n                    (PolicyType != 2 AND WarrantyMonths IS NULL)\r\n                    OR\r\n                    (PolicyType = 2 AND WarrantyMonths IS NOT NULL AND WarrantyMonths >= 0)\r\n                    ");
                    table.ForeignKey(
                        name: "FK_PolicyConfigurations_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PolicyConfigurations_AspNetUsers_DeletedBy",
                        column: x => x.DeletedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PolicyConfigurations_AspNetUsers_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductCategories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Promotions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    PromoCode = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PromoName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    PromotionType = table.Column<int>(type: "INTEGER", nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    MaxDiscountValue = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    UsageLimit = table.Column<int>(type: "INTEGER", nullable: true),
                    UsageLimitPerCustomer = table.Column<int>(type: "INTEGER", nullable: true),
                    ValidFrom = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promotions", x => x.Id);
                    table.CheckConstraint("CK_Promotion_DiscountValue", "DiscountValue >= 0");
                    table.CheckConstraint("CK_Promotion_DiscountValue_ByType", "\r\n                    (PromotionType = 0 AND DiscountValue > 0 AND DiscountValue <= 100)\r\n                    OR (PromotionType = 1 AND DiscountValue > 0)\r\n                    OR (PromotionType = 2 AND DiscountValue = 0)\r\n                    ");
                    table.CheckConstraint("CK_Promotion_MaxDiscountValue", "MaxDiscountValue IS NULL OR MaxDiscountValue >= 0");
                    table.CheckConstraint("CK_Promotion_Type", "[PromotionType] IN (0, 1, 2)");
                    table.CheckConstraint("CK_Promotion_ValidPeriod", "ValidTo > ValidFrom");
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    AddressId = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedBySalesStaff = table.Column<string>(type: "TEXT", nullable: true),
                    OrderType = table.Column<int>(type: "INTEGER", nullable: false),
                    OrderSource = table.Column<int>(type: "INTEGER", nullable: false),
                    OrderStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    ShippingFee = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    CustomerNote = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DepositAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    RemainingAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    CancellationDeadline = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.CheckConstraint("CK_Order_Amount", "[TotalAmount] >= 0 AND [ShippingFee] >= 0");
                    table.CheckConstraint("CK_Order_Source", "[OrderSource] IN (0, 1, 2)");
                    table.CheckConstraint("CK_Order_Status", "[OrderStatus] IN (0, 1, 2, 3, 4, 5, 6, 7)");
                    table.CheckConstraint("CK_Order_Type", "[OrderType] IN (0, 1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_Orders_Addresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "Addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Orders_AspNetUsers_CreatedBySalesStaff",
                        column: x => x.CreatedBySalesStaff,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Orders_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CategoryId = table.Column<string>(type: "TEXT", nullable: false),
                    ProductName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Brand = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.CheckConstraint("CK_Product_Status", "[Status] IN (0, 1, 2)");
                    table.CheckConstraint("CK_Product_Type", "[Type] IN (1, 2, 3, 4, 5)");
                    table.ForeignKey(
                        name: "FK_Products_ProductCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ProductCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderStatusHistories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    FromStatus = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    ToStatus = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderStatusHistories_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    PaymentMethod = table.Column<int>(type: "INTEGER", nullable: false),
                    PaymentStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    TransactionId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    PaymentAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PaymentType = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.CheckConstraint("CK_Payment_Amount", "[Amount] >= 0");
                    table.CheckConstraint("CK_Payment_Method", "[PaymentMethod] > 0");
                    table.CheckConstraint("CK_Payment_Status", "[PaymentStatus] > 0");
                    table.CheckConstraint("CK_Payment_Status_PaymentAt", "\r\n                    (\r\n                        PaymentStatus = 1 AND PaymentAt IS NULL\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentStatus IN (2,3,4) AND PaymentAt IS NOT NULL\r\n                    )\r\n                    ");
                    table.CheckConstraint("CK_Payment_Transaction_By_Method", "\r\n                    (\r\n                        PaymentMethod = 1\r\n                    )\r\n                    OR\r\n                    (\r\n                        PaymentMethod IN (2,3) AND TransactionId IS NOT NULL\r\n                    )\r\n                    ");
                    table.CheckConstraint("CK_Payment_Type", "[PaymentType] > 0");
                    table.ForeignKey(
                        name: "FK_Payments_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    IsVerified = table.Column<bool>(type: "INTEGER", nullable: false),
                    VerifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    VerificationNotes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.Id);
                    table.CheckConstraint("CK_Prescription_Verification_Consistency", "\r\n                    (IsVerified = 0 AND VerifiedAt IS NULL AND VerifiedBy IS NULL)\r\n                    OR\r\n                    (IsVerified = 1 AND VerifiedAt IS NOT NULL AND VerifiedBy IS NOT NULL)\r\n                    ");
                    table.ForeignKey(
                        name: "FK_Prescriptions_AspNetUsers_VerifiedBy",
                        column: x => x.VerifiedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PromoUsageLogs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    PromotionId = table.Column<string>(type: "TEXT", nullable: false),
                    DiscountApplied = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromoUsageLogs", x => x.Id);
                    table.CheckConstraint("CK_PromoUsageLog_DiscountApplied", "DiscountApplied >= 0");
                    table.ForeignKey(
                        name: "FK_PromoUsageLogs_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PromoUsageLogs_Promotions_PromotionId",
                        column: x => x.PromotionId,
                        principalTable: "Promotions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentInfos",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    CarrierName = table.Column<int>(type: "INTEGER", nullable: false),
                    TrackingCode = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    TrackingUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ShippedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EstimatedDeliveryAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ActualDeliveryAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PackageWeight = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PackageDimensions = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ShippingNotes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatorId = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentInfos", x => x.Id);
                    table.CheckConstraint("CK_ShipmentInfo_Carrier", "[CarrierName] IN (0, 1, 2)");
                    table.ForeignKey(
                        name: "FK_ShipmentInfos_AspNetUsers_CreatorId",
                        column: x => x.CreatorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ShipmentInfos_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductVariants",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    ProductId = table.Column<string>(type: "TEXT", nullable: false),
                    SKU = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    VariantName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Color = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Size = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    Material = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    FrameWidth = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    LensWidth = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    BridgeWidth = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    TempleLength = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    CompareAtPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductVariants", x => x.Id);
                    table.CheckConstraint("CK_ProductVariant_CompareAtPrice", "[CompareAtPrice] IS NULL OR [CompareAtPrice] >= [Price]");
                    table.CheckConstraint("CK_ProductVariant_Price", "[Price] >= 0");
                    table.ForeignKey(
                        name: "FK_ProductVariants_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Refunds",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    PaymentId = table.Column<string>(type: "TEXT", nullable: false),
                    RefundStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    RefundAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    RefundReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Refunds", x => x.Id);
                    table.CheckConstraint("CK_Refund_Amount", "[Amount] >= 0");
                    table.CheckConstraint("CK_Refund_Status", "[RefundStatus] IN (1, 2, 3, 4)");
                    table.ForeignKey(
                        name: "FK_Refunds_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionDetails",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    PrescriptionId = table.Column<string>(type: "TEXT", nullable: false),
                    Eye = table.Column<int>(type: "INTEGER", nullable: false),
                    SPH = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    CYL = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    AXIS = table.Column<int>(type: "INTEGER", nullable: true),
                    PD = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ADD = table.Column<decimal>(type: "decimal(5,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionDetails", x => x.Id);
                    table.CheckConstraint("CK_PrescriptionDetail_AXIS", "[AXIS] IS NULL OR ([AXIS] BETWEEN 0 AND 180)");
                    table.CheckConstraint("CK_PrescriptionDetail_AXIS_Requires_CYL", "\r\n                    (CYL IS NULL AND AXIS IS NULL)\r\n                    OR\r\n                    (CYL IS NOT NULL AND AXIS IS NOT NULL)\r\n                    ");
                    table.CheckConstraint("CK_PrescriptionDetail_CYL", "[CYL] IS NULL OR ([CYL] BETWEEN -6.00 AND 0.00)");
                    table.CheckConstraint("CK_PrescriptionDetail_Eye", "[Eye] IN (1, 2)");
                    table.CheckConstraint("CK_PrescriptionDetail_PD", "[PD] IS NULL OR ([PD] BETWEEN 40.00 AND 80.00)");
                    table.CheckConstraint("CK_PrescriptionDetail_SPH", "[SPH] IS NULL OR ([SPH] BETWEEN -20.00 AND 20.00)");
                    table.ForeignKey(
                        name: "FK_PrescriptionDetails_Prescriptions_PrescriptionId",
                        column: x => x.PrescriptionId,
                        principalTable: "Prescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CartId = table.Column<string>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.CheckConstraint("CK_CartItem_Quantity", "Quantity > 0");
                    table.ForeignKey(
                        name: "FK_CartItems_Carts_CartId",
                        column: x => x.CartId,
                        principalTable: "Carts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartItems_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InboundRecordItems",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    InboundRecordId = table.Column<string>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 400, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InboundRecordItems", x => x.Id);
                    table.CheckConstraint("CK_InboundRecordItem_Quantity", "Quantity > 0");
                    table.ForeignKey(
                        name: "FK_InboundRecordItems_InboundRecords_InboundRecordId",
                        column: x => x.InboundRecordId,
                        principalTable: "InboundRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InboundRecordItems_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<string>(type: "TEXT", nullable: false),
                    TransactionType = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    ReferenceType = table.Column<int>(type: "INTEGER", nullable: false),
                    ReferenceId = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ApprovedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransactions", x => x.Id);
                    table.CheckConstraint("CK_InventoryTransaction_Quantity_Valid", "Quantity > 0");
                    table.CheckConstraint("CK_InventoryTransaction_ReferenceType", "[ReferenceType] IN (1, 2, 3, 4)");
                    table.CheckConstraint("CK_InventoryTransaction_ReferenceType_ReferenceId", "(ReferenceType IN (1,2,3) AND ReferenceId IS NOT NULL)OR (ReferenceType = 4)");
                    table.CheckConstraint("CK_InventoryTransaction_Status", "[Status] IN (0, 1)");
                    table.CheckConstraint("CK_InventoryTransaction_Status_ApprovedAt", "(Status = 0 AND ApprovedAt IS NULL AND ApprovedBy IS NULL)OR (Status = 1 AND ApprovedAt IS NOT NULL AND ApprovedBy IS NOT NULL)");
                    table.CheckConstraint("CK_InventoryTransaction_Type", "[TransactionType] IN (1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_AspNetUsers_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.CheckConstraint("CK_OrderItem_Quantity", "Quantity > 0");
                    table.CheckConstraint("CK_OrderItem_UnitPrice", "UnitPrice >= 0");
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductImages",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<string>(type: "TEXT", nullable: true),
                    ProductId = table.Column<string>(type: "TEXT", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    AltText = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    DisplayOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ModelUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedBy = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.Id);
                    table.CheckConstraint("CK_ProductImage_Reference", "([ProductVariantId] IS NOT NULL AND [ProductId] IS NULL) OR ([ProductVariantId] IS NULL AND [ProductId] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_ProductImages_AspNetUsers_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductImages_AspNetUsers_DeletedBy",
                        column: x => x.DeletedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductImages_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Stocks",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    ProductVariantId = table.Column<string>(type: "TEXT", nullable: false),
                    QuantityOnHand = table.Column<int>(type: "INTEGER", nullable: false),
                    QuantityReserved = table.Column<int>(type: "INTEGER", nullable: false),
                    QuantityAvailable = table.Column<int>(type: "INTEGER", nullable: false, computedColumnSql: "[QuantityOnHand] - [QuantityReserved]", stored: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks", x => x.Id);
                    table.CheckConstraint("CK_Stock_Quantity_Valid", "[QuantityOnHand] >= 0 AND [QuantityReserved] >= 0 AND [QuantityReserved] <= [QuantityOnHand]");
                    table.ForeignKey(
                        name: "FK_Stocks_AspNetUsers_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Stocks_ProductVariants_ProductVariantId",
                        column: x => x.ProductVariantId,
                        principalTable: "ProductVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AfterSalesTickets",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    OrderItemId = table.Column<string>(type: "TEXT", nullable: true),
                    CustomerId = table.Column<string>(type: "TEXT", nullable: false),
                    TicketType = table.Column<int>(type: "INTEGER", nullable: false),
                    TicketStatus = table.Column<int>(type: "INTEGER", nullable: false),
                    Reason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    RequestedAction = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    RefundAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsRequiredEvidence = table.Column<bool>(type: "INTEGER", nullable: false),
                    AssignedTo = table.Column<string>(type: "TEXT", nullable: true),
                    PolicyViolation = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AfterSalesTickets", x => x.Id);
                    table.CheckConstraint("CK_AfterSalesTicket_TicketStatus", "[TicketStatus] IN (1, 2, 3, 4, 5)");
                    table.CheckConstraint("CK_AfterSalesTicket_TicketType", "[TicketType] IN (0, 1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_AfterSalesTickets_AspNetUsers_AssignedTo",
                        column: x => x.AssignedTo,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AfterSalesTickets_AspNetUsers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AfterSalesTickets_OrderItems_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "OrderItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AfterSalesTickets_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TicketAttachments",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    TicketId = table.Column<string>(type: "TEXT", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    FileUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    FileExtension = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketAttachments", x => x.Id);
                    table.CheckConstraint("CK_TicketAttachment_Deletion_Consistency", "\r\n                    (DeletedAt IS NULL AND DeletedBy IS NULL)\r\n                    OR\r\n                    (DeletedAt IS NOT NULL AND DeletedBy IS NOT NULL)\r\n                    ");
                    table.ForeignKey(
                        name: "FK_TicketAttachments_AfterSalesTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "AfterSalesTickets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TicketAttachments_AspNetUsers_DeletedBy",
                        column: x => x.DeletedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Address_UserId",
                table: "Addresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Address_UserId_IsDefault",
                table: "Addresses",
                columns: new[] { "UserId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_Address_UserId_IsDeleted",
                table: "Addresses",
                columns: new[] { "UserId", "IsDeleted" },
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_AssignedTo",
                table: "AfterSalesTickets",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_CreatedAt",
                table: "AfterSalesTickets",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_CustomerId",
                table: "AfterSalesTickets",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_CustomerId_Status",
                table: "AfterSalesTickets",
                columns: new[] { "CustomerId", "TicketStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_OrderId",
                table: "AfterSalesTickets",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_OrderItemId",
                table: "AfterSalesTickets",
                column: "OrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_ResolvedAt",
                table: "AfterSalesTickets",
                column: "ResolvedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_TicketStatus",
                table: "AfterSalesTickets",
                column: "TicketStatus");

            migrationBuilder.CreateIndex(
                name: "IX_AfterSalesTicket_TicketType",
                table: "AfterSalesTickets",
                column: "TicketType");

            migrationBuilder.CreateIndex(
                name: "IX_CartItem_CartId",
                table: "CartItems",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItem_ProductVariantId",
                table: "CartItems",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "UX_CartItem_Cart_ProductVariant",
                table: "CartItems",
                columns: new[] { "CartId", "ProductVariantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cart_CreatedAt",
                table: "Carts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Status",
                table: "Carts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_UpdatedAt",
                table: "Carts",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_UserId_Status",
                table: "Carts",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "UX_Cart_User_Active",
                table: "Carts",
                column: "UserId",
                unique: true,
                filter: "[Status] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_FeatureToggle_FeatureName_IsEnabled",
                table: "FeatureToggles",
                columns: new[] { "FeatureName", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_FeatureToggle_IsEnabled",
                table: "FeatureToggles",
                column: "IsEnabled",
                filter: "[IsEnabled] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_FeatureToggle_Scope_ScopeValue",
                table: "FeatureToggles",
                columns: new[] { "Scope", "ScopeValue" });

            migrationBuilder.CreateIndex(
                name: "IX_FeatureToggles_UpdatedBy",
                table: "FeatureToggles",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "UX_FeatureToggle_FeatureName",
                table: "FeatureToggles",
                column: "FeatureName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecordItem_InboundRecordId",
                table: "InboundRecordItems",
                column: "InboundRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecordItem_ProductVariantId",
                table: "InboundRecordItems",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "UX_InboundRecordItem_Record_ProductVariant",
                table: "InboundRecordItems",
                columns: new[] { "InboundRecordId", "ProductVariantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecord_ApprovedAt",
                table: "InboundRecords",
                column: "ApprovedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecord_ApprovedBy",
                table: "InboundRecords",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecord_CreatedAt",
                table: "InboundRecords",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecord_CreatedBy",
                table: "InboundRecords",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecord_SourceType",
                table: "InboundRecords",
                column: "SourceType");

            migrationBuilder.CreateIndex(
                name: "IX_InboundRecord_Status",
                table: "InboundRecords",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_ApprovedAt",
                table: "InventoryTransactions",
                column: "ApprovedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_ApprovedBy",
                table: "InventoryTransactions",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_CreatedAt",
                table: "InventoryTransactions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_CreatedBy",
                table: "InventoryTransactions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_ProductVariantId",
                table: "InventoryTransactions",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_Reference",
                table: "InventoryTransactions",
                columns: new[] { "ReferenceType", "ReferenceId" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_Status",
                table: "InventoryTransactions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_TransactionType",
                table: "InventoryTransactions",
                column: "TransactionType");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_UserId",
                table: "InventoryTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_ProductVariantId",
                table: "OrderItems",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "UX_OrderItem_Order_ProductVariant",
                table: "OrderItems",
                columns: new[] { "OrderId", "ProductVariantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Order_AddressId",
                table: "Orders",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_Order_CancellationDeadline",
                table: "Orders",
                column: "CancellationDeadline");

            migrationBuilder.CreateIndex(
                name: "IX_Order_CreatedAt",
                table: "Orders",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Order_CreatedBySalesStaff",
                table: "Orders",
                column: "CreatedBySalesStaff");

            migrationBuilder.CreateIndex(
                name: "IX_Order_OrderSource",
                table: "Orders",
                column: "OrderSource");

            migrationBuilder.CreateIndex(
                name: "IX_Order_OrderStatus",
                table: "Orders",
                column: "OrderStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Order_OrderType",
                table: "Orders",
                column: "OrderType");

            migrationBuilder.CreateIndex(
                name: "IX_Order_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Order_UserId_OrderStatus",
                table: "Orders",
                columns: new[] { "UserId", "OrderStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusHistory_CreatedAt",
                table: "OrderStatusHistories",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusHistory_OrderId",
                table: "OrderStatusHistories",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusHistory_OrderId_CreatedAt",
                table: "OrderStatusHistories",
                columns: new[] { "OrderId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Payment_OrderId",
                table: "Payments",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_PaymentAt",
                table: "Payments",
                column: "PaymentAt");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_PaymentStatus",
                table: "Payments",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_TransactionId",
                table: "Payments",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfiguration_Active_EffectivePeriod",
                table: "PolicyConfigurations",
                columns: new[] { "IsActive", "EffectiveFrom", "EffectiveTo" });

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfiguration_IsActive",
                table: "PolicyConfigurations",
                column: "IsActive",
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfiguration_PolicyType",
                table: "PolicyConfigurations",
                column: "PolicyType");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfiguration_Type_Active_Deleted",
                table: "PolicyConfigurations",
                columns: new[] { "PolicyType", "IsActive", "IsDeleted" },
                filter: "[IsActive] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfigurations_CreatedBy",
                table: "PolicyConfigurations",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfigurations_DeletedBy",
                table: "PolicyConfigurations",
                column: "DeletedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PolicyConfigurations_UpdatedBy",
                table: "PolicyConfigurations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionDetail_PrescriptionId",
                table: "PrescriptionDetails",
                column: "PrescriptionId");

            migrationBuilder.CreateIndex(
                name: "UX_PrescriptionDetail_PrescriptionId_Eye",
                table: "PrescriptionDetails",
                columns: new[] { "PrescriptionId", "Eye" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prescription_CreatedAt",
                table: "Prescriptions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Prescription_IsVerified",
                table: "Prescriptions",
                column: "IsVerified");

            migrationBuilder.CreateIndex(
                name: "IX_Prescription_VerifiedAt",
                table: "Prescriptions",
                column: "VerifiedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Prescription_VerifiedBy",
                table: "Prescriptions",
                column: "VerifiedBy");

            migrationBuilder.CreateIndex(
                name: "UX_Prescription_OrderId",
                table: "Prescriptions",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductCategory_IsActive",
                table: "ProductCategories",
                column: "IsActive",
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_ProductCategory_Slug",
                table: "ProductCategories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_IsDeleted",
                table: "ProductImages",
                column: "IsDeleted",
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_ProductId",
                table: "ProductImages",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_ProductId_DisplayOrder",
                table: "ProductImages",
                columns: new[] { "ProductId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_ProductVariantId",
                table: "ProductImages",
                column: "ProductVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImage_ProductVariantId_DisplayOrder",
                table: "ProductImages",
                columns: new[] { "ProductVariantId", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_CreatedBy",
                table: "ProductImages",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_DeletedBy",
                table: "ProductImages",
                column: "DeletedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Brand",
                table: "Products",
                column: "Brand");

            migrationBuilder.CreateIndex(
                name: "IX_Product_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Product_CategoryId_Status",
                table: "Products",
                columns: new[] { "CategoryId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Product_CreatedAt",
                table: "Products",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Product_Status",
                table: "Products",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_Color",
                table: "ProductVariants",
                column: "Color");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_IsActive",
                table: "ProductVariants",
                column: "IsActive",
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_ProductId",
                table: "ProductVariants",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_ProductId_IsActive",
                table: "ProductVariants",
                columns: new[] { "ProductId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_Size",
                table: "ProductVariants",
                column: "Size");

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariant_SKU",
                table: "ProductVariants",
                column: "SKU",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Promotion_Active_ValidPeriod",
                table: "Promotions",
                columns: new[] { "IsActive", "ValidFrom", "ValidTo" });

            migrationBuilder.CreateIndex(
                name: "IX_Promotion_PromotionType",
                table: "Promotions",
                column: "PromotionType");

            migrationBuilder.CreateIndex(
                name: "IX_Promotion_Type_ValidPeriod",
                table: "Promotions",
                columns: new[] { "PromotionType", "ValidFrom", "ValidTo" });

            migrationBuilder.CreateIndex(
                name: "IX_Promotion_ValidDates",
                table: "Promotions",
                columns: new[] { "ValidFrom", "ValidTo" });

            migrationBuilder.CreateIndex(
                name: "UX_Promotion_PromoCode",
                table: "Promotions",
                column: "PromoCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PromoUsageLog_OrderId",
                table: "PromoUsageLogs",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_PromoUsageLog_PromotionId",
                table: "PromoUsageLogs",
                column: "PromotionId");

            migrationBuilder.CreateIndex(
                name: "IX_PromoUsageLog_UsedAt",
                table: "PromoUsageLogs",
                column: "UsedAt");

            migrationBuilder.CreateIndex(
                name: "UX_PromoUsageLog_Order_Promotion",
                table: "PromoUsageLogs",
                columns: new[] { "OrderId", "PromotionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Refund_PaymentId",
                table: "Refunds",
                column: "PaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_Refund_RefundAt",
                table: "Refunds",
                column: "RefundAt");

            migrationBuilder.CreateIndex(
                name: "IX_Refund_RefundStatus",
                table: "Refunds",
                column: "RefundStatus");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentInfo_CarrierName",
                table: "ShipmentInfos",
                column: "CarrierName");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentInfo_CreatedBy",
                table: "ShipmentInfos",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentInfo_DeliveredAt",
                table: "ShipmentInfos",
                column: "ActualDeliveryAt");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentInfo_ShippedAt",
                table: "ShipmentInfos",
                column: "ShippedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentInfo_TrackingCode",
                table: "ShipmentInfos",
                column: "TrackingCode");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentInfos_CreatorId",
                table: "ShipmentInfos",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "UX_ShipmentInfo_OrderId",
                table: "ShipmentInfos",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stock_ProductVariantId",
                table: "Stocks",
                column: "ProductVariantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Stock_UpdatedAt",
                table: "Stocks",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Stock_UpdatedBy",
                table: "Stocks",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachment_CreatedAt",
                table: "TicketAttachments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachment_DeletedAt",
                table: "TicketAttachments",
                column: "DeletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachment_DeletedBy",
                table: "TicketAttachments",
                column: "DeletedBy");

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachment_TicketId",
                table: "TicketAttachments",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_TicketAttachment_TicketId_DeletedAt",
                table: "TicketAttachments",
                columns: new[] { "TicketId", "DeletedAt" },
                filter: "[DeletedAt] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "FeatureToggles");

            migrationBuilder.DropTable(
                name: "InboundRecordItems");

            migrationBuilder.DropTable(
                name: "InventoryTransactions");

            migrationBuilder.DropTable(
                name: "OrderStatusHistories");

            migrationBuilder.DropTable(
                name: "PolicyConfigurations");

            migrationBuilder.DropTable(
                name: "PrescriptionDetails");

            migrationBuilder.DropTable(
                name: "ProductImages");

            migrationBuilder.DropTable(
                name: "PromoUsageLogs");

            migrationBuilder.DropTable(
                name: "Refunds");

            migrationBuilder.DropTable(
                name: "ShipmentInfos");

            migrationBuilder.DropTable(
                name: "Stocks");

            migrationBuilder.DropTable(
                name: "TicketAttachments");

            migrationBuilder.DropTable(
                name: "Carts");

            migrationBuilder.DropTable(
                name: "InboundRecords");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "Promotions");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "AfterSalesTickets");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "ProductVariants");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "ProductCategories");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "AspNetUsers");
        }
    }
}
