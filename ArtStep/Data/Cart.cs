namespace ArtStep.Data
{
    public class Cart
    {
        public string? CartId {  get; set; }
        
        public string? UserId { get; set; }
        public virtual User? Users { get; set; }

        public virtual ICollection<CartDetail>? CartDetails { get; set; }
    }
}
