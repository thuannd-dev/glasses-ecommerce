using Application.Core;
using Application.Orders.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Orders.Commands;

public sealed class ProcessGHNWebhook
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public GHNWebhookPayloadDto Payload { get; set; } = new();
    }

    internal sealed class Handler(AppDbContext context, IMediator mediator) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (!Guid.TryParse(request.Payload.ClientOrderCode, out Guid orderId))
            {
                // This shouldn't normally happen due to FluentValidation, but kept as a hard fail-safe.
                return Result<Unit>.Failure("Invalid ClientOrderCode in webhook payload.", 400);
            }

            Order? order = await context.Orders
                .Include(o => o.ShipmentInfo)
                .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

            if (order == null)
                return Result<Unit>.Failure("Order not found.", 404);

            if (order.ShipmentInfo == null || order.ShipmentInfo.CarrierName != ShippingCarrier.GHN)
                return Result<Unit>.Failure("Order is not currently shipped via GHN.", 400);

            if (order.ShipmentInfo.TrackingCode != request.Payload.OrderCode)
                return Result<Unit>.Failure($"Payload order code '{request.Payload.OrderCode}' does not match stored tracking code.", 409);

            // Xác định trạng thái mới dựa trên GHN status
            string normalizedStatus = request.Payload.Status?.Trim().ToLowerInvariant() ?? "";
            
            OrderStatus? newStatus = normalizedStatus switch
            {
                "ready_to_pick" or "picking" => null, // Chưa lấy hàng (Vẫn Processing)
                "picked" or "storing" or "transporting" or "sorting" or "delivering" => OrderStatus.Shipped, // Đã giao cho GHN (Bắt đầu tính là Shipped)
                "delivered" => OrderStatus.Delivered, // Giao thành công
                "cancel" or "returned" => OrderStatus.Cancelled, // Giao thất bại / Huỷ
                _ => null
            };

            if (newStatus == null || newStatus == order.OrderStatus)
            {
                // Không có sự thay đổi lớn về trạng thái chính, có thể chỉ lưu ShipmentInfo lịch sử nếu cần thiết
                return Result<Unit>.Success(Unit.Value);
            }

            // Gọi UpdateOrderStatus để áp dụng thay đổi (với đầy đủ logic kho, payment...)
            UpdateOrderStatusDto updateDto = new UpdateOrderStatusDto
            {
                NewStatus = newStatus.Value,
                Notes = $"GHN Webhook Update: {request.Payload.Status} - {request.Payload.Reason}",
                Shipment = null // Đã có ShipmentInfo rồi, không cần truyền lại
            };

            // Call internal handler (Lưu ý: System UserID để đánh dấu là tự động. Nêú cần, dùng Guid Empty hoặc tạo System User)
            Result<Unit> result = await mediator.Send(new UpdateOrderStatus.Command
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
