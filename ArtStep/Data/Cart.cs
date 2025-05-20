namespace ArtStep.Data
{
    public class Cart
    {
        public string? CartId {  get; set; }
        
        public virtual ICollection<User>? Users { get; set; }

        public virtual ICollection<CartDetail>? CartDetails { get; set; }
    }
}
