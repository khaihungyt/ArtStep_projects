using Microsoft.EntityFrameworkCore;
using System;

namespace ArtStep.Data
{
    public class ArtStepDbContext : DbContext
    {
        public ArtStepDbContext(DbContextOptions<ArtStepDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartDetail> CartsDetail { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Message> Message { get; set; }
        public DbSet<Order> Order { get; set; }

        public DbSet<OrderDetail> OrderDetail { get; set; }
        public DbSet<ShoeImage> ShoeImages { get; set; }
        public DbSet<ShoeCustom> ShoeCustom { get; set; }
        public DbSet<User> User { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Account
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(a => a.AccountId);
            });

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);
                entity.HasOne(u => u.Account)
                .WithOne(a => a.User)
                .HasForeignKey<Account>(a => a.UserId);

            });

            // Cart
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(c => c.CartId);
                entity.HasOne(c => c.Users)
                      .WithMany()
                      .HasForeignKey(c => c.UserId)
                      .IsRequired(false);
            });

            // CartDetail
            modelBuilder.Entity<CartDetail>(entity =>
            {
                entity.HasKey(cd => cd.CartDetailID);

                entity.HasOne(cd => cd.Cart)
                      .WithMany(c => c.CartDetails)
                      .HasForeignKey(cd => cd.CartId);

                entity.HasOne(cd => cd.ShoeCustom)
                      .WithMany(cd => cd.CartDetails)
                      .HasForeignKey(cd => cd.ShoeCustomId);
            });

            // Category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.CategoryId);
            });

            // Message
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(m => m.MessageId);

                entity.HasOne(m => m.UserSend)
                      .WithMany()
                      .HasForeignKey(m => m.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.UserReceived)
                      .WithMany()
                      .HasForeignKey(m => m.ReceivedId)
                      .OnDelete(DeleteBehavior.Restrict); ;
                entity.Property(m => m.SendAt).HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(m => m.CartDetail)
                .WithMany(m => m.Message)
                .HasForeignKey(m => m.CartDetailId)
                .IsRequired(false);
            });

            // Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.OrderId);
                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId);
                entity.Property(m => m.CreateAt)
                      .HasColumnType("timestamp")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

            });

            // OrderDetail
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(od => od.OrderDetailId);
                entity.HasOne(od => od.Order)
                      .WithMany(o => o.OrderDetails)
                      .HasForeignKey(od => od.OrderId);

                entity.HasOne(od => od.ShoeCustom)
                      .WithMany(sc => sc.OrderDetails)
                      .HasForeignKey(od => od.ShoeCustomId);
            });

            // ShoeImage
            modelBuilder.Entity<ShoeImage>(entity =>
            {
                entity.HasKey(si => si.ImageId);
                entity.HasOne(si => si.ShoeCustom)
                      .WithMany(sc => sc.Images)
                      .HasForeignKey(si => si.ShoeCustomId);
            });

            // ShoeCustom
            modelBuilder.Entity<ShoeCustom>(entity =>
            {
                entity.HasKey(sc => sc.ShoeId);
                entity.HasOne(sc => sc.Category)
                      .WithMany(c => c.ShoeCustoms)
                      .HasForeignKey(sc => sc.CategoryId);
            });
        }
    }
}

