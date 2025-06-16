using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArtStep.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderIdToFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {



            migrationBuilder.DropPrimaryKey(
                name: "PK_Feedback",
                table: "Feedback");

            migrationBuilder.RenameTable(
                name: "Feedback",
                newName: "feedback");

            migrationBuilder.RenameIndex(
                name: "IX_Feedback_DesignerReceiveFeedbackId",
                table: "feedback",
                newName: "IX_feedback_DesignerReceiveFeedbackId");

            migrationBuilder.AddColumn<string>(
                name: "OrderId",
                table: "feedback",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddPrimaryKey(
                name: "PK_feedback",
                table: "feedback",
                column: "FeedbackId");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_OrderId",
                table: "feedback",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_feedback_Order_OrderId",
                table: "feedback",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_feedback_User_DesignerReceiveFeedbackId",
                table: "feedback",
                column: "DesignerReceiveFeedbackId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_User_feedback_UserId",
                table: "User",
                column: "UserId",
                principalTable: "feedback",
                principalColumn: "FeedbackId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_feedback_Order_OrderId",
                table: "feedback");




            migrationBuilder.DropPrimaryKey(
                name: "PK_feedback",
                table: "feedback");

            migrationBuilder.DropIndex(
                name: "IX_feedback_OrderId",
                table: "feedback");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "feedback");

            migrationBuilder.RenameTable(
                name: "feedback",
                newName: "Feedback");

            migrationBuilder.RenameIndex(
                name: "IX_feedback_DesignerReceiveFeedbackId",
                table: "Feedback",
                newName: "IX_Feedback_DesignerReceiveFeedbackId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Feedback",
                table: "Feedback",
                column: "FeedbackId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedback_User_DesignerReceiveFeedbackId",
                table: "Feedback",
                column: "DesignerReceiveFeedbackId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Feedback_UserId",
                table: "User",
                column: "UserId",
                principalTable: "Feedback",
                principalColumn: "FeedbackId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
