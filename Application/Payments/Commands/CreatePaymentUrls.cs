using Application.Core;
using Application.Interfaces;
using Application.Payments.DTOs;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Payments.Commands;

public sealed class CreatePaymentUrls
{
    public sealed class Command : IRequest<Result<string>>
    {
        public required PaymentInformationModel Model { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor,
        IVnPayService vnPayService,
        IHttpContextAccessor httpContextAccessor) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken ct)
        {
            Guid userId = userAccessor.GetUserId();

            bool orderExists = await context.Orders
                .AnyAsync(o => o.Id == request.Model.OrderId && o.UserId == userId, ct);

            if (!orderExists)
                return Result<string>.Failure("Order not found.", 404);

            Payment? payment = await context.Payments
                .FirstOrDefaultAsync(p =>
                    p.OrderId == request.Model.OrderId &&
                    p.PaymentMethod == PaymentMethod.BankTransfer &&
                    p.PaymentStatus == PaymentStatus.Pending, ct);

            if (payment is null)
                return Result<string>.Failure("No pending BankTransfer payment found for this order.", 404);

            string txnRef = DateTime.Now.Ticks.ToString();
            payment.TransactionId = txnRef;

            bool saved = await context.SaveChangesAsync(ct) > 0;
            if (!saved)
                return Result<string>.Failure("Failed to reserve payment transaction.", 500);

            request.Model.VnPayTxnRef = txnRef;

            HttpContext httpContext = httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException("HttpContext is not available.");

            string paymentUrl = vnPayService.CreatePaymentUrl(request.Model, httpContext);

            return Result<string>.Success(paymentUrl);
        }
    }
}
