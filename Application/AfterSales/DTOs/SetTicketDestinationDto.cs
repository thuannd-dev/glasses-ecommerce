//Dto Request để set ticket destination
public sealed class SetTicketDestinationDto
{
    public required string Destination { get; set; }
    public string? Notes { get; set; }
}
