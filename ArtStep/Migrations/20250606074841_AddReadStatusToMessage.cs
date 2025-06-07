using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtStep.Migrations
{
    /// <inheritdoc />
    public partial class AddReadStatusToMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "Message",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadTime",
                table: "Message",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "Message");

            migrationBuilder.DropColumn(
                name: "ReadTime",
                table: "Message");
        }
    }
}
