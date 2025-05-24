using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtStep.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFeedbackRelation1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_User_Carts_UserId",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Feedback_UserId",
                table: "User");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Carts_UserId",
                table: "User",
                column: "UserId",
                principalTable: "Carts",
                principalColumn: "CartId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Feedback_UserId",
                table: "User",
                column: "UserId",
                principalTable: "Feedback",
                principalColumn: "FeedbackId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_User_Carts_UserId",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Feedback_UserId",
                table: "User");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Carts_UserId",
                table: "User",
                column: "UserId",
                principalTable: "Carts",
                principalColumn: "CartId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Feedback_UserId",
                table: "User",
                column: "UserId",
                principalTable: "Feedback",
                principalColumn: "FeedbackId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
