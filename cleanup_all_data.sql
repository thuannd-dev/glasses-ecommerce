-- Comprehensive Cleanup: Delete ALL Orders and Tickets
-- This script removes all orders (any type) and all tickets (any type)

USE Glasses;

SET QUOTED_IDENTIFIER ON;

-- Count data before deletion
DECLARE @AllOrdersCount INT = (SELECT COUNT(*) FROM [Orders]);
DECLARE @AllTicketsCount INT = (SELECT COUNT(*) FROM [AfterSalesTickets]);
DECLARE @AllPaymentsCount INT = (SELECT COUNT(*) FROM [Payments]);
DECLARE @AllRefundsCount INT = (SELECT COUNT(*) FROM [Refunds]);
DECLARE @AllPrescriptionsCount INT = (SELECT COUNT(*) FROM [Prescriptions]);
DECLARE @AllPrescriptionDetailsCount INT = (SELECT COUNT(*) FROM [PrescriptionDetails]);

PRINT '=== DATA TO BE DELETED ===';
PRINT 'Orders: ' + CAST(@AllOrdersCount AS VARCHAR);
PRINT 'Tickets: ' + CAST(@AllTicketsCount AS VARCHAR);
PRINT 'Payments: ' + CAST(@AllPaymentsCount AS VARCHAR);
PRINT 'Refunds: ' + CAST(@AllRefundsCount AS VARCHAR);
PRINT 'Prescriptions: ' + CAST(@AllPrescriptionsCount AS VARCHAR);
PRINT 'PrescriptionDetails: ' + CAST(@AllPrescriptionDetailsCount AS VARCHAR);

IF @AllOrdersCount = 0 AND @AllTicketsCount = 0
BEGIN
    PRINT '';
    PRINT 'No data to delete - database is already clean';
    RETURN;
END

BEGIN TRANSACTION;

PRINT '';
PRINT '=== DELETION IN PROGRESS ===';

-- Delete TicketAttachments
DELETE FROM [TicketAttachments];
PRINT 'Deleted TicketAttachments';

-- Delete AfterSalesTickets (ALL of them)
DELETE FROM [AfterSalesTickets];
PRINT 'Deleted AfterSalesTickets: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete PrescriptionDetails
DELETE FROM [PrescriptionDetails];
PRINT 'Deleted PrescriptionDetails: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete Prescriptions
DELETE FROM [Prescriptions];
PRINT 'Deleted Prescriptions: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete Refunds (via PaymentId)
DELETE FROM [Refunds];
PRINT 'Deleted Refunds: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete Payments
DELETE FROM [Payments];
PRINT 'Deleted Payments: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete InventoryTransactions (ReferenceType = 1 for Orders)
DELETE FROM [InventoryTransactions]
WHERE ReferenceType = 1;
PRINT 'Deleted InventoryTransactions: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete OrderStatusHistories
DELETE FROM [OrderStatusHistories];
PRINT 'Deleted OrderStatusHistories: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete ShipmentInfos
DELETE FROM [ShipmentInfos];
PRINT 'Deleted ShipmentInfos: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete OrderItems
DELETE FROM [OrderItems];
PRINT 'Deleted OrderItems: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete PromoUsageLogs
DELETE FROM [PromoUsageLogs];
PRINT 'Deleted PromoUsageLogs: ' + CAST(@@ROWCOUNT AS VARCHAR);

-- Delete Orders (ALL of them)
DELETE FROM [Orders];
PRINT 'Deleted Orders: ' + CAST(@@ROWCOUNT AS VARCHAR);

COMMIT TRANSACTION;

PRINT '';
PRINT '=== CLEANUP COMPLETED SUCCESSFULLY ===';
