using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Queries;

public sealed class GetGHNPrintUrl
{
    public sealed class Query : IRequest<Result<string>>
    {
        public Guid OrderId { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IGHNService ghnService) : IRequestHandler<Query, Result<string>>
    {
        public async Task<Result<string>> Handle(Query request, CancellationToken cancellationToken)
        {
            var shipment = await context.Set<ShipmentInfo>()
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.OrderId == request.OrderId, cancellationToken);

            if (shipment == null || string.IsNullOrEmpty(shipment.TrackingCode))
            {
                return Result<string>.Failure("Tracking code not found for this order.", 404);
            }

            try
            {
                var printUrl = await ghnService.GetOrderPrintUrlAsync(shipment.TrackingCode);
                return Result<string>.Success(printUrl);
            }
            catch (Exception ex)
            {
                return Result<string>.Failure(ex.Message, 400);
            }
        }
    }
}
