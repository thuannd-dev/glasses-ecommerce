using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain;

public enum EyeType
{
    Unknown = 0,
    Left = 1,
    Right = 2
}

public class PrescriptionDetail
{
    public Guid Id { get; set; } = Guid.CreateVersion7(TimeProvider.System.GetUtcNow());

    public required Guid PrescriptionId { get; set; }

    public EyeType Eye { get; set; } // Left, Right

    public decimal? SPH { get; set; }

    public decimal? CYL { get; set; }

    public int? AXIS { get; set; }
    public decimal? PD { get; set; }
    public decimal? ADD { get; set; }

    // Navigation property
    public Prescription Prescription { get; set; } = null!;

}
