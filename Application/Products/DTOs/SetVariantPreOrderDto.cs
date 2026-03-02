namespace Application.Products.DTOs;

//Dto để set trạng thái IsPreOrder cho một ProductVariant
public sealed class SetVariantPreOrderDto
{
    public required bool IsPreOrder { get; set; }
}
