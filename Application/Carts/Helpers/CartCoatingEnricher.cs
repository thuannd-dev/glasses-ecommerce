using System.Text.Json;
using Application.Carts.DTOs;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Carts.Helpers;

/// <summary>
/// Helper để enrich CartItemDto.SelectedCoatings từ DB sau khi AutoMapper project.
/// Dùng chung cho GetCart và AddItemToCart handlers.
/// </summary>
internal static class CartCoatingEnricher
{
    /// <summary>
    /// Với mỗi CartItemDto có SelectedCoatingIds, query DB một lần duy nhất
    /// (single batched query) rồi điền SelectedCoatings.
    /// </summary>
    public static async Task EnrichAsync(
        IEnumerable<CartItemDto> items,
        AppDbContext context,
        CancellationToken cancellationToken)
    {
        // ── 1. Build item → coating-id-list map ───────────────────────────────
        Dictionary<CartItemDto, List<Guid>> itemCoatingMap = [];

        foreach (CartItemDto item in items)
            itemCoatingMap[item] = [];

        if (itemCoatingMap.Count == 0) return;

        // ── 2. Load SelectedCoatingIdsJson for each cart item in one go ───────
        List<Guid> cartItemIds = itemCoatingMap.Keys.Select(i => i.Id).ToList();

        Dictionary<Guid, string?> jsonByItemId = await context.CartItems
            .AsNoTracking()
            .Where(ci => cartItemIds.Contains(ci.Id) && ci.SelectedCoatingIdsJson != null)
            .Select(ci => new { ci.Id, ci.SelectedCoatingIdsJson })
            .ToDictionaryAsync(x => x.Id, x => x.SelectedCoatingIdsJson, cancellationToken);

        // ── 3. Parse JSON and collect unique coating IDs ──────────────────────
        HashSet<Guid> allCoatingIds = [];

        foreach (CartItemDto item in itemCoatingMap.Keys)
        {
            if (jsonByItemId.TryGetValue(item.Id, out string? json) && !string.IsNullOrEmpty(json))
            {
                List<Guid>? ids = JsonSerializer.Deserialize<List<Guid>>(json);
                if (ids is { Count: > 0 })
                {
                    itemCoatingMap[item] = ids;
                    allCoatingIds.UnionWith(ids);
                }
            }
        }

        if (allCoatingIds.Count == 0) return;

        // ── 4. Single batched DB query for all unique coatings ────────────────
        Dictionary<Guid, CartItemCoatingDto> coatingLookup = await context.LensCoatingOptions
            .AsNoTracking()
            .Where(c => allCoatingIds.Contains(c.Id))
            .Select(c => new CartItemCoatingDto
            {
                Id          = c.Id,
                CoatingName = c.CoatingName,
                Description = c.Description,
                ExtraPrice  = c.ExtraPrice,
            })
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        // ── 5. Fill each CartItemDto.SelectedCoatings ─────────────────────────
        foreach ((CartItemDto item, List<Guid> ids) in itemCoatingMap)
        {
            item.SelectedCoatings = ids
                .Where(id => coatingLookup.ContainsKey(id))
                .Select(id => coatingLookup[id])
                .ToList();
        }
    }
}
