using System.Text;
using API;
using API.Data;
using API.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddAplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);


var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
    .WithOrigins("http://localhost:4200", "https://localhost:4200"));


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    await context.Database.MigrateAsync();
    await Seed.SeedUsers(context);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occured during migration");
}

// app.Use(async (context, next) =>
// {
    
//     // Log method, path, and query string
//     Console.WriteLine($"HTTP {context.Request.Method} {context.Request.Path}{context.Request.QueryString}");

//     // Log headers
//     foreach (var header in context.Request.Headers)
//     {
//         Console.WriteLine($"Header: {header.Key} = {header.Value}");
//     }

//     // Log cookies (optional)
//     foreach (var cookie in context.Request.Cookies)
//     {
//         Console.WriteLine($"Cookie: {cookie.Key} = {cookie.Value}");
//     }


//     context.Request.EnableBuffering();

//     using var reader = new StreamReader(
//         context.Request.Body,
//         encoding: Encoding.UTF8,
//         detectEncodingFromByteOrderMarks: false,
//         leaveOpen: true
//     );

//     string body = await reader.ReadToEndAsync();

//     context.Request.Body.Position = 0;


//     Console.WriteLine($"HTTP BODY REQUEST: \n\n{body}\n\n");

//     // using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
//     // string body = await reader.ReadToEndAsync();

//     // context.Request.Body.Position = 0; // Reset so MVC can read it later

//     // // ⛔ Breakpoint here — body is now visible in debugger
//     await next();
// });
app.Run();
