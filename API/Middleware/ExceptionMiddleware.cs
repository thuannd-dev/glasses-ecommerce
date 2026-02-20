using System;
using System.Text.Json;
using Application.Core;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware;

//By IHostEnvironment we can find out if we are in Development or Production environment etc..
public class ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationException(context, ex);
        }
        catch (Exception ex)
        {
            await HandleException(context, ex);
        }
    }

    private async Task HandleException(HttpContext context, Exception ex)
    {
        //message template syntax (structured logging), not string interpolation.
        //This way helps Parse log effectively, Group / query log correctly and reduce allocation & improve performance
        logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var response = env.IsDevelopment()
            ? new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace)
            : new AppException(context.Response.StatusCode, ex.Message, null);

        //HandleException must manually serialize because AppException is a custom class 
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        //using Serialize is enough, no need to use WriteAsJsonAsync
        //Because SerializeAsync uses when work with files or streaming big Json data
        var json = JsonSerializer.Serialize(response, options);

        await context.Response.WriteAsync(json);
    }

    private static async Task HandleValidationException(HttpContext context, ValidationException ex)
    {
        //error thrown by FluentValidation in ValidationBehavior (https://github.com/thuannd-dev/Reactivities/pull/2#issuecomment-3640161230)
        var validationErrors = new Dictionary<string, string[]>();
        if (ex.Errors is not null)
        {
            foreach (var error in ex.Errors)
            {
                // Strip internal DTO prefix: "AddCartItemDto.Quantity" → "Quantity"
                var propertyName = error.PropertyName.Contains('.')
                    ? error.PropertyName[(error.PropertyName.LastIndexOf('.') + 1)..]
                    : error.PropertyName;

                if (validationErrors.TryGetValue(propertyName, out var existingErrors))
                {
                    validationErrors[propertyName] = [.. existingErrors, error.ErrorMessage];
                }
                else
                {
                    validationErrors[propertyName] = [error.ErrorMessage];
                }

            }
        }

        context.Response.StatusCode = StatusCodes.Status400BadRequest;

        //ValidationProblemDetails is a built-in class in ASP.NET Core to represent validation errors
        var validationProblemDetails = new ValidationProblemDetails(validationErrors)
        {
            Status = StatusCodes.Status400BadRequest,
            Type = "ValidationFailure",
            Title = "Validation error",
            Detail = "One or more validation errors has occurred",
            // Errors = validationErrors - Redundant because we already pass validationErrors to the constructor
        };

        await context.Response.WriteAsJsonAsync(validationProblemDetails);

    }
}
