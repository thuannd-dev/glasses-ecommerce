using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class UpdateOrderStatusCommand
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid OrderId { get; set; }
        public required OrderStatus NewStatus { get; set; }
        public int? PickedQuantity { get; set; }
    }

    public sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var order = await context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                return Result<Unit>.Failure("Order not found", 404);

            // Validate status transitions
            var validTransitions = new Dictionary<OrderStatus, List<OrderStatus>>
            {
                { OrderStatus.Pending, new List<OrderStatus> { OrderStatus.Confirmed, OrderStatus.Cancelled } },
                { OrderStatus.Confirmed, new List<OrderStatus> { OrderStatus.InProduction, OrderStatus.Cancelled } },
                { OrderStatus.InProduction, new List<OrderStatus> { OrderStatus.ReadyToPack, OrderStatus.Cancelled } },
                { OrderStatus.ReadyToPack, new List<OrderStatus> { OrderStatus.Packed, OrderStatus.Cancelled } },
                { OrderStatus.Packed, new List<OrderStatus> { OrderStatus.HandedOverToCarrier, OrderStatus.Cancelled } },
                { OrderStatus.HandedOverToCarrier, new List<OrderStatus> { OrderStatus.Delivered } },
                { OrderStatus.Delivered, new List<OrderStatus> { OrderStatus.Completed } }
            };

            if (!validTransitions.ContainsKey(order.OrderStatus) ||
                !validTransitions[order.OrderStatus].Contains(request.NewStatus))
            {
                return Result<Unit>.Failure(
                    $"Invalid status transition from {order.OrderStatus} to {request.NewStatus}", 400);
            }

            order.OrderStatus = request.NewStatus;
            order.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync(cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
