using Application.Core;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class UpdateOrderCommand
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid OrderId { get; set; }
        public List<UpdateOrderItem>? OrderItems { get; set; }
        public UpdatePrescription? Prescription { get; set; }
    }

    public sealed class UpdateOrderItem
    {
        public required Guid OrderItemId { get; set; }
        public required int Quantity { get; set; }
    }

    public sealed class UpdatePrescription
    {
        public required List<UpdatePrescriptionDetail> Details { get; set; }
    }

    public sealed class UpdatePrescriptionDetail
    {
        public EyeType Eye { get; set; }
        public decimal? SPH { get; set; }
        public decimal? CYL { get; set; }
        public int? AXIS { get; set; }
        public decimal? PD { get; set; }
        public decimal? ADD { get; set; }
    }

    public sealed class Handler(AppDbContext context) 
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var order = await context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Prescription)
                    .ThenInclude(p => p!.Details)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
            {
                return Result<Unit>.Failure("Order not found", 404);
            }

            // Only allow editing orders in Pending status
            if (order.OrderStatus != OrderStatus.Pending)
            {
                return Result<Unit>.Failure("Only pending orders can be edited", 400);
            }

            // Update order items quantities if provided
            if (request.OrderItems != null && request.OrderItems.Count > 0)
            {
                foreach (var updateItem in request.OrderItems)
                {
                    var orderItem = order.OrderItems.FirstOrDefault(oi => oi.Id == updateItem.OrderItemId);
                    if (orderItem != null && updateItem.Quantity > 0)
                    {
                        orderItem.Quantity = updateItem.Quantity;
                    }
                }
            }

            // Update prescription if provided
            if (request.Prescription != null && order.Prescription != null)
            {
                // Clear existing details
                order.Prescription.Details.Clear();

                // Add updated details
                foreach (var detail in request.Prescription.Details)
                {
                    order.Prescription.Details.Add(new PrescriptionDetail
                    {
                        PrescriptionId = order.Prescription.Id,
                        Eye = detail.Eye,
                        SPH = detail.SPH,
                        CYL = detail.CYL,
                        AXIS = detail.AXIS,
                        PD = detail.PD,
                        ADD = detail.ADD
                    });
                }

                order.Prescription.UpdatedAt = DateTime.UtcNow;
            }

            order.UpdatedAt = DateTime.UtcNow;

            try
            {
                await context.SaveChangesAsync(cancellationToken);
                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                return Result<Unit>.Failure($"Failed to update order: {ex.Message}", 500);
            }
        }
    }
}
