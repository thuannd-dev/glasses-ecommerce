using System.Net;
using System.Net.Sockets;
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
            Guid userId = userAccessor.GetUserId();

            Order? order = await context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == request.Model.OrderId && o.UserId == userId, ct);

            if (order is null)
                return Result<string>.Failure("Order not found.", 404);

            Payment? payment = await context.Payments
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.OrderId == request.Model.OrderId &&
                    p.PaymentMethod == PaymentMethod.BankTransfer &&
                    p.PaymentStatus == PaymentStatus.Pending, ct);

            if (payment is null)
                return Result<string>.Failure("No pending BankTransfer payment found for this order.", 404);

            request.Model.Amount = payment.Amount;
            request.Model.OrderType = order.OrderType.ToString();
            request.Model.Name = order.WalkInCustomerName ?? order.User?.DisplayName ?? "Customer";
            request.Model.VnPayTxnRef = order.Id.ToString("N") + "_" + DateTime.UtcNow.Ticks.ToString();

            // vnp_OrderInfo is restricted from having special characters (including hyphens)
            request.Model.OrderDescription = $"Payment for order {order.Id.ToString("N")}";

            HttpContext httpContext = httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException("HttpContext is not available.");

            IPAddress? remoteIpAddress = httpContext.Connection.RemoteIpAddress;
            if (remoteIpAddress is null)
                return Result<string>.Failure("Client IP address is not available.", 400);

            string ipAddress = remoteIpAddress.AddressFamily == AddressFamily.InterNetworkV6
                ? remoteIpAddress.MapToIPv4().ToString()
                : remoteIpAddress.ToString();

            if (ipAddress == "0.0.0.0" || string.IsNullOrEmpty(ipAddress))
                ipAddress = "127.0.0.1";

            string paymentUrl = vnPayService.CreatePaymentUrl(request.Model, ipAddress);

            return Result<string>.Success(paymentUrl);
        }
    }
}
