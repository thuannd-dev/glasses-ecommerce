using Application.Core;
using Application.Interfaces;
using Application.Payments.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Payments.Commands;

public sealed class CreatePaymentUrls
{
    public sealed class Command : IRequest<Result<string>>
    {
        public required PaymentInformationModel Model { get; set; }
    }

    internal sealed class Handler(
        IVnPayService vnPayService,
        IHttpContextAccessor httpContextAccessor) : IRequestHandler<Command, Result<string>>
    {
        public Task<Result<string>> Handle(Command request, CancellationToken ct)
        {
            HttpContext httpContext = httpContextAccessor.HttpContext
                ?? throw new InvalidOperationException("HttpContext is not available.");

            string paymentUrl = vnPayService.CreatePaymentUrl(request.Model, httpContext);

            return Task.FromResult(Result<string>.Success(paymentUrl));
        }
    }
}
