using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

//Trả về tất cả enum values cho frontend dropdown/select
[AllowAnonymous]
[Route("api/lookups")]
public sealed class LookupsController : BaseApiController
{
    [HttpGet]
    public IActionResult GetLookups()
    {
        return Ok(new
        {
            OrderType = GetEnumValues<OrderType>(),
            OrderSource = GetEnumValues<OrderSource>(),
            OrderStatus = GetEnumValues<OrderStatus>(),
            PaymentMethod = GetEnumValues<PaymentMethod>(),
            PaymentStatus = GetEnumValues<PaymentStatus>(),
            PaymentType = GetEnumValues<PaymentType>(),
            ProductType = GetEnumValues<ProductType>(),
            ProductStatus = GetEnumValues<ProductStatus>(),
            EyeType = GetEnumValues<EyeType>(),
            CartStatus = GetEnumValues<CartStatus>(),
            PromotionType = GetEnumValues<PromotionType>(),
        });
    }

    private static List<string> GetEnumValues<T>() where T : struct, Enum
    {
        return [.. Enum.GetValues<T>()
            .Where(e => !e.ToString().Equals("Unknown", StringComparison.OrdinalIgnoreCase))
            .Select(e => e.ToString())];
    }
}
