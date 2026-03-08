using Application.Core;
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

    internal sealed class Handler(AppDbContext context)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            // Atomic update: check status + update in a single SQL statement
            // Prevents race condition with concurrent ApproveInbound
            int affected = await context.InboundRecords
                .Where(ir => ir.Id == request.InboundRecordId &&
                             ir.Status == InboundRecordStatus.PendingApproval)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(ir => ir.Status, InboundRecordStatus.Rejected)
                    .SetProperty(ir => ir.RejectedAt, DateTime.UtcNow)
                    .SetProperty(ir => ir.RejectionReason, request.Dto.RejectionReason), ct);

            if (affected == 0)
            {
                bool exists = await context.InboundRecords
                    .AnyAsync(ir => ir.Id == request.InboundRecordId, ct);
                return exists
                    ? Result<Unit>.Failure("Cannot reject inbound record with current status.", 400)
                    : Result<Unit>.Failure("Inbound record not found.", 404);
            }

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
