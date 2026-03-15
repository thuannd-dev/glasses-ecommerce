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
        public required PaymentInformationDto Model { get; set; }
    }

    internal sealed class Handler(
        AppDbContext context,
        IUserAccessor userAccessor,
        IVnPayService vnPayService,
        IHttpContextAccessor httpContextAccessor) : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken ct)
        {
            if (request.Model.Amount <= 0)
                return Result<string>.Failure("Amount must be greater than zero.", 400);

            if (string.IsNullOrWhiteSpace(request.Model.OrderType))
                return Result<string>.Failure("Order type is required.", 400);

            if (string.IsNullOrWhiteSpace(request.Model.Name))
                return Result<string>.Failure("Name is required.", 400);

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

            string txnRef = request.Model.OrderId.ToString();
            
            request.Model.VnPayTxnRef = txnRef;

            HttpContext httpContext = httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException("HttpContext is not available.");

            string ipAddress = httpContext.Connection.RemoteIpAddress?.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6 
                ? httpContext.Connection.RemoteIpAddress.MapToIPv4().ToString() 
                : httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

            string paymentUrl = vnPayService.CreatePaymentUrl(request.Model, ipAddress);

            return Result<string>.Success(paymentUrl);
        }
    }
}
