namespace Application.Inventory.DTOs;

//Dto Request để record outbound transaction cho một order
public sealed class RecordOutboundDto
{
    public required Guid OrderId { get; set; }
}
