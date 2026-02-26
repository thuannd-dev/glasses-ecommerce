namespace Application.Inventory.DTOs;

//Dto Request để reject phiếu nhập kho
public sealed class RejectInboundDto
{
    public required string RejectionReason { get; set; }
}
