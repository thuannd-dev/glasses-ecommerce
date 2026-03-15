using System;
using Application.Payments.DTOs;
using Microsoft.AspNetCore.Http;
namespace Application.Interfaces;

public interface IVnPayService
{
    string CreatePaymentUrl(PaymentInformationDto model, string ipAddress);
    PaymentResponseDto PaymentExecute(IQueryCollection collections);
}