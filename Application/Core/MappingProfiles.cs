using System;
using Application.Activities.DTOs;
using Application.Carts.DTOs;
using Application.Categories.DTOs;
using Application.Profiles.DTOs;
using Application.Products.DTOs;
using AutoMapper;
using Domain;

namespace Application.Core;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Activity, Activity>();
        CreateMap<CreateActivityDto, Activity>();
        CreateMap<EditActivityDto, Activity>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
        //! is null-forgiving operator to tell compiler that this value will not be null
        //and may be throw exception if it is null at runtime.
        CreateMap<Activity, ActivityDto>()
            .ForMember(d => d.HostDisplayName, o => o.MapFrom(s => 
                s.Attendees.FirstOrDefault(x => x.IsHost)!.User.DisplayName))
            .ForMember(d => d.HostId, o => o.MapFrom(s => 
                s.Attendees.FirstOrDefault(x => x.IsHost)!.User.Id));
        CreateMap<ActivityAttendee, UserProfile>()
            .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.User.DisplayName))
            .ForMember(d => d.Bio, o => o.MapFrom(s => s.User.Bio))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s => s.User.ImageUrl))
            .ForMember(d => d.Id, o => o.MapFrom(s => s.User.Id));
        CreateMap<User, UserProfile>();

        // Product mappings
        CreateMap<ProductCategory, ProductCategoryDto>();
        
        CreateMap<ProductImage, ProductImageDto>();
        
        CreateMap<ProductVariant, ProductVariantDto>()
            .ForMember(d => d.QuantityAvailable, o => o.MapFrom(s => 
                s.Stock != null ? s.Stock.QuantityAvailable : 0))
            .ForMember(d => d.Images, o => o.MapFrom(s => 
                s.Images.OrderBy(i => i.DisplayOrder)));
        
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.Variants, o => o.MapFrom(s => 
                s.Variants.Where(v => v.IsActive)))
            .ForMember(d => d.Images, o => o.MapFrom(s => 
                s.Images.Where(i => !i.IsDeleted && i.ProductId != null)
                    .OrderBy(i => i.DisplayOrder)));
        
        CreateMap<Product, ProductListDto>()
            .ForMember(d => d.MinPrice, o => o.MapFrom(s => 
                s.Variants.Any(v => v.IsActive) ? s.Variants.Where(v => v.IsActive).Min(v => v.Price) : 0))
            .ForMember(d => d.MaxPrice, o => o.MapFrom(s => 
                s.Variants.Any(v => v.IsActive) ? (decimal?)s.Variants.Where(v => v.IsActive).Max(v => v.Price) : null))
            .ForMember(d => d.TotalQuantityAvailable, o => o.MapFrom(s => 
                s.Variants.Where(v => v.IsActive && v.Stock != null)
                    .Sum(v => v.Stock!.QuantityAvailable)))
            .ForMember(d => d.FirstImage, o => o.MapFrom(s => 
                s.Images.Where(i => !i.IsDeleted && i.ProductId != null)
                    .OrderBy(i => i.DisplayOrder)
                    .FirstOrDefault()));
        
        // Cart mappings
        CreateMap<Cart, CartDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.TotalItems, o => o.MapFrom(s => s.Items.Sum(i => i.Quantity)))
            .ForMember(d => d.TotalPrice, o => o.MapFrom(s => 
                s.Items.Sum(i => i.Quantity * i.ProductVariant.Price)));
        
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.Sku, o => o.MapFrom(s => s.ProductVariant.SKU))
            .ForMember(d => d.Price, o => o.MapFrom(s => s.ProductVariant.Price))
            .ForMember(d => d.CompareAtPrice, o => o.MapFrom(s => s.ProductVariant.CompareAtPrice))
            .ForMember(d => d.Color, o => o.MapFrom(s => s.ProductVariant.Color))
            .ForMember(d => d.Size, o => o.MapFrom(s => s.ProductVariant.Size))
            .ForMember(d => d.Material, o => o.MapFrom(s => s.ProductVariant.Material))
            .ForMember(d => d.QuantityAvailable, o => o.MapFrom(s => 
                s.ProductVariant.Stock != null ? s.ProductVariant.Stock.QuantityAvailable : 0))
            .ForMember(d => d.IsInStock, o => o.MapFrom(s => 
                s.ProductVariant.Stock != null && s.ProductVariant.Stock.QuantityAvailable > 0))
            .ForMember(d => d.ProductId, o => o.MapFrom(s => s.ProductVariant.ProductId))
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.ProductVariant.Product.ProductName))
            .ForMember(d => d.ProductImageUrl, o => o.MapFrom(s => 
                s.ProductVariant.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault() != null
                    ? s.ProductVariant.Images.OrderBy(i => i.DisplayOrder).First().ImageUrl
                    : s.ProductVariant.Product.Images
                        .Where(i => !i.IsDeleted && i.ProductId != null)
                        .OrderBy(i => i.DisplayOrder)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()))
            .ForMember(d => d.Subtotal, o => o.MapFrom(s => s.Quantity * s.ProductVariant.Price));
    }
}
