using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtStep.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_User_Carts_UserId",
                table: "User");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_User_CartId",
                table: "Carts",
                column: "CartId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Carts_User_CartId",
                table: "Carts");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Carts_UserId",
                table: "User",
                column: "UserId",
                principalTable: "Carts",
                principalColumn: "CartId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
