using Application.Core;
using Application.Payments.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Payments.Commands;

public sealed class HandleVnPayIpn
{
    public sealed class Command : IRequest<Result<Unit>>
    {
        public required PaymentResponseDto Response { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            PaymentResponseDto response = request.Response;

            if (!Guid.TryParse(response.OrderId, out Guid orderId))
                return Result<Unit>.Failure("Invalid transaction reference format in IPN.", 400);

            Payment? payment = await context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p =>
                    p.OrderId == orderId &&
                    p.PaymentMethod == PaymentMethod.BankTransfer &&
                    p.PaymentStatus == PaymentStatus.Pending, ct);

            if (payment is null)
                return Result<Unit>.Failure("Payment record not found or already processed.", 409);

            if (response.Success)
            {
                payment.PaymentStatus = PaymentStatus.Completed;
                payment.TransactionId = response.TransactionId; // real VnPay transaction ID
                payment.PaymentAt = DateTime.UtcNow;
            }
            else
            {
                payment.PaymentStatus = PaymentStatus.Failed;
            }

            bool saved = await context.SaveChangesAsync(ct) > 0;
            if (!saved)
                return Result<Unit>.Failure("Failed to update payment status.", 500);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
