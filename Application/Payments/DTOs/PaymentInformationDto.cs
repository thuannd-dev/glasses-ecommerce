namespace Application.Payments.DTOs;
/// <summary>
/// Dto chứa thông tin để tạo URL thanh toán VnPay
/// </summary>
public sealed class PaymentInformationDto
{
    public Guid OrderId { get; set; }
    public required string OrderType { get; set; }
    public decimal Amount { get; set; }
    public string? OrderDescription { get; set; }
    public required string Name { get; set; }
    // Set bởi Command handler, không phải client
    public string? VnPayTxnRef { get; set; }
}
