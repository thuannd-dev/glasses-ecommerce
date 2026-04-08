using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class AddLensCoatingOption
{
    public sealed class Command : IRequest<Result<LensCoatingOptionDto>>
    {
        public required Guid LensProductId { get; set; }
        public required AddLensCoatingOptionDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<LensCoatingOptionDto>>
    {
        public async Task<Result<LensCoatingOptionDto>> Handle(Command request, CancellationToken ct)
        {
            AddLensCoatingOptionDto dto = request.Dto;

            // Validate: product tồn tại và là Lens type
            Product? product = await context.Products
                .FirstOrDefaultAsync(p => p.Id == request.LensProductId, ct);

            if (product == null)
                return Result<LensCoatingOptionDto>.Failure("Lens product not found.", 404);

            if (product.Type != ProductType.Lens)
                return Result<LensCoatingOptionDto>.Failure(
                    "Coating options can only be added to Lens products.", 400);

            LensCoatingOption coating = new LensCoatingOption
            {
                LensProductId = request.LensProductId,
                CoatingName   = dto.CoatingName,
                Description   = dto.Description,
                ExtraPrice    = dto.ExtraPrice,
                IsActive      = true,
            };
            context.LensCoatingOptions.Add(coating);

            bool success = await context.SaveChangesAsync(ct) > 0;
            if (!success)
                return Result<LensCoatingOptionDto>.Failure("Failed to add coating option.", 500);

            LensCoatingOptionDto responseDto = new LensCoatingOptionDto
            {
                Id            = coating.Id,
                LensProductId = coating.LensProductId,
                CoatingName   = coating.CoatingName,
                Description   = coating.Description,
                ExtraPrice    = coating.ExtraPrice,
                IsActive      = coating.IsActive,
            };

            return Result<LensCoatingOptionDto>.Success(responseDto);
        }
    }
}
