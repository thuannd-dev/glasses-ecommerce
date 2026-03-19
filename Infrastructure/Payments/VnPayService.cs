using System;
using System.Globalization;
using Application.Interfaces;
using Application.Payments.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Infrastructure.Payments;

public sealed class VnPayService(IOptions<VnpaySettings> config) : IVnPayService
{
    public decimal UsdToVndRate => config.Value.UsdToVndRate;
    public string CreatePaymentUrl(PaymentInformationDto model, string ipAddress)
    {
        TimeZoneInfo timeZoneById = GetPaymentTimeZone();
        DateTime timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
        VnPayLibrary pay = new VnPayLibrary();
        string urlCallBack = config.Value.ReturnUrl;

        pay.AddRequestData("vnp_Version", config.Value.Version);
        pay.AddRequestData("vnp_Command", config.Value.Command);
        pay.AddRequestData("vnp_TmnCode", config.Value.TmnCode);
        decimal amountInVnd = model.Amount * UsdToVndRate;
        pay.AddRequestData("vnp_Amount", Math.Round(amountInVnd * 100, 0, MidpointRounding.AwayFromZero).ToString("0", CultureInfo.InvariantCulture));
        pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture));
        pay.AddRequestData("vnp_CurrCode", config.Value.CurrCode);
        pay.AddRequestData("vnp_IpAddr", ipAddress);
        pay.AddRequestData("vnp_Locale", config.Value.Locale);
        pay.AddRequestData("vnp_OrderInfo", $"{model.Name} {model.OrderDescription} {model.Amount.ToString("0", CultureInfo.InvariantCulture)}");
        pay.AddRequestData("vnp_OrderType", "other");
        pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
        //Thêm vnp_NotifyUrl sẽ bị lỗi invalid signature
        pay.AddRequestData("vnp_TxnRef", model.VnPayTxnRef);

        string paymentUrl = pay.CreateRequestUrl(config.Value.BaseUrl, config.Value.HashSecret);

        return paymentUrl;
    }

    public PaymentResponseDto PaymentExecute(IQueryCollection collections)
    {
        return VnPayLibrary.GetFullResponseData(collections, config.Value.HashSecret);
    }

    private TimeZoneInfo GetPaymentTimeZone()
    {
        string? configuredTimeZoneId = config.Value.TimeZoneId;
        string[] timeZoneCandidates = OperatingSystem.IsWindows()
            ? new[] { configuredTimeZoneId, "SE Asia Standard Time", "Asia/Bangkok" }
            : new[] { configuredTimeZoneId, "Asia/Bangkok", "SE Asia Standard Time" };

        foreach (string timeZoneId in timeZoneCandidates.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId!);
            }
            catch (TimeZoneNotFoundException)
            {
            }
            catch (InvalidTimeZoneException)
            {
            }
        }

        return TimeZoneInfo.Local;
    }
}

