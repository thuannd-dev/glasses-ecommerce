namespace Application.Payments.DTOs;
/// <summary>
///  Dto chứa thông tin phản hồi từ VnPay sau khi thanh toán
/// </summary>
public sealed class PaymentResponseModel
{
    public string OrderDescription { get; set; }
    public string TransactionId { get; set; }
    public string OrderId { get; set; }
    public string PaymentMethod { get; set; }
    public string PaymentId { get; set; }
    public bool Success { get; set; }
    public string Token { get; set; }
    public string VnPayResponseCode { get; set; }
}
