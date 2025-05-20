namespace ArtStep.Data
{
    public class User
    {
        public string? UserId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        
        public string? ImageProfile { get; set; }
        public virtual Account? Account { get; set; }

        public virtual Cart? Cart { get; set; }
        public virtual ICollection<ShoeCustom>? ShoeCustoms { get; set; }

        public virtual ICollection<Order>? Orders { get; set; }


    }

}
