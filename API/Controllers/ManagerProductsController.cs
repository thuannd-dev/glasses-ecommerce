using Application.Core;
using Application.Products.Commands;
using Application.Products.DTOs;
using Application.Products.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Manager")]
[Route("api/manager/products")]
public sealed class ManagerProductsController : BaseApiController
{
    // ────────────────────────── PRODUCT ──────────────────────────

    /// <summary>
    /// Tạo Product mới. Mặc định Status = Draft — publish bằng cách PUT với Status = Active.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateProduct(CreateProductDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(new CreateProduct.Command { Dto = dto }, ct));
    }

    /// <summary>
    /// Cập nhật thông tin Product (partial update). Type không thể thay đổi.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateProduct.Command { ProductId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Deactivate Product (soft delete). Thất bại nếu còn variant có đơn hàng đang active.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new DeleteProduct.Command { ProductId = id }, ct));
    }

    // ────────────────────────── VARIANTS ──────────────────────────

    /// <summary>
    /// Thêm Variant mới vào Product. SKU phải unique toàn hệ thống.
    /// </summary>
    [HttpPost("{id}/variants")]
    public async Task<ActionResult<Guid>> AddVariant(Guid id, CreateVariantDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new AddVariant.Command { ProductId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Cập nhật Variant (partial update). Có thể dùng để toggle IsActive.
    /// </summary>
    [HttpPut("{id}/variants/{variantId}")]
    public async Task<IActionResult> UpdateVariant(Guid id, Guid variantId, UpdateVariantDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateVariant.Command { ProductId = id, VariantId = variantId, Dto = dto }, ct));
    }

    /// <summary>
    /// Deactivate Variant (soft delete). Thất bại nếu variant có đơn hàng đang active.
    /// </summary>
    [HttpDelete("{id}/variants/{variantId}")]
    public async Task<IActionResult> DeleteVariant(Guid id, Guid variantId, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new DeleteVariant.Command { ProductId = id, VariantId = variantId }, ct));
    }

    /// <summary>
    /// Bật/tắt chế độ PreOrder của Variant.
    /// IsPreOrder = true: khách có thể add vào giỏ hàng và checkout dù kho không đủ → OrderType = PreOrder.
    /// IsPreOrder = false: kiểm tra tồn kho bình thường.
    /// </summary>
    [HttpPatch("{id}/variants/{variantId}/preorder")]
    public async Task<IActionResult> SetVariantPreOrder(Guid id, Guid variantId, SetVariantPreOrderDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new SetVariantPreOrder.Command { ProductId = id, VariantId = variantId, IsPreOrder = dto.IsPreOrder }, ct));
    }

    // ────────────────────────── PRODUCT IMAGES ──────────────────────────

    /// <summary>
    /// Thêm product-level image (lifestyle/catalog). Không dùng cho images của variant cụ thể.
    /// Upload file trước qua POST /api/uploads/image để lấy ImageUrl.
    /// </summary>
    [HttpPost("{id}/images")]
    public async Task<ActionResult<Guid>> AddProductImage(Guid id, AddProductImageDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new AddProductImage.Command { ProductId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Soft delete một image (IsDeleted = true). Dùng cho cả product-level và variant-level.
    /// </summary>
    [HttpDelete("{id}/images/{imageId}")]
    public async Task<IActionResult> DeleteProductImage(Guid id, Guid imageId, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new DeleteProductImage.Command { ProductId = id, ImageId = imageId }, ct));
    }

    /// <summary>
    /// Sắp xếp lại thứ tự ảnh của Product.
    /// </summary>
    [HttpPut("{id}/images/reorder")]
    public async Task<IActionResult> ReorderProductImages(Guid id, ReorderImagesDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new ReorderProductImages.Command { ProductId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Cập nhật ModelUrl cho một ảnh đã có (dùng chung cho product-level và variant-level).
    /// Truyền ModelUrl = null để xóa 3D model khỏi ảnh này.
    /// </summary>
    [HttpPatch("{id}/images/{imageId}/model-url")]
    public async Task<IActionResult> UpdateImageModelUrl(Guid id, Guid imageId, UpdateImageModelUrlDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateImageModelUrl.Command { ProductId = id, ImageId = imageId, Dto = dto }, ct));
    }


    // ────────────────────────── VARIANT IMAGES ──────────────────────────

    /// <summary>
    /// Thêm variant-level image (ảnh màu sắc / góc chụp của variant cụ thể).
    /// Upload file trước qua POST /api/uploads/image để lấy ImageUrl.
    /// </summary>
    [HttpPost("{id}/variants/{variantId}/images")]
    public async Task<ActionResult<Guid>> AddVariantImage(Guid id, Guid variantId, AddVariantImageDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new AddVariantImage.Command { ProductId = id, VariantId = variantId, Dto = dto }, ct));
    }

    /// <summary>
    /// Sắp xếp lại thứ tự ảnh của một Variant cụ thể. Phải truyền đầy đủ tất cả ImageId của variant đó.
    /// </summary>
    [HttpPut("{id}/variants/{variantId}/images/reorder")]
    public async Task<IActionResult> ReorderVariantImages(Guid id, Guid variantId, ReorderImagesDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new ReorderVariantImages.Command { ProductId = id, VariantId = variantId, Dto = dto }, ct));
    }

    // ────────────────────── LENS VARIANT ATTRIBUTES ──────────────────────

    /// <summary>
    /// Tạo hoặc cập nhật thông số quang học (SPH, CYL, AXIS, Index, LensDesign) cho một Lens variant.
    /// </summary>
    [HttpPut("{id}/variants/{variantId}/lens-attributes")]
    public async Task<ActionResult<LensVariantAttributeDto>> SetLensVariantAttribute(
        Guid id, Guid variantId, UpsertLensVariantAttributeDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new SetLensVariantAttribute.Command { ProductId = id, VariantId = variantId, Dto = dto }, ct));
    }

    // ────────────────────── LENS COATING OPTIONS ─────────────────────────

    /// <summary>
    /// Thêm một coating option (UV, BlueLight...) vào Lens Product.
    /// </summary>
    [HttpPost("{id}/coating-options")]
    public async Task<ActionResult<LensCoatingOptionDto>> AddLensCoatingOption(
        Guid id, AddLensCoatingOptionDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new AddLensCoatingOption.Command { LensProductId = id, Dto = dto }, ct));
    }

    /// <summary>
    /// Cập nhật coating option. Partial update — chỉ cần truyền field muốn thay đổi.
    /// </summary>
    [HttpPatch("coating-options/{coatingId}")]
    public async Task<ActionResult<LensCoatingOptionDto>> UpdateLensCoatingOption(
        Guid coatingId, UpdateLensCoatingOptionDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new UpdateLensCoatingOption.Command { CoatingId = coatingId, Dto = dto }, ct));
    }

    /// <summary>
    /// Xóa vĩnh viễn coating option. Để ẩn tạm thời, dùng PATCH với IsActive = false.
    /// </summary>
    [HttpDelete("coating-options/{coatingId}")]
    public async Task<IActionResult> DeleteLensCoatingOption(Guid coatingId, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new DeleteLensCoatingOption.Command { CoatingId = coatingId }, ct));
    }

    // ───────────────────── FRAME↔LENS COMPATIBILITY ──────────────────────

    /// <summary>
    /// Lấy danh sách Lens Product tương thích với Frame Product.
    /// </summary>
    [HttpGet("{id}/compatible-lenses")]
    public async Task<ActionResult<List<CompatibleLensLinkDto>>> GetCompatibleLensLinks(Guid id, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new GetFrameCompatibleLensLinks.Query { FrameProductId = id }, ct));
    }

    /// <summary>
    /// Link một Lens Product vào Frame Product (thêm compatibility).
    /// </summary>
    [HttpPost("{id}/compatible-lenses")]
    public async Task<IActionResult> AddCompatibleLens(
        Guid id, AddFrameLensCompatibilityDto dto, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new AddFrameLensCompatibility.Command { FrameProductId = id, LensProductId = dto.LensProductId }, ct));
    }

    /// <summary>
    /// Xóa link tương thích giữa Frame Product và một Lens Product.
    /// </summary>
    [HttpDelete("{id}/compatible-lenses/{lensProductId}")]
    public async Task<IActionResult> RemoveCompatibleLens(Guid id, Guid lensProductId, CancellationToken ct)
    {
        return HandleResult(await Mediator.Send(
            new RemoveFrameLensCompatibility.Command { FrameProductId = id, LensProductId = lensProductId }, ct));
    }
}
