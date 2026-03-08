-- Cleanup Test Orders and Tickets
-- This script removes all test orders and related tickets created during testing

USE Glasses;

-- Identify test order IDs (using test customer names from create_test_orders.sql)
DECLARE @TestOrderIds TABLE (OrderId UNIQUEIDENTIFIER);

INSERT INTO @TestOrderIds
SELECT Id FROM [Orders]
WHERE WalkInCustomerName LIKE '%ReadyStock Customer%'
   OR WalkInCustomerName LIKE '%PreOrder Customer%'
   OR WalkInCustomerName LIKE '%Prescription Customer%';

-- Count test data before deletion
DECLARE @OrderCount INT = (SELECT COUNT(*) FROM @TestOrderIds);
DECLARE @TicketCount INT = (SELECT COUNT(*) FROM [AfterSalesTickets] WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds));

PRINT 'Orders to delete: ' + CAST(@OrderCount AS VARCHAR);
PRINT 'Tickets to delete: ' + CAST(@TicketCount AS VARCHAR);

IF @OrderCount = 0
BEGIN
    PRINT 'No test orders found to delete';
    RETURN;
END

-- Delete related data in order of dependencies
SET QUOTED_IDENTIFIER ON;
BEGIN TRANSACTION;

-- Delete TicketAttachments
DELETE FROM [TicketAttachments]
WHERE TicketId IN (
    SELECT Id FROM [AfterSalesTickets]
    WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds)
);
PRINT 'Deleted TicketAttachments';

-- Delete AfterSalesTickets
DELETE FROM [AfterSalesTickets]
WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted AfterSalesTickets';

-- Delete Refunds (via Payments)
DELETE FROM [Refunds]
WHERE PaymentId IN (
    SELECT Id FROM [Payments]
    WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds)
);
PRINT 'Deleted Refunds';

-- Delete Payments
DELETE FROM [Payments]
WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted Payments';

-- Delete InventoryTransactions
DELETE FROM [InventoryTransactions]
WHERE ReferenceType = 1 AND ReferenceId IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted InventoryTransactions';

-- Delete OrderStatusHistory
DELETE FROM [OrderStatusHistories]
WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted OrderStatusHistories';

-- Delete ShipmentInfos
DELETE FROM [ShipmentInfos]
WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted ShipmentInfos';

-- Delete OrderItems
DELETE FROM [OrderItems]
WHERE OrderId IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted OrderItems';

-- Delete Orders
DELETE FROM [Orders]
WHERE Id IN (SELECT OrderId FROM @TestOrderIds);
PRINT 'Deleted Orders';

COMMIT TRANSACTION;

PRINT 'Test data cleanup completed successfully';

