using System.Net.Http.Json;
using System.Text.Json;
using Application.Core;
using Application.Interfaces;
using Application.Orders.DTOs;
using Infrastructure.Payments;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Infrastructure.GHN;

public sealed class GHNService : IGHNService
{
    private readonly HttpClient _httpClient;
    private readonly GHNSettings _settings;
    private readonly VnpaySettings _vnpaySettings;
    private readonly IMemoryCache _cache;

    // Cache TTLs
    private static readonly TimeSpan ProvinceTtl = TimeSpan.FromHours(24);
    private static readonly TimeSpan DistrictTtl = TimeSpan.FromHours(24);
    private static readonly TimeSpan WardTtl = TimeSpan.FromHours(6);

    public GHNService(
        HttpClient httpClient,
        IOptions<GHNSettings> settings,
        IOptions<VnpaySettings> vnpaySettings,
        IMemoryCache cache)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _vnpaySettings = vnpaySettings.Value;
        _cache = cache;

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("Token", _settings.Token);
    }

    public async Task<GHNCreateOrderResponseDto> CreateShippingOrderAsync(GHNCreateOrderRequestDto request)
    {

        int codAmountVnd = (int)Math.Round(request.CodAmount * _vnpaySettings.UsdToVndRate, 0, MidpointRounding.AwayFromZero);
        int insuranceValueVnd = request.InsuranceValue.HasValue

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

        if (insuranceValueVnd > 50000000)
        {
            throw new ArgumentException($"Insurance value {insuranceValueVnd} VND exceeds GHN limit of 50,000,000 VND. Requested: {request.InsuranceValue:F2} USD.");
        }

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
            insurance_value = insuranceValueVnd
        };

        using HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, "v2/shipping-order/create");
        requestMessage.Headers.Add("ShopId", _settings.ShopId);
        requestMessage.Content = JsonContent.Create(payload);

        HttpResponseMessage response = await _httpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"GHN API Error: {response.StatusCode} - {errorContent}");
        }

        JsonElement jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (jsonResponse.GetProperty("code").GetInt32() != 200)
        {
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");
        }

        JsonElement data = jsonResponse.GetProperty("data");

        GHNCreateOrderResponseDto orderResponse = new GHNCreateOrderResponseDto
        {
            OrderCode = data.GetProperty("order_code").GetString() ?? "",
            TotalFee = data.GetProperty("total_fee").GetInt32(),
            ExpectedDeliveryTime = data.TryGetProperty("expected_delivery_time", out JsonElement expectedTime)
                ? expectedTime.GetString() ?? ""
                : ""
        };

        return orderResponse;
    }

    public async Task<decimal> CalculateShippingFeeAsync(int toDistrictId, string toWardCode, int weight = 200, decimal insuranceValue = 0)
    {

        int insuranceValueVnd = (int)Math.Round(insuranceValue * _vnpaySettings.UsdToVndRate, 0, MidpointRounding.AwayFromZero);

        if (insuranceValueVnd > 50000000)
        {
            throw new ArgumentException($"Insurance value {insuranceValueVnd} VND exceeds GHN limit of 50,000,000 VND. Requested: {insuranceValue:F2} USD.");
        }

        var requestInner = new
        {
            service_type_id = 2,
            to_district_id = toDistrictId,
            to_ward_code = toWardCode,
            weight = weight,
            insurance_value = insuranceValueVnd
        };

        using HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, "v2/shipping-order/fee");
        requestMessage.Headers.Add("ShopId", _settings.ShopId);
        requestMessage.Content = JsonContent.Create(requestInner);

        HttpResponseMessage response = await _httpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"GHN Shipping Fee Error: {response.StatusCode} - {errorContent}");
        }

        JsonElement jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (jsonResponse.GetProperty("code").GetInt32() != 200)
        {
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");
        }

        int shippingFeeVnd = jsonResponse.GetProperty("data").GetProperty("total").GetInt32();

        // Convert VND back to USD for the application to use

        decimal totalUsd = Math.Round((decimal)shippingFeeVnd / _vnpaySettings.UsdToVndRate, 2);


        return totalUsd;
    }

    public async Task<string> GetOrderPrintUrlAsync(string orderCode)
    {
        var request = new { order_codes = new[] { orderCode } };
        HttpResponseMessage response = await _httpClient.PostAsJsonAsync("v2/a5/gen-token", request);

        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"GHN API Error: {response.StatusCode} - {errorContent}");
        }

        JsonElement jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (jsonResponse.GetProperty("code").GetInt32() != 200)
        {
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");
        }

        string? token = jsonResponse.GetProperty("data").GetProperty("token").GetString();

        // Return full URL to print A5 using configured base URL
        return $"{_settings.PrintOrderUrl}?token={token}";
    }

    public async Task<IReadOnlyList<GHNProvinceDto>> GetProvincesAsync(CancellationToken ct = default)
    {
        const string cacheKey = "ghn:provinces";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<GHNProvinceDto>? cached))
            return cached!;

        HttpResponseMessage response = await _httpClient.GetAsync("master-data/province", ct);
        JsonElement json = await ReadGhnResponseAsync(response, ct);

        IReadOnlyList<GHNProvinceDto> result = json.EnumerateArray()
            .Select(p => new GHNProvinceDto(
                p.GetProperty("ProvinceID").GetInt32(),
                p.GetProperty("ProvinceName").GetString() ?? string.Empty))
            .ToList();

        _cache.Set(cacheKey, result, ProvinceTtl);
        return result;
    }

    public async Task<IReadOnlyList<GHNDistrictDto>> GetDistrictsAsync(int provinceId, CancellationToken ct = default)
    {
        string cacheKey = $"ghn:districts:{provinceId}";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<GHNDistrictDto>? cached))
            return cached!;

        using HttpRequestMessage req = new HttpRequestMessage(HttpMethod.Post, "master-data/district");
        req.Content = JsonContent.Create(new { province_id = provinceId });
        HttpResponseMessage response = await _httpClient.SendAsync(req, ct);
        JsonElement json = await ReadGhnResponseAsync(response, ct);

        IReadOnlyList<GHNDistrictDto> result = json.EnumerateArray()
            .Select(d => new GHNDistrictDto(
                d.GetProperty("DistrictID").GetInt32(),
                d.GetProperty("DistrictName").GetString() ?? string.Empty,
                d.GetProperty("ProvinceID").GetInt32()))
            .ToList();

        _cache.Set(cacheKey, result, DistrictTtl);
        return result;
    }

    public async Task<IReadOnlyList<GHNWardDto>> GetWardsAsync(int districtId, CancellationToken ct = default)
    {
        string cacheKey = $"ghn:wards:{districtId}";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<GHNWardDto>? cached))
            return cached!;

        using HttpRequestMessage req = new HttpRequestMessage(HttpMethod.Post, "master-data/ward");
        req.Content = JsonContent.Create(new { district_id = districtId });
        HttpResponseMessage response = await _httpClient.SendAsync(req, ct);
        JsonElement json = await ReadGhnResponseAsync(response, ct);

        IReadOnlyList<GHNWardDto> result = json.EnumerateArray()
            .Select(w => new GHNWardDto(
                w.GetProperty("WardCode").GetString() ?? string.Empty,
                w.GetProperty("WardName").GetString() ?? string.Empty,
                w.GetProperty("DistrictID").GetInt32()))
            .ToList();

        _cache.Set(cacheKey, result, WardTtl);
        return result;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private static async Task<JsonElement> ReadGhnResponseAsync(HttpResponseMessage response, CancellationToken ct = default)
    {
        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync(ct);
            throw new Exception($"GHN API Error: {response.StatusCode} - {errorContent}");
        }

        JsonElement jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>(ct);

        if (jsonResponse.ValueKind == JsonValueKind.Undefined)
            throw new Exception("GHN API returned empty response");
        if (jsonResponse.GetProperty("code").GetInt32() != 200)
            throw new Exception($"GHN API Business Error: {jsonResponse.GetProperty("message").GetString()}");

        return jsonResponse.GetProperty("data");
    }
}
