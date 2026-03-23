using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class ProcessGHNWebhook
{
    public class Command : IRequest<Result<Unit>>
    {
        public GHNWebhookPayloadDto Payload { get; set; } = new();
    }

    public class Handler(AppDbContext context, IMediator mediator) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.Payload.ClientOrderCode) || !Guid.TryParse(request.Payload.ClientOrderCode, out Guid orderId))
            {
                return Result<Unit>.Failure("Invalid ClientOrderCode in webhook payload.", 400);
            }

            var order = await context.Orders
                .Include(o => o.ShipmentInfo)
                .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

            if (order == null)
                return Result<Unit>.Failure("Order not found.", 404);

            // Xác định trạng thái mới dựa trên GHN status
            OrderStatus? newStatus = request.Payload.Status switch
            {
                "ready_to_pick" or "picking" => null, // Giữ nguyên trạng thái (thường là Processing)
                "delivering" => OrderStatus.Shipped,
                "delivered" => OrderStatus.Delivered,
                "cancel" or "returned" => OrderStatus.Cancelled,
                _ => null
            };

            if (newStatus == null || newStatus == order.OrderStatus)
            {
                // Không có sự thay đổi lớn về trạng thái chính, có thể chỉ lưu ShipmentInfo lịch sử nếu cần thiết
                return Result<Unit>.Success(Unit.Value);
            }

            // Gọi UpdateOrderStatus để áp dụng thay đổi (với đầy đủ logic kho, payment...)
            var updateDto = new UpdateOrderStatusDto
            {
                NewStatus = newStatus.Value,
                Notes = $"GHN Webhook Update: {request.Payload.Status} - {request.Payload.Reason}",
                Shipment = null // Đã có ShipmentInfo rồi, không cần truyền lại
            };

            // Call internal handler (Lưu ý: System UserID để đánh dấu là tự động. Nêú cần, dùng Guid Empty hoặc tạo System User)
            var result = await mediator.Send(new UpdateOrderStatus.Command
            {
                OrderId = order.Id,
                Dto = updateDto
            }, cancellationToken);

            if (!result.IsSuccess)
            {
                // Log failed update
                return Result<Unit>.Failure($"Failed to process webhook status update: {result.Error}", 400);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
