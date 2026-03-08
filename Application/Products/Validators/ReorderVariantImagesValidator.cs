using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class ReorderVariantImagesValidator : AbstractValidator<ReorderVariantImages.Command>
{
    public ReorderVariantImagesValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.ImageIds)
                .NotEmpty().WithMessage("ImageIds list cannot be empty.")
                .Must(list => list != null && list.Count > 0).WithMessage("At least one ImageId is required.")
                .Must(list => list != null && list.Distinct().Count() == list.Count).WithMessage("Duplicate ImageIds are not allowed.");
        });
    }
}
