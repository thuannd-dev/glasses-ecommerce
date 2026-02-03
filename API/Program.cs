using API.Middleware;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using Infrastructure.Photos;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

//************************************************************************************************
//****************************** Add services to the container. ****************************
//************************************************************************************************

builder.Services.AddControllers(opt =>
{
    /*
        Create a global authorization policy that require authenticated user
        for all endpoints in the application by default.
        So we don't need to add [Authorize] attribute in each controller.
        If we wan't an endpoint don't require authenticated just add [AllowAnonymous]
    */
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));

});

builder.Services.AddOpenApi();


//SQLite
// builder.Services.AddDbContext<AppDbContext>(opt =>
// {
//     opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
// });

//SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();

/*
    Register various handlers from assembly - [kết quả biên dịch (compile) của project] containing given type - IRequestHandler
    That means you just need specify one handler, and all other handlers which similar derivered 
    will be discovered automatically (just in same project).
*/
builder.Services.AddMediatR(x =>
{
    x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    //RegisterServicesFromAssemblyContaining will register all IRequestHandler in the assembly that contains the specified type.
    //AddOpenBehavior will register a mediator middleware - a open generic type (<,>) - ValidationBehavior as a pipeline behavior 
    // for handling validation for us instead of inject IValidator in each handler.
    //=> So the order of registration will not be affected.
    //But the order registration in AddOpenBehavior is important, it will be the order of pipeline behaviors.
    x.AddOpenBehavior(typeof(ValidationBehavior<,>));
    //Because we don't know type in program class so we use open generic type.
    //It means apply ValidationBehavior for all request in pipeline, regardless of the request and response.

});

builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IPhotoService, PhotoService>();

/*
    Register auto mapper and specify where the assembly - [kết quả biên dịch (compile) của project]
    is to register the mapping profiles with our application.
    So I don't have to specify each mapping profile in this project.
*/
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddTransient<ExceptionMiddleware>();
builder.Services.AddTransient<DisableRouteMiddleware>();
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
}).AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("IsActivityHost", policy =>
    {
        policy.Requirements.Add(new IsHostRequirement());
    });
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

var app = builder.Build();




//************************************************************************************************
//****************************** Configure the HTTP request pipeline. ****************************
//************************************************************************************************
app.UseMiddleware<ExceptionMiddleware>();

/*
    Adds a CORS middleware to your web application pipeline to allow cross domain requests.
*/
app.UseCors(options => options.AllowAnyHeader()
                                .AllowAnyMethod().AllowCredentials()
                                .WithOrigins("http://localhost:3000", "https://localhost:3000"));

app.UseAuthentication();
app.UseAuthorization();          

//configure to serve static files (wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseMiddleware<DisableRouteMiddleware>();

/*
* MapControllers middleware provide the routing for application.
* It maps - pass the incoming HTTP requests to the appropriate- phù hợp controller actions.
* This is essential for the API to function correctly, allowing it to respond
* to requests with the defined routes in the controllers.
*/
app.MapControllers();


//Routing (apply /api prefix) - Ex : api/login
app.MapGroup("api").MapIdentityApi<User>();

app.MapOpenApi(); 

app.MapScalarApiReference("/api/docs", options =>
{
    options
        .WithTitle("Glasses API")
        .WithTheme(ScalarTheme.Laserwave)
        .WithDefaultHttpClient(
            ScalarTarget.JavaScript,
            ScalarClient.Axios
        )
        .ShowOperationId()
        .SortTagsAlphabetically()
        .SortOperationsByMethod()
        .PreserveSchemaPropertyOrder()//SHOULD HAVE
        .ShowSidebar = true;
        
});

app.MapFallbackToController("Index", "Fallback");


/*
    We can't get the service provider from the program class directly, (can't get it from class define it)
    so we use service locator pattern to get the service provider from the app.
*/
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<User>>();
    await context.Database.MigrateAsync(); // Apply any pending migrations to the database.
    await DbInitializer.SeedData(context, userManager); // Seed the database with initial data.
}
catch (Exception ex)
{
    //ILogger param get the service that used ILogger interface.
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration or seeding the database.");
}

app.Run();
