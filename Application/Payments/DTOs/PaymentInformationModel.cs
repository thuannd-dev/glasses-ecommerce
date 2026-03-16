namespace Application.Payments.DTOs;
/// <summary>
/// Dto chứa thông tin để tạo URL thanh toán VnPay  
/// </summary>    
public sealed class PaymentInformationModel
{
    public string OrderType { get; set; }
    public double Amount { get; set; }
    public string OrderDescription { get; set; }
    public string Name { get; set; }
}
