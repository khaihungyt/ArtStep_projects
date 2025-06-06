﻿// <auto-generated />
using System;
using ArtStep.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace ArtStep.Migrations
{
    [DbContext(typeof(ArtStepDbContext))]
    partial class ArtStepDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.16")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            MySqlModelBuilderExtensions.AutoIncrementColumns(modelBuilder);

            modelBuilder.Entity("ArtStep.Data.Account", b =>
                {
                    b.Property<string>("AccountId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Password")
                        .HasColumnType("longtext");

                    b.Property<string>("UserId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("UserName")
                        .HasColumnType("longtext");

                    b.Property<short?>("isStatus")
                        .HasColumnType("smallint");

                    b.HasKey("AccountId");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("Accounts");
                });

            modelBuilder.Entity("ArtStep.Data.Cart", b =>
                {
                    b.Property<string>("CartId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("UserId")
                        .HasColumnType("longtext");

                    b.HasKey("CartId");

                    b.ToTable("Carts");
                });

            modelBuilder.Entity("ArtStep.Data.CartDetail", b =>
                {
                    b.Property<string>("CartDetailID")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CartId")
                        .HasColumnType("varchar(255)");

                    b.Property<int?>("QuantityBuy")
                        .HasColumnType("int");

                    b.Property<string>("ShoeCustomId")
                        .HasColumnType("varchar(255)");

                    b.HasKey("CartDetailID");

                    b.HasIndex("CartId");

                    b.HasIndex("ShoeCustomId");

                    b.ToTable("CartsDetail");
                });

            modelBuilder.Entity("ArtStep.Data.Category", b =>
                {
                    b.Property<string>("CategoryId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CategoryName")
                        .HasColumnType("longtext");

                    b.HasKey("CategoryId");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("ArtStep.Data.Feedback", b =>
                {
                    b.Property<string>("FeedbackId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("DesignerReceiveFeedbackId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("FeedbackDescription")
                        .HasColumnType("longtext");

                    b.Property<int?>("FeedbackStars")
                        .HasColumnType("int");

                    b.Property<string>("UserSendFeedbackId")
                        .HasColumnType("longtext");

                    b.HasKey("FeedbackId");

                    b.HasIndex("DesignerReceiveFeedbackId");

                    b.ToTable("Feedback");
                });

            modelBuilder.Entity("ArtStep.Data.Message", b =>
                {
                    b.Property<string>("MessageId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("MessageDescription")
                        .HasColumnType("longtext");

                    b.Property<bool?>("MessageType")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("ReceivedId")
                        .HasColumnType("varchar(255)");

                    b.Property<DateTime?>("SendAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("SenderId")
                        .HasColumnType("varchar(255)");

                    b.HasKey("MessageId");

                    b.HasIndex("ReceivedId");

                    b.HasIndex("SenderId");

                    b.ToTable("Message");
                });

            modelBuilder.Entity("ArtStep.Data.Order", b =>
                {
                    b.Property<string>("OrderId")
                        .HasColumnType("varchar(255)");

                    b.Property<DateTime>("CreateAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("Status")
                        .HasColumnType("longtext");

                    b.Property<string>("UserId")
                        .HasColumnType("varchar(255)");

                    b.HasKey("OrderId");

                    b.HasIndex("UserId");

                    b.ToTable("Order");
                });

            modelBuilder.Entity("ArtStep.Data.OrderDetail", b =>
                {
                    b.Property<string>("OrderDetailId")
                        .HasColumnType("varchar(255)");

                    b.Property<double?>("CostaShoe")
                        .HasColumnType("double");

                    b.Property<string>("OrderId")
                        .HasColumnType("varchar(255)");

                    b.Property<int?>("QuantityBuy")
                        .HasColumnType("int");

                    b.Property<string>("ShoeCustomId")
                        .HasColumnType("varchar(255)");

                    b.HasKey("OrderDetailId");

                    b.HasIndex("OrderId");

                    b.HasIndex("ShoeCustomId");

                    b.ToTable("OrderDetail");
                });

            modelBuilder.Entity("ArtStep.Data.ShoeCustom", b =>
                {
                    b.Property<string>("ShoeId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("CategoryId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("DesignerUserId")
                        .HasColumnType("varchar(255)");

                    b.Property<short?>("IsHidden")
                        .HasColumnType("smallint");

                    b.Property<double?>("PriceAShoe")
                        .HasColumnType("double");

                    b.Property<int?>("Quantity")
                        .HasColumnType("int");

                    b.Property<string>("ShoeDescription")
                        .HasColumnType("longtext");

                    b.Property<string>("ShoeName")
                        .HasColumnType("longtext");

                    b.HasKey("ShoeId");

                    b.HasIndex("CategoryId");

                    b.HasIndex("DesignerUserId");

                    b.ToTable("ShoeCustom");
                });

            modelBuilder.Entity("ArtStep.Data.ShoeImage", b =>
                {
                    b.Property<string>("ImageId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("ImageLink")
                        .HasColumnType("longtext");

                    b.Property<string>("ShoeCustomId")
                        .HasColumnType("varchar(255)");

                    b.HasKey("ImageId");

                    b.HasIndex("ShoeCustomId");

                    b.ToTable("ShoeImages");
                });

            modelBuilder.Entity("ArtStep.Data.User", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("varchar(255)");

                    b.Property<string>("Email")
                        .HasColumnType("longtext");

                    b.Property<string>("ImageProfile")
                        .HasColumnType("longtext");

                    b.Property<string>("Name")
                        .HasColumnType("longtext");

                    b.Property<string>("PhoneNo")
                        .HasColumnType("longtext");

                    b.Property<string>("Role")
                        .HasColumnType("longtext");

                    b.Property<short?>("isActive")
                        .HasColumnType("smallint");

                    b.HasKey("UserId");

                    b.ToTable("User");
                });

            modelBuilder.Entity("ArtStep.Data.Account", b =>
                {
                    b.HasOne("ArtStep.Data.User", "User")
                        .WithOne("Account")
                        .HasForeignKey("ArtStep.Data.Account", "UserId");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ArtStep.Data.CartDetail", b =>
                {
                    b.HasOne("ArtStep.Data.Cart", "Cart")
                        .WithMany("CartDetails")
                        .HasForeignKey("CartId");

                    b.HasOne("ArtStep.Data.ShoeCustom", "ShoeCustom")
                        .WithMany("CartDetails")
                        .HasForeignKey("ShoeCustomId");

                    b.Navigation("Cart");

                    b.Navigation("ShoeCustom");
                });

            modelBuilder.Entity("ArtStep.Data.Feedback", b =>
                {
                    b.HasOne("ArtStep.Data.User", "DesignersReceived")
                        .WithMany("ReceivedFeedbacks")
                        .HasForeignKey("DesignerReceiveFeedbackId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("DesignersReceived");
                });

            modelBuilder.Entity("ArtStep.Data.Message", b =>
                {
                    b.HasOne("ArtStep.Data.User", "UserReceived")
                        .WithMany()
                        .HasForeignKey("ReceivedId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("ArtStep.Data.User", "UserSend")
                        .WithMany()
                        .HasForeignKey("SenderId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("UserReceived");

                    b.Navigation("UserSend");
                });

            modelBuilder.Entity("ArtStep.Data.Order", b =>
                {
                    b.HasOne("ArtStep.Data.User", "User")
                        .WithMany("Orders")
                        .HasForeignKey("UserId");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ArtStep.Data.OrderDetail", b =>
                {
                    b.HasOne("ArtStep.Data.Order", "Order")
                        .WithMany("OrderDetails")
                        .HasForeignKey("OrderId");

                    b.HasOne("ArtStep.Data.ShoeCustom", "ShoeCustom")
                        .WithMany("OrderDetails")
                        .HasForeignKey("ShoeCustomId");

                    b.Navigation("Order");

                    b.Navigation("ShoeCustom");
                });

            modelBuilder.Entity("ArtStep.Data.ShoeCustom", b =>
                {
                    b.HasOne("ArtStep.Data.Category", "Category")
                        .WithMany("ShoeCustoms")
                        .HasForeignKey("CategoryId");

                    b.HasOne("ArtStep.Data.User", "Designer")
                        .WithMany("ShoeCustoms")
                        .HasForeignKey("DesignerUserId");

                    b.Navigation("Category");

                    b.Navigation("Designer");
                });

            modelBuilder.Entity("ArtStep.Data.ShoeImage", b =>
                {
                    b.HasOne("ArtStep.Data.ShoeCustom", "ShoeCustom")
                        .WithMany("Images")
                        .HasForeignKey("ShoeCustomId");

                    b.Navigation("ShoeCustom");
                });

            modelBuilder.Entity("ArtStep.Data.User", b =>
                {
                    b.HasOne("ArtStep.Data.Cart", "Cart")
                        .WithOne("Users")
                        .HasForeignKey("ArtStep.Data.User", "UserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("ArtStep.Data.Feedback", "SentFeedbacks")
                        .WithOne("UserSend")
                        .HasForeignKey("ArtStep.Data.User", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Cart");

                    b.Navigation("SentFeedbacks");
                });

            modelBuilder.Entity("ArtStep.Data.Cart", b =>
                {
                    b.Navigation("CartDetails");

                    b.Navigation("Users");
                });

            modelBuilder.Entity("ArtStep.Data.Category", b =>
                {
                    b.Navigation("ShoeCustoms");
                });

            modelBuilder.Entity("ArtStep.Data.Feedback", b =>
                {
                    b.Navigation("UserSend");
                });

            modelBuilder.Entity("ArtStep.Data.Order", b =>
                {
                    b.Navigation("OrderDetails");
                });

            modelBuilder.Entity("ArtStep.Data.ShoeCustom", b =>
                {
                    b.Navigation("CartDetails");

                    b.Navigation("Images");

                    b.Navigation("OrderDetails");
                });

            modelBuilder.Entity("ArtStep.Data.User", b =>
                {
                    b.Navigation("Account");

                    b.Navigation("Orders");

                    b.Navigation("ReceivedFeedbacks");

                    b.Navigation("ShoeCustoms");
                });
#pragma warning restore 612, 618
        }
    }
}
