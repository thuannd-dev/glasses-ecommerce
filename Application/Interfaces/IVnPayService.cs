using System;
using Application.Payments.DTOs;
using Microsoft.AspNetCore.Http;
namespace Application.Interfaces;

public interface IVnPayService
{
    string CreatePaymentUrl(PaymentInformationModel model, HttpContext context);
    PaymentResponseModel PaymentExecute(IQueryCollection collections);
}