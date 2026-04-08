using Application.Core;
using Application.Products.DTOs;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Products.Commands;

public sealed class UpdateLensCoatingOption
{
    public sealed class Command : IRequest<Result<LensCoatingOptionDto>>
    {
        public required Guid CoatingId { get; set; }
        public required UpdateLensCoatingOptionDto Dto { get; set; }
    }

    internal sealed class Handler(AppDbContext context) : IRequestHandler<Command, Result<LensCoatingOptionDto>>
    {
        public async Task<Result<LensCoatingOptionDto>> Handle(Command request, CancellationToken ct)
        {
            UpdateLensCoatingOptionDto dto = request.Dto;

            LensCoatingOption? coating = await context.LensCoatingOptions
                .FirstOrDefaultAsync(c => c.Id == request.CoatingId, ct);

            if (coating == null)
                return Result<LensCoatingOptionDto>.Failure("Coating option not found.", 404);

            // Partial update: chỉ update field nào được cung cấp
            if (!string.IsNullOrWhiteSpace(dto.CoatingName))
                coating.CoatingName = dto.CoatingName;

            if (dto.Description != null)
                coating.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description;

            if (dto.ExtraPrice.HasValue)
                coating.ExtraPrice = dto.ExtraPrice.Value;

            if (dto.IsActive.HasValue)
                coating.IsActive = dto.IsActive.Value;

            bool success = await context.SaveChangesAsync(ct) > 0;
            if (!success)
                return Result<LensCoatingOptionDto>.Failure("Failed to update coating option.", 500);

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
