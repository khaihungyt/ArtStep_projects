using ArtStep.Data;
using ArtStep.Hubs;
using CloudinaryDotNet;
using dotenv.net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Remove reference handler to get clean JSON
        options.JsonSerializerOptions.MaxDepth = 32;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep original property names
    });

// Add SignalR
builder.Services.AddSignalR();

// Set Cloudinary credentials
DotEnv.Load();
var cloudinaryUrl = Environment.GetEnvironmentVariable("CLOUDINARY_URL");
var cloudinary = new Cloudinary(cloudinaryUrl)
{
    Api = { Secure = true }
};
builder.Services.AddSingleton(cloudinary);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("MyDatabase");
builder.Services.AddDbContext<ArtStepDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Convert.FromBase64String(builder.Configuration["Jwt:Key"])
        )
    };

    // Configure JWT for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

//enables cors

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("https://localhost:7216") // 👈 your frontend
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // 👈 only if using cookies or SignalR
    });
});


var app = builder.Build();


// Swagger
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//// Set default starting page
//app.UseDefaultFiles(new DefaultFilesOptions
//{
//    FileProvider = new PhysicalFileProvider(
//        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "html")
//    ),
//    RequestPath = "",
//    DefaultFileNames = new List<string> { "home.html" }
//});

//// Set static files in wwwroot/html
//app.UseStaticFiles(new StaticFileOptions
//{
//    FileProvider = new PhysicalFileProvider(
//        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "html")
//    ),
//    RequestPath = ""
//});

app.UseStaticFiles();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<ChatHub>("/chatHub");

app.Run();
