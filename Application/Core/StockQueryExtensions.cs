using Domain;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Core;

public static class StockQueryExtensions
{
    /// <summary>
    /// Loads <see cref="Stock"/> rows for the given variant IDs using
    /// <c>SELECT … WITH (UPDLOCK)</c> to acquire row-level update locks within
    /// the current transaction and prevent race conditions on concurrent stock mutations.
    /// </summary>
    /// <remarks>
    /// The caller is responsible for ensuring <paramref name="variantIds"/> is non-empty
    /// before calling this method (an empty IN-list is invalid SQL).
    /// </remarks>
    internal static Task<List<Stock>> GetStocksWithLockAsync(
        this AppDbContext context,
        IEnumerable<Guid> variantIds,
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(variantIds);

        List<Guid> ids = variantIds.Distinct().ToList();

        if (ids.Count == 0)
            return Task.FromResult(new List<Stock>());

        string paramList = string.Join(", ", ids.Select((_, i) => $"@p{i}"));
        object[] sqlParams = ids
            .Select((id, i) => (object)new SqlParameter($"@p{i}", id))
            .ToArray();

        return context.Stocks
            .FromSqlRaw(
                $"SELECT * FROM Stocks WITH (UPDLOCK) WHERE ProductVariantId IN ({paramList})",
                sqlParams)
            .ToListAsync(ct);
    }
}
