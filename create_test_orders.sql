DECLARE @SalesUserId UNIQUEIDENTIFIER;
DECLARE @VariantId1 UNIQUEIDENTIFIER;
DECLARE @VariantId2 UNIQUEIDENTIFIER;
DECLARE @PreOrderPendingId UNIQUEIDENTIFIER = NEWID();
DECLARE @PreOrderConfirmedId UNIQUEIDENTIFIER = NEWID();
DECLARE @PrescriptionPendingId UNIQUEIDENTIFIER = NEWID();
DECLARE @PrescriptionConfirmedId UNIQUEIDENTIFIER = NEWID();

SELECT TOP 1 @SalesUserId = Id FROM AspNetUsers WHERE UserName LIKE '%sales%';
SELECT TOP 1 @VariantId1 = Id FROM ProductVariants WHERE IsActive = 1 ORDER BY Id;
SELECT TOP 1 @VariantId2 = Id FROM ProductVariants WHERE IsActive = 1 AND Id != @VariantId1 ORDER BY Id;

-- Insert PreOrder - Pending
INSERT INTO [Orders] (Id, OrderType, OrderSource, OrderStatus, TotalAmount, ShippingFee, WalkInCustomerName, WalkInCustomerPhone, CreatedBySalesStaff, CreatedAt)
VALUES (@PreOrderPendingId, 2, 1, 0, 300.00, 10.00, 'PreOrder Customer 1', '0123456789', @SalesUserId, GETUTCDATE());

-- Insert PreOrder - Confirmed
INSERT INTO [Orders] (Id, OrderType, OrderSource, OrderStatus, TotalAmount, ShippingFee, WalkInCustomerName, WalkInCustomerPhone, CreatedBySalesStaff, CreatedAt)
VALUES (@PreOrderConfirmedId, 2, 1, 1, 450.00, 15.00, 'PreOrder Customer 2', '0987654321', @SalesUserId, GETUTCDATE());

-- Insert Prescription - Pending
INSERT INTO [Orders] (Id, OrderType, OrderSource, OrderStatus, TotalAmount, ShippingFee, WalkInCustomerName, WalkInCustomerPhone, CreatedBySalesStaff, CreatedAt)
VALUES (@PrescriptionPendingId, 3, 1, 0, 250.00, 10.00, 'Prescription Customer 1', '0555666777', @SalesUserId, GETUTCDATE());

-- Insert Prescription - Confirmed
INSERT INTO [Orders] (Id, OrderType, OrderSource, OrderStatus, TotalAmount, ShippingFee, WalkInCustomerName, WalkInCustomerPhone, CreatedBySalesStaff, CreatedAt)
VALUES (@PrescriptionConfirmedId, 3, 1, 1, 380.00, 12.00, 'Prescription Customer 2', '0888999000', @SalesUserId, GETUTCDATE());

-- Add OrderItems
INSERT INTO [OrderItems] (Id, OrderId, ProductVariantId, Quantity, UnitPrice)
VALUES (NEWID(), @PreOrderPendingId, @VariantId1, 1, 290.00);

INSERT INTO [OrderItems] (Id, OrderId, ProductVariantId, Quantity, UnitPrice)
VALUES (NEWID(), @PreOrderConfirmedId, @VariantId2, 2, 217.50);

INSERT INTO [OrderItems] (Id, OrderId, ProductVariantId, Quantity, UnitPrice)
VALUES (NEWID(), @PrescriptionPendingId, @VariantId1, 1, 240.00);

INSERT INTO [OrderItems] (Id, OrderId, ProductVariantId, Quantity, UnitPrice)
VALUES (NEWID(), @PrescriptionConfirmedId, @VariantId2, 1, 368.00);

-- Add OrderStatusHistories
INSERT INTO [OrderStatusHistories] (Id, OrderId, FromStatus, ToStatus, Notes, CreatedAt)
VALUES (NEWID(), @PreOrderPendingId, 'Pending', 'Pending', 'Order created', GETUTCDATE());

INSERT INTO [OrderStatusHistories] (Id, OrderId, FromStatus, ToStatus, Notes, CreatedAt)
VALUES (NEWID(), @PreOrderConfirmedId, 'Pending', 'Confirmed', 'Order confirmed', GETUTCDATE());

INSERT INTO [OrderStatusHistories] (Id, OrderId, FromStatus, ToStatus, Notes, CreatedAt)
VALUES (NEWID(), @PrescriptionPendingId, 'Pending', 'Pending', 'Order created', GETUTCDATE());

INSERT INTO [OrderStatusHistories] (Id, OrderId, FromStatus, ToStatus, Notes, CreatedAt)
VALUES (NEWID(), @PrescriptionConfirmedId, 'Pending', 'Confirmed', 'Order confirmed', GETUTCDATE());

PRINT 'Test orders created successfully!';
SELECT COUNT(*) AS TotalOrders FROM [Orders];
SELECT OrderType, OrderStatus, COUNT(*) AS 'Count' FROM [Orders] GROUP BY OrderType, OrderStatus;
