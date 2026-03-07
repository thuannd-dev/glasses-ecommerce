using Application.Policies.Commands;
using Domain;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Policies.Validators;

public sealed class UpdatePolicyValidator : AbstractValidator<UpdatePolicy.Command>
{
    private readonly AppDbContext _context;

    public UpdatePolicyValidator(AppDbContext context)
    {
        _context = context;

        RuleFor(x => x.Dto).NotNull().WithMessage("Request body is required.");

        When(x => x.Dto != null, () =>
        {
            RuleFor(x => x.Dto.PolicyName)
                .NotEmpty().WithMessage("Policy name is required.")
                .MaximumLength(255).WithMessage("Policy name must not exceed 255 characters.");

            RuleFor(x => x.Dto.ReturnWindowDays)
                .InclusiveBetween(0, 365).WithMessage("Return window must be between 0 and 365 days.")
                .When(x => x.Dto.ReturnWindowDays.HasValue);

            RuleFor(x => x.Dto.WarrantyMonths)
                .InclusiveBetween(0, 120).WithMessage("Warranty months must be between 0 and 120.")
                .When(x => x.Dto.WarrantyMonths.HasValue);

            RuleFor(x => x).CustomAsync(async (command, validationContext, ct) => 
            {
                if (command.Dto == null) return;
                PolicyConfiguration? policy = await _context.PolicyConfigurations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == command.Id, ct);
                
                if (policy == null) return;

                if (policy.PolicyType == PolicyType.Return && !command.Dto.ReturnWindowDays.HasValue)
                {
                    validationContext.AddFailure("Dto.ReturnWindowDays", "ReturnWindowDays is required for Return policies.");
                }
                if (policy.PolicyType != PolicyType.Return && command.Dto.ReturnWindowDays.HasValue)
                {
                    validationContext.AddFailure("Dto.ReturnWindowDays", "ReturnWindowDays must be null for non-Return policies.");
                }

                if (policy.PolicyType == PolicyType.Warranty && !command.Dto.WarrantyMonths.HasValue)
                {
                    validationContext.AddFailure("Dto.WarrantyMonths", "WarrantyMonths is required for Warranty policies.");
                }
                if (policy.PolicyType != PolicyType.Warranty && command.Dto.WarrantyMonths.HasValue)
                {
                    validationContext.AddFailure("Dto.WarrantyMonths", "WarrantyMonths must be null for non-Warranty policies.");
                }
            });

            RuleFor(x => x.Dto.MinOrderAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum order amount must be non-negative.")
                .When(x => x.Dto.MinOrderAmount.HasValue);

            RuleFor(x => x.Dto.EffectiveFrom)
                .NotEmpty().WithMessage("Effective from date is required.");
                
            RuleFor(x => x.Dto.EffectiveTo)
                .GreaterThan(x => x.Dto.EffectiveFrom).WithMessage("EffectiveTo must be greater than EffectiveFrom.")
                .When(x => x.Dto.EffectiveTo.HasValue);
        });
    }
}
