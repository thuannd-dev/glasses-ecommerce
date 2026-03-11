using Application.AfterSales.Queries;
using Application.Inventory.Queries;
using Application.Orders.Queries;
using Application.Promotions.Queries;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Manager")]
[Route("api/manager/reports")]
public sealed class ManagerReportsController : BaseApiController
{
    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue(
        [FromQuery] OrderSource? source,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetRevenueReport.Query
            {
                Source = source,
                FromDate = fromDate,
                ToDate = toDate
            }, ct));
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopSellingProducts(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int topN = 10,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetTopSellingProducts.Query
            {
                FromDate = fromDate,
                ToDate = toDate,
                TopN = topN
            }, ct));
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventoryStatus(
        [FromQuery] int lowStockThreshold = 10,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetInventoryStatusReport.Query
            {
                LowStockThreshold = lowStockThreshold
            }, ct));
    }

    [HttpGet("after-sales")]
    public async Task<IActionResult> GetAfterSalesReport(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetAfterSalesReport.Query
            {
                FromDate = fromDate,
                ToDate = toDate
            }, ct));
    }

    [HttpGet("promotions")]
    public async Task<IActionResult> GetPromotionsEffectivenessReport(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken ct = default)
    {
        return HandleResult(await Mediator.Send(
            new GetPromotionsEffectivenessReport.Query
            {
                FromDate = fromDate,
                ToDate = toDate
            }, ct));
    }
}
