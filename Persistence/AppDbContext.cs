using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<User>(options)
{

    public required DbSet<Activity> Activities { get; set; }
    public required DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    public required DbSet<Photo> Photos { get; set; }
    public required DbSet<Address> Addresses { get; set; }
    public required DbSet<ProductCategory> ProductCategories { get; set; }
    public required DbSet<Product> Products { get; set; }
    public required DbSet<ProductVariant> ProductVariants { get; set; }
    public required DbSet<ProductImage> ProductImages { get; set; }
    public required DbSet<Stock> Stocks { get; set; }
    public required DbSet<InventoryTransaction> InventoryTransactions { get; set; }
    public required DbSet<InboundRecord> InboundRecords { get; set; }
    public required DbSet<InboundRecordItem> InboundRecordItems { get; set; }
    public required DbSet<Cart> Carts { get; set; }
    public required DbSet<CartItem> CartItems { get; set; }
    public required DbSet<Promotion> Promotions { get; set; }
    public required DbSet<Order> Orders { get; set; }
    public required DbSet<OrderItem> OrderItems { get; set; }
    public required DbSet<PromoUsageLog> PromoUsageLogs { get; set; }
    public required DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }
    public required DbSet<Prescription> Prescriptions { get; set; }
    public required DbSet<PrescriptionDetail> PrescriptionDetails { get; set; }
    public required DbSet<Payment> Payments { get; set; }
    public required DbSet<Refund> Refunds { get; set; }
    public required DbSet<ShipmentInfo> ShipmentInfos { get; set; }
    public required DbSet<AfterSalesTicket> AfterSalesTickets { get; set; }
    public required DbSet<TicketAttachment> TicketAttachments { get; set; }
    public required DbSet<PolicyConfiguration> PolicyConfigurations { get; set; }
    public required DbSet<FeatureToggle> FeatureToggles { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityAttendee>(x => x.HasKey(a => new {a.ActivityId, a.UserId}));

        builder.Entity<ActivityAttendee>()
            .HasOne(x => x.User)
            .WithMany(x => x.Activities)
            .HasForeignKey(x => x.UserId);

        builder.Entity<ActivityAttendee>()
            .HasOne(x => x.Activity)
            .WithMany(x => x.Attendees)
            .HasForeignKey(x => x.ActivityId);

        //========================================================================================//

        //ADRESS ENTITY CONFIGURATION
        builder.Entity<Address>(entity =>
        {
            //Relationship
            entity.HasOne(x => x.User)
                .WithMany(x => x.Addresses)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            //Properties
            entity.Property(x => x.RecipientName).HasMaxLength(100);
            entity.Property(x => x.RecipientPhone).HasMaxLength(20);
            entity.Property(x => x.Venue).HasMaxLength(200);
            entity.Property(x => x.Ward).HasMaxLength(100);
            entity.Property(x => x.District).HasMaxLength(100);
            entity.Property(x => x.City).HasMaxLength(100);
            entity.Property(x => x.PostalCode).HasMaxLength(20);
            entity.Property(x => x.Latitude).HasColumnType("decimal(9,6)");
            entity.Property(x => x.Longitude).HasColumnType("decimal(9,6)");

            //Indexes
            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Address_UserId");
            
            entity.HasIndex(e => new { e.UserId, e.IsDefault })
                .HasDatabaseName("IX_Address_UserId_IsDefault");
            
            entity.HasIndex(e => new { e.UserId, e.IsDeleted })
                .HasDatabaseName("IX_Address_UserId_IsDeleted")
                .HasFilter("[IsDeleted] = 0");
 
        });

        // PRODUCT CATEGORY ENTITY CONFIGURATION
        builder.Entity<ProductCategory>(entity =>
        {
            //Properties
            entity.Property(pc => pc.Name).HasMaxLength(100);
            entity.Property(pc => pc.Slug).HasMaxLength(150);
            entity.Property(pc => pc.Description).HasMaxLength(500);

            //Indexes
            entity.HasIndex(e => e.Slug)
                .IsUnique()
                .HasDatabaseName("IX_ProductCategory_Slug");
            
            entity.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_ProductCategory_IsActive")
                .HasFilter("[IsActive] = 1");
        });

        // PRODUCT ENTITY CONFIGURATION
        builder.Entity<Product>(entity =>
        {
            //Relationship
            entity.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            //Properties
            entity.Property(p => p.ProductName).HasMaxLength(200);
            entity.Property(p => p.Brand).HasMaxLength(100);

            //Indexes
            entity.HasIndex(e => e.CategoryId)
                .HasDatabaseName("IX_Product_CategoryId");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Product_Status");
            
            entity.HasIndex(e => e.Brand)
                .HasDatabaseName("IX_Product_Brand");
            
            entity.HasIndex(e => new { e.CategoryId, e.Status })
                .HasDatabaseName("IX_Product_CategoryId_Status");
            
            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Product_CreatedAt");

            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Product_Type",
                    "[Type] IN (1, 2, 3, 4, 5)"
                );
                t.HasCheckConstraint(
                    "CK_Product_Status",
                    "[Status] IN (0, 1, 2)"
                );
            });

        });


        // ORDER ENTITY CONFIGURATION
        builder.Entity<Order>(entity =>
        {
            // Relationships
            entity.HasOne(e => e.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.SalesStaff)
                .WithMany()
                //one-to-many một chiều (unidirectional), nếu muốn truy cập user.CreatedOrders thì đổi thành .WithMany(u => u.CreatedOrders)
                //thêm public ICollection<Order> CreatedOrders { get; set; } = new List<Order>(); vào class User
                .HasForeignKey(e => e.CreatedBySalesStaff)
                .OnDelete(DeleteBehavior.NoAction);

            // Properties
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.ShippingFee).HasColumnType("decimal(10,2)");
            entity.Property(e => e.CustomerNote).HasMaxLength(500);
            entity.Property(e => e.DepositAmount).HasColumnType("decimal(10,2)");
            entity.Property(e => e.RemainingAmount).HasColumnType("decimal(10,2)");

            //Indexes
            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Order_UserId");
            
            entity.HasIndex(e => e.AddressId)
                .HasDatabaseName("IX_Order_AddressId");
            
            entity.HasIndex(e => e.OrderStatus)
                .HasDatabaseName("IX_Order_OrderStatus");
            
            entity.HasIndex(e => e.OrderType)
                .HasDatabaseName("IX_Order_OrderType");
            
            entity.HasIndex(e => e.OrderSource)
                .HasDatabaseName("IX_Order_OrderSource");
            
            entity.HasIndex(e => new { e.UserId, e.OrderStatus })
                .HasDatabaseName("IX_Order_UserId_OrderStatus");
            
            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Order_CreatedAt");
            
            entity.HasIndex(e => e.CreatedBySalesStaff)
                .HasDatabaseName("IX_Order_CreatedBySalesStaff");
            
            entity.HasIndex(e => e.CancellationDeadline)
                .HasDatabaseName("IX_Order_CancellationDeadline");

            //Constraints   
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                "CK_Order_Type",
                "[OrderType] IN (0, 1, 2, 3)"
                );

                t.HasCheckConstraint(
                    "CK_Order_Source",
                    "[OrderSource] IN (0, 1, 2)"
                );

                t.HasCheckConstraint(
                    "CK_Order_Status",
                    "[OrderStatus] IN (0, 1, 2, 3, 4, 5, 6, 7)"
                );

                t.HasCheckConstraint(
                    "CK_Order_Amount",
                    "[TotalAmount] >= 0 AND [ShippingFee] >= 0"
                );
            });


        });

        //PRODUCT VARIANT ENTITY CONFIGURATION
        builder.Entity<ProductVariant>(entity =>
        {
            //Relationships
            entity.HasOne(pv => pv.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(pv => pv.ProductId);

            entity.HasOne(pv => pv.Stock)
                .WithOne(s => s.ProductVariant)
                .HasForeignKey<Stock>(s => s.ProductVariantId);

            //Properties
            entity.Property(pv => pv.SKU).HasMaxLength(100);
            entity.Property(pv => pv.VariantName).HasMaxLength(200);
            entity.Property(pv => pv.Color).HasMaxLength(50);
            entity.Property(pv => pv.Size).HasMaxLength(20);
            entity.Property(pv => pv.Material).HasMaxLength(100);
            entity.Property(pv => pv.FrameWidth).HasColumnType("decimal(5,2)");
            entity.Property(pv => pv.LensWidth).HasColumnType("decimal(5,2)");
            entity.Property(pv => pv.BridgeWidth).HasColumnType("decimal(5,2)");
            entity.Property(pv => pv.TempleLength).HasColumnType("decimal(5,2)");
            entity.Property(pv => pv.Price).HasColumnType("decimal(10,2)");
            entity.Property(pv => pv.CompareAtPrice).HasColumnType("decimal(10,2)");
            
            //Indexes
            entity.HasIndex(e => e.ProductId)
                .HasDatabaseName("IX_ProductVariant_ProductId");
            
            entity.HasIndex(e => e.SKU)
                .IsUnique()
                .HasDatabaseName("IX_ProductVariant_SKU");
            
            entity.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_ProductVariant_IsActive")
                .HasFilter("[IsActive] = 1");
            
            entity.HasIndex(e => new { e.ProductId, e.IsActive })
                .HasDatabaseName("IX_ProductVariant_ProductId_IsActive");
            
            entity.HasIndex(e => e.Color)
                .HasDatabaseName("IX_ProductVariant_Color");
            
            entity.HasIndex(e => e.Size)
                .HasDatabaseName("IX_ProductVariant_Size");

            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_ProductVariant_Price", "[Price] >= 0");
                t.HasCheckConstraint(
                    "CK_ProductVariant_CompareAtPrice",
                    "[CompareAtPrice] IS NULL OR [CompareAtPrice] >= [Price]"
                );
            });
        });

        //PRODUCT IMAGE ENTITY CONFIGURATION
        builder.Entity<ProductImage>(entity =>
        {
            //Relationships
            entity.HasOne(e => e.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ProductVariant)
                .WithMany(pv => pv.Images)
                .HasForeignKey(e => e.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Deleter)
                .WithMany()
                .HasForeignKey(e => e.DeletedBy)
                .OnDelete(DeleteBehavior.Restrict);

            //Properties
            entity.Property(pi => pi.ImageUrl).HasMaxLength(500);
            entity.Property(pi => pi.AltText).HasMaxLength(200);
            entity.Property(pi => pi.ModelUrl).HasMaxLength(500);

            //Indexes
            entity.HasIndex(e => e.ProductId)
                .HasDatabaseName("IX_ProductImage_ProductId");
            
            entity.HasIndex(e => e.ProductVariantId)
                .HasDatabaseName("IX_ProductImage_ProductVariantId");
            
            entity.HasIndex(e => new { e.ProductId, e.DisplayOrder })
                .HasDatabaseName("IX_ProductImage_ProductId_DisplayOrder");
            
            entity.HasIndex(e => new { e.ProductVariantId, e.DisplayOrder })
                .HasDatabaseName("IX_ProductImage_ProductVariantId_DisplayOrder");
            
            entity.HasIndex(e => e.IsDeleted)
                .HasDatabaseName("IX_ProductImage_IsDeleted")
                .HasFilter("[IsDeleted] = 0");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_ProductImage_Reference",
                    "([ProductVariantId] IS NOT NULL AND [ProductId] IS NULL) OR ([ProductVariantId] IS NULL AND [ProductId] IS NOT NULL)"
                );
            });

        });


         //STOCK ENTITY CONFIGURATION
        builder.Entity<Stock>(entity =>
        {
            //Relationships
            entity.HasOne(e => e.ProductVariant)
                .WithOne(pv => pv.Stock)
                .HasForeignKey<Stock>(e => e.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.UpdatedByUser)
                .WithMany()
                .HasForeignKey(e => e.UpdatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            //Properties
            entity.Property(s => s.Notes).HasMaxLength(500);
            entity.Property(x => x.QuantityAvailable)
                .HasComputedColumnSql(
                    "[QuantityOnHand] - [QuantityReserved]",
                    stored: true
                );

            //Indexes
            entity.HasIndex(e => e.ProductVariantId)
                .IsUnique()
                .HasDatabaseName("IX_Stock_ProductVariantId");
            
            entity.HasIndex(e => e.UpdatedAt)
                .HasDatabaseName("IX_Stock_UpdatedAt");
            
            entity.HasIndex(e => e.UpdatedBy)
                .HasDatabaseName("IX_Stock_UpdatedBy");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Stock_Quantity_Valid",
                    "[QuantityOnHand] >= 0 AND " +
                    "[QuantityReserved] >= 0 AND " +
                    "[QuantityReserved] <= [QuantityOnHand]"
                );
            });
        
        });

        // InventoryTransaction ENTITY CONFIGURATION 
        builder.Entity<InventoryTransaction>(entity =>
        {
            //Relationships
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductVariant)
                .WithMany()
                .HasForeignKey(e => e.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Approver)
                .WithMany()
                .HasForeignKey(e => e.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            //Properties
            entity.Property(e => e.Notes).HasMaxLength(500);

            //Indexes
            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_InventoryTransaction_UserId");
            
            entity.HasIndex(e => e.ProductVariantId)
                .HasDatabaseName("IX_InventoryTransaction_ProductVariantId");
            
            entity.HasIndex(e => e.TransactionType)
                .HasDatabaseName("IX_InventoryTransaction_TransactionType");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_InventoryTransaction_Status");
            
            entity.HasIndex(e => new { e.ReferenceType, e.ReferenceId })
                .HasDatabaseName("IX_InventoryTransaction_Reference");
            
            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_InventoryTransaction_CreatedAt");
            
            entity.HasIndex(e => e.CreatedBy)
                .HasDatabaseName("IX_InventoryTransaction_CreatedBy");
            
            entity.HasIndex(e => e.ApprovedAt)
                .HasDatabaseName("IX_InventoryTransaction_ApprovedAt");

            entity.HasIndex(e => e.ApprovedBy)
                .HasDatabaseName("IX_InventoryTransaction_ApprovedBy");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_InventoryTransaction_Quantity_Valid",
                    "Quantity > 0"
                );
                t.HasCheckConstraint(
                    "CK_InventoryTransaction_Type",
                    "[TransactionType] IN (1, 2, 3)"
                );

                t.HasCheckConstraint(
                    "CK_InventoryTransaction_ReferenceType",
                    "[ReferenceType] IN (1, 2, 3, 4)"
                );

                t.HasCheckConstraint(
                    "CK_InventoryTransaction_ReferenceType_ReferenceId",
                    "(ReferenceType IN (1,2,3) AND ReferenceId IS NOT NULL)" +
                    "OR (ReferenceType = 4)"
                );

                t.HasCheckConstraint(
                    "CK_InventoryTransaction_Status",
                    "[Status] IN (0, 1)"
                );

                t.HasCheckConstraint(
                    "CK_InventoryTransaction_Status_ApprovedAt",
                    "(Status = 0 AND ApprovedAt IS NULL AND ApprovedBy IS NULL)" +
                    "OR (Status = 1 AND ApprovedAt IS NOT NULL AND ApprovedBy IS NOT NULL)"
                );
            });
        });

        //// InboundRecord ENTITY CONFIGURATION 
        builder.Entity<InboundRecord>(entity =>{
            //Relationships
            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Approver)
                .WithMany()
                .HasForeignKey(e => e.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            //Properties
            entity.Property(e => e.SourceReference).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.RejectionReason).HasMaxLength(500);

            //Indexes
            entity.HasIndex(e => e.SourceType)
                .HasDatabaseName("IX_InboundRecord_SourceType");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_InboundRecord_Status");
            
            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_InboundRecord_CreatedAt");
            
            entity.HasIndex(e => e.CreatedBy)
                .HasDatabaseName("IX_InboundRecord_CreatedBy");
            
            entity.HasIndex(e => e.ApprovedAt)
                .HasDatabaseName("IX_InboundRecord_ApprovedAt");
            
            entity.HasIndex(e => e.ApprovedBy)
                .HasDatabaseName("IX_InboundRecord_ApprovedBy");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_InboundRecord_SourceType",
                    "[SourceType] IN (1, 2, 3)"
                );

                t.HasCheckConstraint(
                    "CK_InboundRecord_Status",
                    "[Status] IN (0, 1, 2)"
                );

                t.HasCheckConstraint(
                    "CK_InboundRecord_Status_ApprovedAt_RejectedAt",
                    "(Status = 0 AND ApprovedAt IS NULL AND ApprovedBy IS NULL AND RejectedAt IS NULL AND RejectionReason IS NULL)" +
                    "OR (Status = 1 AND ApprovedAt IS NOT NULL AND ApprovedBy IS NOT NULL AND RejectedAt IS NULL AND RejectionReason IS NULL)" +
                    "OR (Status = 2 AND RejectedAt IS NOT NULL AND RejectionReason IS NOT NULL AND ApprovedAt IS NULL AND ApprovedBy IS NULL)"
                );
            });
        });

        //InboundRecordItem ENTITY CONFIGURATION
        builder.Entity<InboundRecordItem>(entity =>
        {
            //Relationships
            entity.HasOne(iri => iri.InboundRecord)
                .WithMany(ir => ir.Items)
                .HasForeignKey(iri => iri.InboundRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(iri => iri.ProductVariant)
                .WithMany()
                .HasForeignKey(iri => iri.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            //Properties
            entity.Property(iri => iri.Notes).HasMaxLength(400);

            //Indexes
            entity.HasIndex(e => e.InboundRecordId)
                .HasDatabaseName("IX_InboundRecordItem_InboundRecordId");
            
            entity.HasIndex(e => e.ProductVariantId)
                .HasDatabaseName("IX_InboundRecordItem_ProductVariantId");

            entity.HasIndex(e => new { e.InboundRecordId, e.ProductVariantId })
                .IsUnique()
                .HasDatabaseName("UX_InboundRecordItem_Record_ProductVariant");
            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_InboundRecordItem_Quantity",
                    "Quantity > 0"
                );
            });
        });

        //CART ENTITY CONFIGURATION
        builder.Entity<Cart>(entity =>
        {
            //Relationships
            entity.HasOne(c => c.User)
                .WithMany(u => u.Carts)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            //Indexes

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Cart_UserId");

            //1 active cart per user
            entity.HasIndex(c => c.UserId)
                .IsUnique()
                .HasFilter("[Status] = 1")
                .HasDatabaseName("UX_Cart_User_Active");
            
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Cart_Status");
            
            entity.HasIndex(e => new { e.UserId, e.Status })
                .HasDatabaseName("IX_Cart_UserId_Status");
            
            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Cart_CreatedAt");
            
            entity.HasIndex(e => e.UpdatedAt)
                .HasDatabaseName("IX_Cart_UpdatedAt");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Cart_Status",
                    "[Status] IN (1, 2, 3)"
                );
            });
        });

        //CART ITEM ENTITY CONFIGURATION
        builder.Entity<CartItem>(entity =>
        {
            //Relationships
            entity.HasOne(ci => ci.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ci => ci.ProductVariant)
                .WithMany()
                .HasForeignKey(ci => ci.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);

            //Indexes
            entity.HasIndex(e => e.CartId)
                .HasDatabaseName("IX_CartItem_CartId");
            
            entity.HasIndex(e => e.ProductVariantId)
                .HasDatabaseName("IX_CartItem_ProductVariantId");
            
            entity.HasIndex(e => new { e.CartId, e.ProductVariantId })
                .IsUnique()
                .HasDatabaseName("UX_CartItem_Cart_ProductVariant");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_CartItem_Quantity",
                    "Quantity > 0"
                );
            });
        });

        //PROMOTION ENTITY CONFIGURATION
        builder.Entity<Promotion>(entity =>
        {
            //Properties
            entity.Property(p => p.PromoCode).HasMaxLength(50);
            entity.Property(p => p.PromoName).HasMaxLength(200);
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.Property(p => p.DiscountValue).HasColumnType("decimal(10,2)");
            entity.Property(p => p.MaxDiscountValue).HasColumnType("decimal(10,2)");

            //Indexes
            entity.HasIndex(e => e.PromoCode)
                .IsUnique()
                .HasDatabaseName("UX_Promotion_PromoCode");

            entity.HasIndex(e => new { e.ValidFrom, e.ValidTo })
                .HasDatabaseName("IX_Promotion_ValidDates");

            entity.HasIndex(e => new { e.IsActive, e.ValidFrom, e.ValidTo })
                .HasDatabaseName("IX_Promotion_Active_ValidPeriod");
            
            entity.HasIndex(e => e.PromotionType)
                .HasDatabaseName("IX_Promotion_PromotionType");
            
            entity.HasIndex(e => new { e.PromotionType, e.ValidFrom, e.ValidTo })
                .HasDatabaseName("IX_Promotion_Type_ValidPeriod");

            //Constraints
            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Promotion_DiscountValue",
                    "DiscountValue >= 0"
                );      

                t.HasCheckConstraint(   
                    "CK_Promotion_DiscountValue_ByType",
                    @"
                    (PromotionType = 0 AND DiscountValue > 0 AND DiscountValue <= 100)
                    OR (PromotionType = 1 AND DiscountValue > 0)
                    OR (PromotionType = 2 AND DiscountValue = 0)
                    "
                );

                t.HasCheckConstraint(
                    "CK_Promotion_MaxDiscountValue",
                    "MaxDiscountValue IS NULL OR MaxDiscountValue >= 0"
                );

                t.HasCheckConstraint(
                    "CK_Promotion_ValidPeriod",
                    "ValidTo > ValidFrom"   
                );

                t.HasCheckConstraint(
                    "CK_Promotion_Type",
                    "[PromotionType] IN (0, 1, 2)"
                );
            });
        });        
    }

}
