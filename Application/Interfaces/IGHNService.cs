using Application.Orders.DTOs;

namespace Application.Interfaces;

public interface IGHNService
{
    Task<GHNCreateOrderResponseDto> CreateShippingOrderAsync(GHNCreateOrderRequestDto request);
    Task<decimal> CalculateShippingFeeAsync(int toDistrictId, string toWardCode, int weight = 200, decimal insuranceValue = 0);
    Task<string> GetOrderPrintUrlAsync(string orderCode);
}
