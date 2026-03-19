using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Application.Payments.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Infrastructure.Payments;

internal sealed class VnPayLibrary
{
    private readonly SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());
    private readonly SortedList<string, string> _responseData = new SortedList<string, string>(new VnPayCompare());

    public static PaymentResponseDto GetFullResponseData(IQueryCollection collection, string hashSecret)
    {
        VnPayLibrary vnPay = new VnPayLibrary();

        foreach ((string key, StringValues value) in collection)
        {
            if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
            {
                vnPay.AddResponseData(key, value);
            }
        }

        string orderId = vnPay.GetResponseData("vnp_TxnRef");
        string vnPayTranId = vnPay.GetResponseData("vnp_TransactionNo");
        string vnpResponseCode = vnPay.GetResponseData("vnp_ResponseCode");
        string vnpTransactionStatus = vnPay.GetResponseData("vnp_TransactionStatus");
        string vnpSecureHash = collection.TryGetValue("vnp_SecureHash", out StringValues secureHashValues)
            ? secureHashValues.ToString()
            : string.Empty;
        string orderInfo = vnPay.GetResponseData("vnp_OrderInfo");

        string vnpAmountRaw = vnPay.GetResponseData("vnp_Amount");
        decimal vnpAmount = decimal.TryParse(vnpAmountRaw, out decimal parsedAmount) ? (parsedAmount / 100m) : 0m;

        bool checkSignature = vnPay.ValidateSignature(vnpSecureHash, hashSecret);

        if (!checkSignature)
            return new PaymentResponseDto()
            {
                Success = false,
                VnPayResponseCode = "97"
            };

        return new PaymentResponseDto()
        {
            Success = vnpResponseCode.Equals("00") && vnpTransactionStatus.Equals("00"),
            PaymentMethod = "VnPay",
            OrderDescription = orderInfo,
            OrderId = string.IsNullOrEmpty(orderId) ? null : orderId,
            PaymentId = string.IsNullOrEmpty(vnPayTranId) ? null : vnPayTranId,
            TransactionId = string.IsNullOrEmpty(vnPayTranId) ? null : vnPayTranId,
            Token = vnpSecureHash,
            VnPayResponseCode = vnpResponseCode,
            VnPayTransactionStatus = vnpTransactionStatus,
            Amount = vnpAmount
        };
    }

    public void AddRequestData(string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            _requestData.Add(key, value);
        }
    }

    public void AddResponseData(string key, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            _responseData.Add(key, value);
        }
    }

    public string GetResponseData(string key)
    {
        return _responseData.TryGetValue(key, out string? retValue) ? retValue : string.Empty;
    }

    public string CreateRequestUrl(string baseUrl, string vnpHashSecret)
    {
        StringBuilder data = new StringBuilder();

        foreach ((string key, string value) in _requestData.Where(kv => !string.IsNullOrWhiteSpace(kv.Value)))
        {
            data.Append(WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(value) + "&");
        }

        string querystring = data.ToString();

        baseUrl += "?" + querystring;
        string signData = querystring;
        if (signData.Length > 0)
        {
            signData = signData.Remove(signData.Length - 1, 1);
        }



        string vnpSecureHash = HmacSha512(vnpHashSecret, signData);
        baseUrl += "vnp_SecureHash=" + vnpSecureHash;

        return baseUrl;
    }

    public bool ValidateSignature(string inputHash, string secretKey)
    {
        string rspRaw = GetResponseData();
        string myChecksum = HmacSha512(secretKey, rspRaw);

        if (myChecksum.Length != inputHash.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(myChecksum),
            Encoding.UTF8.GetBytes(inputHash.ToLowerInvariant())
        );
    }

    private string HmacSha512(string key, string inputData)
    {
        StringBuilder hash = new StringBuilder();
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (HMACSHA512 hmac = new HMACSHA512(keyBytes))
        {
            byte[] hashValue = hmac.ComputeHash(inputBytes);
            foreach (byte theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }

        return hash.ToString();
    }

    private string GetResponseData()
    {
        StringBuilder data = new StringBuilder();

        foreach ((string key, string value) in _responseData.Where(kv =>
                     !string.IsNullOrWhiteSpace(kv.Value) &&
                     !string.Equals(kv.Key, "vnp_SecureHashType", StringComparison.Ordinal) &&
                     !string.Equals(kv.Key, "vnp_SecureHash", StringComparison.Ordinal)))
        {
            data.Append(WebUtility.UrlEncode(key) + "=" + WebUtility.UrlEncode(value) + "&");
        }

        //remove last '&'
        if (data.Length > 0)
        {
            data.Remove(data.Length - 1, 1);
        }

        return data.ToString();
    }
}
