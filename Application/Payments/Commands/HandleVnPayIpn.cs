using Application.Core;
using Application.Interfaces;
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

    internal sealed class Handler(AppDbContext context, IVnPayService vnPayService) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            PaymentResponseDto response = request.Response;

            string txnRef = response.OrderId ?? string.Empty;
            string actualOrderIdStr = txnRef.Contains('_') ? txnRef.Split('_')[0] : txnRef;

            if (!Guid.TryParse(actualOrderIdStr, out Guid orderId))
                return Result<Unit>.Failure("Invalid transaction reference format in IPN.", 404);

            Payment? payment = await context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p =>
                    p.OrderId == orderId &&
                    p.PaymentMethod == PaymentMethod.BankTransfer, ct);

            if (payment is null)
                return Result<Unit>.Failure("Payment record not found.", 404);

            if (payment.PaymentStatus != PaymentStatus.Pending)
                return Result<Unit>.Failure("Payment already processed.", 409);

            // payment.Amount là USD, response.Amount từ VNPay là VNĐ (vnp_Amount / 100)
            // Cần quy đổi sang VNĐ để so sánh, dùng cùng cách làm tròn như khi gửi đi
            decimal usdToVndRate = vnPayService.UsdToVndRate;
            decimal expectedAmountVnd = Math.Round(payment.Amount * usdToVndRate * 100, 0, MidpointRounding.AwayFromZero) / 100m;
            if (response.Amount != expectedAmountVnd)
                return Result<Unit>.Failure("Invalid payment amount.", 400);

            if (response.Success)
            {
                if (string.IsNullOrWhiteSpace(response.TransactionId))
                    return Result<Unit>.Failure("Missing VNPay transaction ID.", 400);
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
