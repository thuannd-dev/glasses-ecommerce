using Application.Core;
using Domain;
using Persistence;
using Microsoft.EntityFrameworkCore;

namespace Application.AfterSales.Services;

/// <summary>
/// Calculates discount amounts for after-sales tickets based on promotions applied to the order.
/// </summary>
public sealed class DiscountCalculationService(AppDbContext context)
{
    /// <summary>
    /// Calculates the total discount applied to the specified items in an order.
    /// 
    /// Discount calculation logic:
    /// - Distributes the actual applied discount (PromoUsageLog.DiscountApplied) proportionally
    ///   based on the selected items' value relative to the total order value.
    /// - This ensures we use the exact discount that was applied to the order, accounting for
    ///   any caps (MaxDiscountValue) or other adjustments made at purchase time.
    /// </summary>
    /// <param name="orderId">The ID of the order.</param>
    /// <param name="orderItemIds">The IDs of items in the ticket. If null/empty, calculates for all items in the order.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total discount amount for the specified items, or a failure result if the order/items are invalid.</returns>
    public async Task<Result<decimal>> CalculateDiscountAsync(Guid orderId, List<Guid>? orderItemIds, CancellationToken cancellationToken = default)
    {
        // Load the order with its items and promo usage logs
        Order? order = await context.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Include(o => o.PromoUsageLogs)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order == null)
            return Result<decimal>.Failure("Order not found.", 404);

        // Determine which items are in scope for this ticket
        List<OrderItem> itemsInTicket = orderItemIds == null || orderItemIds.Count == 0
            ? order.OrderItems.ToList()
            : order.OrderItems.Where(i => orderItemIds.Contains(i.Id)).ToList();

        if (itemsInTicket.Count == 0)
            return Result<decimal>.Failure("No valid items found in the order for the specified ticket.", 400);

        // Calculate total value of all order items (for proportional distribution)
        // Include lens and coating prices in the total value calculation
        decimal totalOrderValue = order.OrderItems.Sum(oi => oi.Quantity * (oi.UnitPrice + oi.LensUnitPrice + oi.CoatingExtraPrice));
        
        // Calculate total value of selected ticket items
        // Include lens and coating prices for accurate proportional distribution
        decimal ticketItemsValue = itemsInTicket.Sum(ti => ti.Quantity * (ti.UnitPrice + ti.LensUnitPrice + ti.CoatingExtraPrice));

        if (totalOrderValue == 0)
            return Result<decimal>.Failure("Order has no items with value.", 400);

        // Distribute total actual applied discount proportionally across selected items
        decimal totalAppliedDiscount = order.PromoUsageLogs.Sum(pul => pul.DiscountApplied);
        decimal proportionalDiscount = (ticketItemsValue / totalOrderValue) * totalAppliedDiscount;
        
        // Round intentionally to 2 decimal places to prevent drift across multiple tickets.
        // This ensures all tickets see the same rounded discount value, consistent with storage.
        proportionalDiscount = Math.Round(proportionalDiscount, 2, MidpointRounding.AwayFromZero);

        return Result<decimal>.Success(proportionalDiscount);
    }
}
