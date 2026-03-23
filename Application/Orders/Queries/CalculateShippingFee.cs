using Application.Core;
using Application.Interfaces;
using MediatR;

namespace Application.Orders.Queries;

public sealed class CalculateShippingFee
{
    public sealed class Query : IRequest<Result<decimal>>
    {
        public int DistrictId { get; set; }
        public string WardCode { get; set; } = string.Empty;
        public int Weight { get; set; } = 200;
        public decimal InsuranceValue { get; set; } = 0;
    }

    internal sealed class Handler(IGHNService ghnService) : IRequestHandler<Query, Result<decimal>>
    {
        public async Task<Result<decimal>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (request.DistrictId <= 0 || string.IsNullOrWhiteSpace(request.WardCode))
            {
                return Result<decimal>.Failure("DistrictId and WardCode are required.", 400);
            }

            try
            {
                decimal fee = await ghnService.CalculateShippingFeeAsync(
                    request.DistrictId, 
                    request.WardCode, 
                    request.Weight, 
                    request.InsuranceValue);
                    
                return Result<decimal>.Success(fee);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure(ex.Message, 400);
            }
        }
    }
}
