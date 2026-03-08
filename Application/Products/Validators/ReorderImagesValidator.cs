using Application.Products.Commands;
using FluentValidation;

namespace Application.Products.Validators;

public sealed class ReorderImagesValidator : AbstractValidator<ReorderProductImages.Command>
{
    public ReorderImagesValidator()
    {
        RuleFor(x => x.Dto)
            .NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.ImageIds)
                .NotEmpty().WithMessage("Image IDs list must not be empty.");

            RuleFor(x => x.Dto.ImageIds)
                .Must(ids => ids.Distinct().Count() == ids.Count)
                .WithMessage("Image IDs must not contain duplicates.")
                .When(x => x.Dto.ImageIds != null && x.Dto.ImageIds.Count > 0);
        });
    }
}
