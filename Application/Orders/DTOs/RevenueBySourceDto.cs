namespace Application.Orders.DTOs;

//Dto Response cho doanh thu theo từng kênh bán hàng (Online/Offline)
public sealed class RevenueBySourceDto
{
    public string? Source { get; set; }
    public int OrderCount { get; set; }
    public decimal Revenue { get; set; }
    public decimal Discount { get; set; }
    public decimal NetRevenue { get; set; }
}
