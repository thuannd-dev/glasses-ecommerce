using System;
using Application.Activities.DTOs;
using Application.Core;
using FluentValidation;

namespace Application.Activities.Validators;

public class BaseActivityValidator<T, TDto> : AbstractValidator<T> where TDto
    : BaseActivityDto
{
    //BaseActivityValidator is a constructor that takes a selector function as a parameter
    //Func<T, TDto> means that it takes an instance of T and returns an instance of TDto
    public BaseActivityValidator(Func<T, TDto> selector)
    {
        //x represents for T - the command
        RuleFor(x => selector(x).Title)
            .NotEmpty().WithMessage("Tittle is required")
            .MaximumLength(100).WithMessage("Tittle must not exceed 100 characters");
        RuleFor(x => selector(x).Description)
            .NotEmpty().WithMessage("Description is required");
        RuleFor(x => selector(x).Date)
            .GreaterThan(_ => TimezoneHelper.GetVietnamNow()).WithMessage("Date must be in the future");
        //Don't use directly DateTime.Now because the value will calculated just once when the validator is created
        //Above code is a solution to make sure that the current time is calculated each time the validation is performed
        //The best practice is create a interface IDateTimeProvider and implement it in a class DateTimeProvider to provide current date time
        RuleFor(x => selector(x).Category)
            .NotEmpty().WithMessage("Category is required");
        RuleFor(x => selector(x).City)
            .NotEmpty().WithMessage("City is required");
        RuleFor(x => selector(x).Venue)
            .NotEmpty().WithMessage("Venue is required");
        RuleFor(x => selector(x).Latitude)
            .NotEmpty().WithMessage("Latitude is required")
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90");
        RuleFor(x => selector(x).Longitude)
            .NotEmpty().WithMessage("Longitude is required")
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180");
    }
}
