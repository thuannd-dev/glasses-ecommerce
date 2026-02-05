namespace Application.Products.DTOs;

//Generic pagination wrapper
public sealed class PagedResult<T>
{
    public required IReadOnlyList<T> Items { get; set; }
    public required int TotalCount { get; set; }
    public required int PageNumber { get; set; }
    public required int PageSize { get; set; }
    public int TotalPages => PageSize > 0 
        ? (int)Math.Ceiling(TotalCount / (double)PageSize) 
        : 0;
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
