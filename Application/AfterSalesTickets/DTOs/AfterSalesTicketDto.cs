using Domain;

namespace Application.AfterSalesTickets.DTOs;

public sealed class AfterSalesTicketListDto
{
    public required Guid Id { get; set; }
    public required string TicketNumber { get; set; }
    public required Guid OrderId { get; set; }
    public required string OrderNumber { get; set; }
    public required string CustomerEmail { get; set; }
    public required string CustomerName { get; set; }
    public required AfterSalesTicketType TicketType { get; set; }
    public required AfterSalesTicketStatus TicketStatus { get; set; }
    public required string Reason { get; set; }
    public string? PolicyViolation { get; set; }
    public required DateTime CreatedAt { get; set; }
    public decimal? RefundAmount { get; set; }
}

public sealed class AfterSalesTicketDetailDto
{
    public required Guid Id { get; set; }
    public required string TicketNumber { get; set; }
    public required Guid OrderId { get; set; }
    public required string OrderNumber { get; set; }
    public required string CustomerEmail { get; set; }
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public required AfterSalesTicketType TicketType { get; set; }
    public required AfterSalesTicketStatus TicketStatus { get; set; }
    public required string Reason { get; set; }
    public string? RequestedAction { get; set; }
    public decimal? RefundAmount { get; set; }
    public bool IsRequiredEvidence { get; set; }
    public string? PolicyViolation { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public OrderSummaryDto OrderSummary { get; set; } = null!;
}

public sealed class OrderSummaryDto
{
    public required Guid Id { get; set; }
    public required string OrderNumber { get; set; }
    public required decimal TotalAmount { get; set; }
    public required OrderType OrderType { get; set; }
    public required DateTime CreatedAt { get; set; }
    public List<OrderItemSummaryDto> Items { get; set; } = [];
}

public sealed class OrderItemSummaryDto
{
    public required Guid Id { get; set; }
    public required string ProductName { get; set; }
    public required string GlassModel { get; set; }
    public required int Quantity { get; set; }
    public required decimal UnitPrice { get; set; }
}
