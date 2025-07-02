using Microsoft.EntityFrameworkCore;

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
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<WalletTransaction> WalletTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Account
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(a => a.AccountId);
                entity.Property(a => a.AccountId).HasMaxLength(255);
                entity.Property(a => a.UserId).HasMaxLength(255);
            });

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.UserId).HasMaxLength(255);

                entity.HasOne(u => u.Account)
                      .WithOne(a => a.User)
                      .HasForeignKey<Account>(a => a.UserId);
            });

            // Cart
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(c => c.CartId);
                entity.Property(c => c.CartId).HasMaxLength(255);
                entity.Property(c => c.UserId).HasMaxLength(255);

                entity.HasOne(c => c.Users)
                      .WithOne(u => u.Cart)
                      .HasForeignKey<Cart>(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // CartDetail
            modelBuilder.Entity<CartDetail>(entity =>
            {
                entity.HasKey(cd => cd.CartDetailID);
                entity.Property(cd => cd.CartDetailID).HasMaxLength(255);
                entity.Property(cd => cd.CartId).HasMaxLength(255);
                entity.Property(cd => cd.ShoeCustomId).HasMaxLength(255);

                entity.HasOne(cd => cd.Cart)
                      .WithMany(c => c.CartDetails)
                      .HasForeignKey(cd => cd.CartId);

                entity.HasOne(cd => cd.ShoeCustom)
                      .WithMany(sc => sc.CartDetails)
                      .HasForeignKey(cd => cd.ShoeCustomId);
            });

            // Category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.CategoryId);
                entity.Property(c => c.CategoryId).HasMaxLength(255);
            });

            // Message
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(m => m.MessageId);
                entity.Property(m => m.MessageId).HasMaxLength(255);
                entity.Property(m => m.SenderId).HasMaxLength(255);
                entity.Property(m => m.ReceivedId).HasMaxLength(255);

                entity.HasOne(m => m.UserSend)
                      .WithMany()
                      .HasForeignKey(m => m.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.UserReceived)
                      .WithMany()
                      .HasForeignKey(m => m.ReceivedId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(m => m.SendAt)
                      .HasColumnType("datetime")
                      .HasDefaultValueSql("GETDATE()");
            });

            // Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.OrderId);
                entity.Property(o => o.OrderId).HasMaxLength(255);
                entity.Property(o => o.UserId).HasMaxLength(255);

                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId);

                entity.Property(o => o.CreateAt)
                      .HasColumnType("datetime")
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(o => o.VNPayPaymentId)
                      .HasColumnType("bigint");
            });

            // OrderDetail
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(od => od.OrderDetailId);
                entity.Property(od => od.OrderDetailId).HasMaxLength(255);
                entity.Property(od => od.OrderId).HasMaxLength(255);
                entity.Property(od => od.ShoeCustomId).HasMaxLength(255);

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
                entity.Property(si => si.ImageId).HasMaxLength(255);
                entity.Property(si => si.ShoeCustomId).HasMaxLength(255);

                entity.HasOne(si => si.ShoeCustom)
                      .WithMany(sc => sc.Images)
                      .HasForeignKey(si => si.ShoeCustomId);
            });

            // ShoeCustom
            modelBuilder.Entity<ShoeCustom>(entity =>
            {
                entity.HasKey(sc => sc.ShoeId);
                entity.Property(sc => sc.ShoeId).HasMaxLength(255);
                entity.Property(sc => sc.CategoryId).HasMaxLength(255);

                entity.HasOne(sc => sc.Category)
                      .WithMany(c => c.ShoeCustoms)
                      .HasForeignKey(sc => sc.CategoryId);
            });

            // Feedback
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasKey(fb => fb.FeedbackId);
                entity.ToTable("feedback");

                entity.Property(fb => fb.FeedbackId).HasMaxLength(255);
                entity.Property(fb => fb.UserSendFeedbackId).HasMaxLength(255);
                entity.Property(fb => fb.DesignerReceiveFeedbackId).HasMaxLength(255);
                entity.Property(fb => fb.OrderId).HasMaxLength(255);

                entity.HasOne(fb => fb.UserSend)
                      .WithMany(u => u.SentFeedbacks)
                      .HasForeignKey(fb => fb.UserSendFeedbackId);

                entity.HasOne(fb => fb.DesignersReceived)
                      .WithMany(u => u.ReceivedFeedbacks)
                      .HasForeignKey(fb => fb.DesignerReceiveFeedbackId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(fb => fb.Order)
                      .WithMany(o => o.Feedbacks)
                      .HasForeignKey(fb => fb.OrderId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Wallet
            modelBuilder.Entity<Wallet>(entity =>
            {
                entity.HasKey(w => w.WalletId);
                entity.Property(w => w.WalletId).HasMaxLength(255);
                entity.Property(w => w.UserId).HasMaxLength(255);

                entity.HasOne(w => w.User)
                      .WithOne(u => u.Wallet)
                      .HasForeignKey<Wallet>(w => w.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.Property(w => w.Balance)
                      .HasColumnType("float")
                      .HasDefaultValue(0);

                entity.Property(w => w.CreatedAt)
                      .HasColumnType("datetime")
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(w => w.UpdatedAt)
                      .HasColumnType("datetime")
                      .HasDefaultValueSql("GETDATE()");
            });

            // WalletTransaction
            modelBuilder.Entity<WalletTransaction>(entity =>
            {
                entity.HasKey(wt => wt.TransactionId);
                entity.Property(wt => wt.TransactionId).HasMaxLength(255);
                entity.Property(wt => wt.WalletId).HasMaxLength(255);
                entity.Property(wt => wt.OrderId).HasMaxLength(255);

                entity.HasOne(wt => wt.Wallet)
                      .WithMany(w => w.WalletTransactions)
                      .HasForeignKey(wt => wt.WalletId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(wt => wt.Order)
                      .WithMany(o => o.WalletTransactions)
                      .HasForeignKey(wt => wt.OrderId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.Property(wt => wt.Amount).HasColumnType("float");
                entity.Property(wt => wt.BalanceBefore).HasColumnType("float");
                entity.Property(wt => wt.BalanceAfter).HasColumnType("float");

                entity.Property(wt => wt.CreatedAt)
                      .HasColumnType("datetime")
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(wt => wt.CompletedAt)
                      .HasColumnType("datetime");
            });
        }
    }
}
