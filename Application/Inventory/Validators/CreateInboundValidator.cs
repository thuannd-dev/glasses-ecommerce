using Application.Inventory.Commands;
using Domain;
using FluentValidation;

namespace Application.Inventory.Validators;

public sealed class CreateInboundValidator : AbstractValidator<CreateInbound.Command>
{
    public CreateInboundValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.SourceType)
                .IsInEnum()
                .Must(s => s != SourceType.Unknown)
                .WithMessage("Valid source type is required (Supplier, Return, or Adjustment).");

            RuleFor(x => x.Dto.SourceReference)
                .MaximumLength(100)
                .When(x => x.Dto.SourceReference != null);

            RuleFor(x => x.Dto.Notes)
                .MaximumLength(500)
                .When(x => x.Dto.Notes != null);

            RuleFor(x => x.Dto.Items)
                .NotEmpty().WithMessage("At least one item is required.")
                .Must(items => items != null && items.All(i => i != null && i.ProductVariantId != Guid.Empty))
                .WithMessage("One or more items are null or have invalid (empty) product variant IDs.")
                .Must(items => items != null && items.Where(i => i != null).Select(i => i.ProductVariantId).Distinct().Count() == items.Count(i => i != null))
                .WithMessage("Duplicate product variant IDs are not allowed in the same inbound ticket.");

            RuleForEach(x => x.Dto.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductVariantId)
                    .NotEmpty().WithMessage("Product variant ID is required.");

                item.RuleFor(i => i.Quantity)
                    .GreaterThan(0).WithMessage("Quantity must be greater than 0.");

                item.RuleFor(i => i.Notes)
                    .MaximumLength(400)
                    .When(i => i.Notes != null);
            });
        });
    }
}
