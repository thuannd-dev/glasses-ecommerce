using System.Net.Http.Json;
using System.Text.Json;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Infrastructure.Payments;
using Microsoft.Extensions.Options;

namespace Infrastructure.GHN;

public class GHNService : IGHNService
{
    private readonly HttpClient _httpClient;
    private readonly GHNSettings _settings;
    private readonly VnpaySettings _vnpaySettings;

    public GHNService(HttpClient httpClient, IOptions<GHNSettings> settings, IOptions<VnpaySettings> vnpaySettings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _vnpaySettings = vnpaySettings.Value;

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("Token", _settings.Token);
    }

    public async Task<GHNCreateOrderResponseDto> CreateShippingOrderAsync(GHNCreateOrderRequestDto request)
    {
        // Add ShopId header for this request
        _httpClient.DefaultRequestHeaders.Remove("ShopId");
        _httpClient.DefaultRequestHeaders.Add("ShopId", _settings.ShopId);

        var codAmountVnd = (int)Math.Round(request.CodAmount * _vnpaySettings.UsdToVndRate, 0, MidpointRounding.AwayFromZero);
        var insuranceValueVnd = request.InsuranceValue.HasValue 
            ? (int)Math.Round(request.InsuranceValue.Value * _vnpaySettings.UsdToVndRate, 0, MidpointRounding.AwayFromZero)
            : 0;

        var itemsVnd = request.Items.Select(i => new
        {
            name = i.Name,
            code = i.Code,
            quantity = i.Quantity,
            price = (int)Math.Round(i.Price * _vnpaySettings.UsdToVndRate, 0, MidpointRounding.AwayFromZero),
            weight = i.Weight
        }).ToList();

        var payload = new
        {
            to_name = request.ToName,
            to_phone = request.ToPhone,
            to_address = request.ToAddress,
            to_ward_code = request.ToWardCode,
            to_district_id = request.ToDistrictId,
            weight = request.Weight,
            length = request.Length,
            width = request.Width,
            height = request.Height,
            service_type_id = request.ServiceTypeId,
            payment_type_id = request.PaymentTypeId,
            required_note = request.RequiredNote,
            items = itemsVnd,
            client_order_code = request.ClientOrderCode,
            cod_amount = codAmountVnd,
            insurance_value = Math.Min(insuranceValueVnd, 50000000)
        };

        var response = await _httpClient.PostAsJsonAsync("v2/shipping-order/create", payload);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"GHN API Error: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (jsonResponse.GetProperty("code").GetInt32() != 200)
        {
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");
        }

        var data = jsonResponse.GetProperty("data");

        return new GHNCreateOrderResponseDto
        {
            OrderCode = data.GetProperty("order_code").GetString() ?? "",
            TotalFee = data.GetProperty("total_fee").GetInt32(),
            ExpectedDeliveryTime = data.TryGetProperty("expected_delivery_time", out var expectedTime)
                ? expectedTime.GetString() ?? ""
                : ""
        };
    }

    public async Task<decimal> CalculateShippingFeeAsync(int toDistrictId, string toWardCode, int weight = 200, decimal insuranceValue = 0)
    {
        _httpClient.DefaultRequestHeaders.Remove("ShopId");
        _httpClient.DefaultRequestHeaders.Add("ShopId", _settings.ShopId);

        var insuranceValueVnd = (int)Math.Round(insuranceValue * _vnpaySettings.UsdToVndRate, 0, MidpointRounding.AwayFromZero);

        var request = new
        {
            service_type_id = 2,
            to_district_id = toDistrictId,
            to_ward_code = toWardCode,
            weight = weight,
            insurance_value = Math.Min(insuranceValueVnd, 50000000) // Max allowed by GHN is 50,000,000 VND
        };

        var response = await _httpClient.PostAsJsonAsync("v2/shipping-order/fee", request);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"GHN Shipping Fee Error: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (jsonResponse.GetProperty("code").GetInt32() != 200)
        {
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");
        }

        var totalTotalVnd = jsonResponse.GetProperty("data").GetProperty("total").GetInt32();
        
        // Convert VND back to USD for the application to use
        var totalUsd = Math.Round((decimal)totalTotalVnd / _vnpaySettings.UsdToVndRate, 2);
        
        return totalUsd;
    }

    public async Task<string> GetOrderPrintUrlAsync(string orderCode)
    {
        var request = new { order_codes = new[] { orderCode } };
        var response = await _httpClient.PostAsJsonAsync("v2/a5/gen-token", request);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"GHN API Error: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (jsonResponse.GetProperty("code").GetInt32() != 200)
        {
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");
        }

        var token = jsonResponse.GetProperty("data").GetProperty("token").GetString();
        
        // Return full URL to print A5
        return $"https://dev-online-gateway.ghn.vn/a5/public-api/printA5?token={token}";
        // Note: For production use: "https://online-gateway.ghn.vn/a5/public-api/printA5?token="
    }
}
