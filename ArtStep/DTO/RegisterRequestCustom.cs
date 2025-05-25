namespace ArtStep.DTO
{
    public class RegisterRequestCustom
    {
            public string UserName { get; set; } = null!;
            public string Password { get; set; } = null!;
            public string? Name { get; set; }
            public string? Email { get; set; }
            public string? Role { get; set; } 
            public string? ImageProfile { get; set; }
    }
}
