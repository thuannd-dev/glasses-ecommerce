using System;
using Application.Activities.DTOs;
using Application.Addresses.DTOs;
using Application.Carts.DTOs;
using Application.Categories.DTOs;
using Application.Orders.DTOs;
using Application.Products.DTOs;
using Application.Profiles.DTOs;
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
                s.Items.Sum(i => i.Quantity * (i.ProductVariant != null ? i.ProductVariant.Price : 0))));

        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.Sku, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.SKU : null))
            .ForMember(d => d.Price, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.Price : 0))
            .ForMember(d => d.CompareAtPrice, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.CompareAtPrice : null))
            .ForMember(d => d.Color, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.Color : null))
            .ForMember(d => d.Size, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.Size : null))
            .ForMember(d => d.Material, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.Material : null))
            .ForMember(d => d.QuantityAvailable, o => o.MapFrom(s =>
                s.ProductVariant != null && s.ProductVariant.Stock != null ? s.ProductVariant.Stock.QuantityAvailable : 0))
            .ForMember(d => d.IsInStock, o => o.MapFrom(s =>
                s.ProductVariant != null && s.ProductVariant.Stock != null && s.ProductVariant.Stock.QuantityAvailable > 0))
            .ForMember(d => d.ProductId, o => o.MapFrom(s => s.ProductVariant != null ? s.ProductVariant.ProductId : Guid.Empty))
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.ProductVariant != null && s.ProductVariant.Product != null ? s.ProductVariant.Product.ProductName : null))
            .ForMember(d => d.ProductImageUrl, o => o.MapFrom(s =>
                s.ProductVariant != null && s.ProductVariant.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault() != null
                    ? s.ProductVariant.Images.OrderBy(i => i.DisplayOrder).First().ImageUrl
                    : s.ProductVariant != null && s.ProductVariant.Product != null
                        ? s.ProductVariant.Product.Images
                            .Where(i => !i.IsDeleted && i.ProductId != null)
                            .OrderBy(i => i.DisplayOrder)
                            .Select(i => i.ImageUrl)
                            .FirstOrDefault()
                        : null))
            .ForMember(d => d.Subtotal, o => o.MapFrom(s => s.Quantity * (s.ProductVariant != null ? s.ProductVariant.Price : 0)));

        // Address mappings
        CreateMap<Address, AddressDto>();
        CreateMap<CreateAddressDto, Address>();
        CreateMap<UpdateAddressDto, Address>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore());

        // Order mappings
        CreateMap<Order, StaffOrderListDto>()
            .ForMember(d => d.OrderSource, o => o.MapFrom(s => s.OrderSource.ToString()))
            .ForMember(d => d.OrderType, o => o.MapFrom(s => s.OrderType.ToString()))
            .ForMember(d => d.OrderStatus, o => o.MapFrom(s => s.OrderStatus.ToString()))
            .ForMember(d => d.FinalAmount, o => o.MapFrom(s =>
                s.TotalAmount + s.ShippingFee - s.PromoUsageLogs.Sum(p => p.DiscountApplied)))
            .ForMember(d => d.SalesStaffName, o => o.MapFrom(s =>
                s.SalesStaff != null ? s.SalesStaff.DisplayName : null))
            .ForMember(d => d.ItemCount, o => o.MapFrom(s => s.OrderItems.Count));

        CreateMap<Order, StaffOrderDto>()
            .ForMember(d => d.OrderSource, o => o.MapFrom(s => s.OrderSource.ToString()))
            .ForMember(d => d.OrderType, o => o.MapFrom(s => s.OrderType.ToString()))
            .ForMember(d => d.OrderStatus, o => o.MapFrom(s => s.OrderStatus.ToString()))
            .ForMember(d => d.FinalAmount, o => o.MapFrom(s =>
                s.TotalAmount + s.ShippingFee - s.PromoUsageLogs.Sum(p => p.DiscountApplied)))
            .ForMember(d => d.DiscountApplied, o => o.MapFrom(s =>
                s.PromoUsageLogs.Sum(p => p.DiscountApplied) > 0
                    ? (decimal?)s.PromoUsageLogs.Sum(p => p.DiscountApplied)
                    : null))
            .ForMember(d => d.SalesStaffName, o => o.MapFrom(s =>
                s.SalesStaff != null ? s.SalesStaff.DisplayName : null))
            .ForMember(d => d.Items, o => o.MapFrom(s => s.OrderItems))
            .ForMember(d => d.Payment, o => o.MapFrom(s => s.Payments.FirstOrDefault()))
            .ForMember(d => d.Prescription, o => o.MapFrom(s => s.Prescription))
            .ForMember(d => d.Shipment, o => o.MapFrom(s => s.ShipmentInfo))
            .ForMember(d => d.StatusHistories, o => o.MapFrom(s =>
                s.StatusHistories.OrderBy(h => h.CreatedAt)));

        CreateMap<OrderItem, OrderItemOutputDto>()
            .ForMember(d => d.Sku, o => o.MapFrom(s =>
                s.ProductVariant != null ? s.ProductVariant.SKU : null))
            .ForMember(d => d.VariantName, o => o.MapFrom(s =>
                s.ProductVariant != null ? s.ProductVariant.VariantName : null))
            .ForMember(d => d.ProductName, o => o.MapFrom(s =>
                s.ProductVariant != null && s.ProductVariant.Product != null
                    ? s.ProductVariant.Product.ProductName : null))
            .ForMember(d => d.TotalPrice, o => o.MapFrom(s => s.Quantity * s.UnitPrice));

        CreateMap<Payment, OrderPaymentDto>()
            .ForMember(d => d.PaymentMethod, o => o.MapFrom(s => s.PaymentMethod.ToString()))
            .ForMember(d => d.PaymentStatus, o => o.MapFrom(s => s.PaymentStatus.ToString()));

        CreateMap<Prescription, OrderPrescriptionDto>();

        CreateMap<OrderStatusHistory, OrderStatusHistoryDto>()
            .ForMember(d => d.FromStatus, o => o.MapFrom(s => s.FromStatus.ToString()))
            .ForMember(d => d.ToStatus, o => o.MapFrom(s => s.ToStatus.ToString()));

        CreateMap<ShipmentInfo, ShipmentInfoDto>()
            .ForMember(d => d.CarrierName, o => o.MapFrom(s => s.CarrierName.ToString()));

        CreateMap<PrescriptionDetail, PrescriptionDetailOutputDto>()
            .ForMember(d => d.Eye, o => o.MapFrom(s => s.Eye.ToString()));

        // Customer order mappings
        CreateMap<Order, CustomerOrderDto>()
            .ForMember(d => d.OrderSource, o => o.MapFrom(s => s.OrderSource.ToString()))
            .ForMember(d => d.OrderType, o => o.MapFrom(s => s.OrderType.ToString()))
            .ForMember(d => d.OrderStatus, o => o.MapFrom(s => s.OrderStatus.ToString()))
            .ForMember(d => d.FinalAmount, o => o.MapFrom(s =>
                s.TotalAmount + s.ShippingFee - s.PromoUsageLogs.Sum(p => p.DiscountApplied)))
            .ForMember(d => d.DiscountApplied, o => o.MapFrom(s =>
                s.PromoUsageLogs.Sum(p => p.DiscountApplied) > 0
                    ? (decimal?)s.PromoUsageLogs.Sum(p => p.DiscountApplied)
                    : null))
            .ForMember(d => d.Items, o => o.MapFrom(s => s.OrderItems))
            .ForMember(d => d.Payment, o => o.MapFrom(s => s.Payments.FirstOrDefault()))
            .ForMember(d => d.Prescription, o => o.MapFrom(s => s.Prescription))
            .ForMember(d => d.Shipment, o => o.MapFrom(s => s.ShipmentInfo))
            .ForMember(d => d.StatusHistories, o => o.MapFrom(s =>
                s.StatusHistories.OrderBy(h => h.CreatedAt)));

        CreateMap<Order, CustomerOrderListDto>()
            .ForMember(d => d.OrderType, o => o.MapFrom(s => s.OrderType.ToString()))
            .ForMember(d => d.OrderStatus, o => o.MapFrom(s => s.OrderStatus.ToString()))
            .ForMember(d => d.FinalAmount, o => o.MapFrom(s =>
                s.TotalAmount + s.ShippingFee - s.PromoUsageLogs.Sum(p => p.DiscountApplied)))
            .ForMember(d => d.ItemCount, o => o.MapFrom(s => s.OrderItems.Count));
    }
}
