using Application.Core;
using Application.Interfaces;
using Application.Inventory.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Inventory.Commands;

public sealed class RejectInbound
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required Guid InboundRecordId { get; set; }
        public required RejectInboundDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            Guid managerUserId = userAccessor.GetUserId();

            InboundRecord? record = await context.InboundRecords
                .FirstOrDefaultAsync(ir => ir.Id == request.InboundRecordId, ct);

            if (record == null)
                return Result<Unit>.Failure("Inbound record not found.", 404);

            if (record.Status != InboundRecordStatus.PendingApproval)
                return Result<Unit>.Failure(
                    $"Cannot reject inbound record with status '{record.Status}'.", 400);

            // Không cần self-rejection check (khác với ApproveInbound):
            // Approve = tăng stock → cần separation of duties để tránh gian lận
            // Reject = hủy phiếu → staff tự reject record sai của mình là flow hợp lệ

            record.Status = InboundRecordStatus.Rejected;
            record.RejectedAt = DateTime.UtcNow;
            record.RejectionReason = request.Dto.RejectionReason;

            bool success = await context.SaveChangesAsync(ct) > 0;

            if (!success)
                return Result<Unit>.Failure("Failed to reject inbound record.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
