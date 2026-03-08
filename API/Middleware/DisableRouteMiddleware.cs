using System;

namespace API.Middleware;

public class DisableRouteMiddleware() : IMiddleware
{
    // Routes are stored in lowercase; the request path is normalized with ToLowerInvariant
    // so that matching is effectively case-insensitive.
    private readonly HashSet<string> HiddenRoutes =
    [
        "/api/register",
        "/api/manage/info",
        "/api/refresh",
        "/api/confirmEmail",
        "/api/resendconfirmationemail",
        "/api/forgotPassword",
        "/api/resetPassword",
    ];

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant().TrimEnd('/');

        if (!string.IsNullOrEmpty(path) && HiddenRoutes.Contains(path))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Not Found",
                message = "The requested resource was not found"
            });
            return;
        }

        await next(context);
    }

}
